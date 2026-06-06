const axios = require('axios');

/**
 * Safe JSON parser that handles Groq's actual response format
 */
function extractJson(content) {
  if (!content) throw new Error("Empty AI content");

  const cleaned = content
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // Try to find JSON object
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON found in AI content");
    
    try {
      return JSON.parse(match[0]);
    } catch (e2) {
      throw new Error(`JSON parse error: ${e2.message}`);
    }
  }
}

/**
 * Validate a single question
 */
const validateQuestion = (q) => {
  if (!q) return false;

  const question = q.question || q.text;
  const questionText = question ? question.trim() : "";
  
  if (questionText.length < 10) return false;

  // Options must be an array with exactly 4 elements
  let options = q.options;
  if (!Array.isArray(options)) return false;
  if (options.length !== 4) return false;

  // Check that all options are strings
  if (!options.every(opt => typeof opt === 'string')) return false;

  // Check that correctAnswer exists and is one of the options
  if (!q.correctAnswer) return false;
  if (!options.includes(q.correctAnswer)) return false;

  // Check explanation exists
  if (!q.explanation) return false;

  return true;
};

/**
 * Generate MCQs from subject and topic using Groq AI
 */
const generateQuizFromTopic = async (subject, topic, questionCount, difficulty = 'Mixed') => {
  try {
    console.log(`=== GENERATING QUIZ WITH GROQ ===`);
    console.log(`Subject: ${subject}`);
    console.log(`Topic: ${topic}`);
    console.log(`Question Count: ${questionCount}`);
    console.log(`Difficulty: ${difficulty}`);

    const prompt = `Generate exactly ${questionCount} multiple-choice questions about ${topic} in ${subject}.

Each question must have:
- A complete and meaningful question text
- Exactly 4 answer options (as a JSON array)
- One correct answer (the exact text of the correct option)
- A short explanation

Return ONLY valid JSON in this exact format:
{
  "title": "${topic} Quiz",
  "subject": "${subject}",
  "topic": "${topic}",
  "questions": [
    {
      "question": "Full question text here",
      "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
      "correctAnswer": "Option A text",
      "explanation": "Short explanation here"
    }
  ]
}

NO markdown, NO code blocks, NO explanations outside JSON. Return ONLY the JSON object.`;

    console.log('Calling Groq API with llama-3.3-70b-versatile model...');

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are an expert exam paper setter. You generate ONLY valid JSON. Never include markdown code blocks or explanations outside the JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: "json_object" }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const aiContent = response.data?.choices?.[0]?.message?.content;
    console.log(`AI response received (${aiContent?.length || 0} chars)`);
    console.log('AI CONTENT SAMPLE:', aiContent?.substring(0, 500));

    if (!aiContent) {
      throw new Error("AI response is empty");
    }

    // Parse JSON safely
    let parsed;
    try {
      parsed = extractJson(aiContent);
      console.log("✅ JSON parsed successfully");
      console.log("PARSED JSON KEYS:", Object.keys(parsed));
    } catch (error) {
      console.error('❌ JSON parse error, retrying with stricter prompt...');
      
      // Retry with stricter prompt
      const strictPrompt = `Generate ${questionCount} multiple choice questions about ${topic} in ${subject}. Return ONLY a valid JSON object with this exact structure: {"questions": [{"question": "text", "options": ["A", "B", "C", "D"], "correctAnswer": "A", "explanation": "text"}]}. NO markdown, NO explanations.`;
      
      const retryResponse = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: "Return ONLY valid JSON. NO markdown." },
            { role: "user", content: strictPrompt }
          ],
          temperature: 0.3,
          max_tokens: 4000,
          response_format: { type: "json_object" }
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      const retryContent = retryResponse.data?.choices?.[0]?.message?.content;
      if (!retryContent) {
        throw new Error("AI retry failed - no content");
      }
      
      parsed = extractJson(retryContent);
      console.log("✅ JSON parsed on retry");
    }
    
    const questions = parsed.questions || [];
    console.log(`Extracted ${questions.length} questions from AI`);

    if (!questions || questions.length === 0) {
      throw new Error("No questions in AI response");
    }

    // Validate and format questions
    const validQuestions = questions.filter(q => validateQuestion(q)).map(q => {
      return {
        question: q.question.trim(),
        options: q.options, // Already an array
        correctAnswer: q.correctAnswer.trim(),
        explanation: q.explanation.trim(),
        difficulty: difficulty || 'Medium'
      };
    });

    console.log(`Validated ${validQuestions.length} questions`);

    if (validQuestions.length === 0) {
      throw new Error("Could not generate any valid questions");
    }

    // Return up to requested number of questions
    const finalQuestions = validQuestions.slice(0, questionCount);

    console.log(`✅ Returning ${finalQuestions.length} valid questions`);

    return {
      title: `${topic} Quiz`,
      subject,
      topic,
      questions: finalQuestions,
      totalQuestions: finalQuestions.length
    };

  } catch (error) {
    console.error('❌ Error generating quiz from topic:', error.message);
    if (error.response) {
      console.error('Groq API Error:', error.response.data);
    }
    throw error;
  }
};

module.exports = {
  generateQuizFromTopic,
};
