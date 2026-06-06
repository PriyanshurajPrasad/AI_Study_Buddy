const axios = require('axios');

/**
 * Safe JSON parser for Groq responses
 */
function parseAIJson(content) {
  if (!content) throw new Error("Empty AI response");

  const cleaned = content
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON found in AI response");
    return JSON.parse(match[0]);
  }
}

/**
 * Generate quiz from subject and topic using Groq AI
 */
const generateQuizFromTopic = async (subject, topic, questionCount, difficulty = 'Mixed') => {
  try {
    console.log("GENERATE TOPIC QUIZ BODY:", { subject, topic, questionCount, difficulty });

    const prompt = `You are an expert exam paper setter.

Generate exactly ${questionCount} multiple-choice questions.

Subject: ${subject}
Topic: ${topic}
Difficulty: ${difficulty}

Return ONLY valid JSON. No markdown. No explanation outside JSON.

JSON format:
{
  "questions": [
    {
      "question": "Complete meaningful question?",
      "options": {
        "A": "Meaningful option A",
        "B": "Meaningful option B",
        "C": "Meaningful option C",
        "D": "Meaningful option D"
      },
      "correctAnswer": "A",
      "explanation": "Short explanation",
      "difficulty": "Easy"
    }
  ]
}

Rules:
- Questions must be only from the given topic.
- Every question must be complete and meaningful.
- Do not generate placeholder questions like "Question 1".
- Do not generate dummy options like "Option A".
- Each question must have exactly 4 meaningful options.
- correctAnswer must be A, B, C, or D.
- Include explanation for every question.
- Mix easy, medium, and hard if difficulty is Mixed.`;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "You are an expert exam paper setter. Return ONLY the requested JSON format. No markdown, no explanation outside JSON."
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
    console.log("GROQ RESPONSE LENGTH:", aiContent?.length || 0);

    if (!aiContent) {
      throw new Error("AI response is empty");
    }

    const parsed = parseAIJson(aiContent);
    const questions = parsed.questions || [];
    console.log("PARSED QUESTIONS COUNT:", questions.length);

    if (!questions || questions.length === 0) {
      throw new Error("No questions in AI response");
    }

    // Normalize and validate questions
    const normalizedQuestions = questions.map(q => {
      const questionText = q.question || q.questionText || q.text || q.prompt || "";
      
      // Handle different option formats
      let options = {};
      if (typeof q.options === 'object' && q.options !== null) {
        if (Array.isArray(q.options)) {
          // Array format: ["Option A", "Option B", ...]
          options = {
            A: q.options[0] || "",
            B: q.options[1] || "",
            C: q.options[2] || "",
            D: q.options[3] || ""
          };
        } else {
          // Object format: {A: "...", B: "...", ...}
          options = {
            A: q.options.A || "",
            B: q.options.B || "",
            C: q.options.C || "",
            D: q.options.D || ""
          };
        }
      } else {
        options = { A: "", B: "", C: "", D: "" };
      }

      const correctAnswer = (q.correctAnswer || q.answer || q.correct || q.correct_option || "A").toUpperCase();
      const explanation = q.explanation || q.reason || q.solution || "Explanation not provided.";
      const diff = q.difficulty || difficulty || "Mixed";

      return {
        question: questionText,
        options,
        correctAnswer,
        explanation,
        difficulty: diff
      };
    });

    // Validate that we have at least some valid questions
    const validQuestions = normalizedQuestions.filter(q => 
      q.question && q.question.trim().length > 0 &&
      q.options.A && q.options.B && q.options.C && q.options.D &&
      ['A', 'B', 'C', 'D'].includes(q.correctAnswer.toUpperCase())
    );

    console.log("VALID QUESTIONS COUNT:", validQuestions.length);

    if (validQuestions.length === 0) {
      throw new Error("No valid questions generated");
    }

    // Return up to requested number of questions
    const finalQuestions = validQuestions.slice(0, questionCount);

    return {
      title: `${topic} Quiz`,
      subject,
      topic,
      questions: finalQuestions,
      totalQuestions: finalQuestions.length
    };

  } catch (error) {
    console.error('Error generating quiz from topic:', error.message);
    throw error;
  }
};

module.exports = {
  generateQuizFromTopic,
};
