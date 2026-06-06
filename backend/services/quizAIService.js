const axios = require('axios');

/**
 * Clean and chunk PDF text for AI processing
 */
const chunkPdfText = (extractedText) => {
  if (!extractedText || extractedText.length < 1000) {
    throw new Error('PDF text is too short or unreadable.');
  }

  const cleanText = extractedText.replace(/\s+/g, " ").trim();

  // Create smaller chunks for 5 questions each
  const chunks = [];
  const chunkSize = 5000;
  
  for (let i = 0; i < cleanText.length; i += chunkSize) {
    const chunk = cleanText.slice(i, i + chunkSize);
    if (chunk.length > 500) { // Minimum chunk size
      chunks.push(chunk);
    }
  }

  if (chunks.length === 0) {
    throw new Error('PDF text is too short or unreadable.');
  }

  return chunks;
};

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

  // Handle both formats
  const question = q.question || q.text;
  const questionText = question ? question.trim() : "";
  
  if (questionText.length < 10) return false;

  // Handle both option formats
  let options = q.options;
  if (Array.isArray(options) && options.length > 0) {
    // Array of objects or strings
    return true;
  } else if (typeof options === 'object' && options !== null) {
    // Object format {A: "...", B: "..."}
    const optionValues = Object.values(options);
    return optionValues.length === 4;
  }

  return false;
};

/**
 * Generate MCQs from a single text chunk
 */
const generateQuestionsFromChunk = async (chunk, retryCount = 0) => {
  const prompt = `Return ONLY valid JSON. No markdown.

Generate exactly 5 multiple-choice questions from this study material.

JSON format MUST be:
{
  "questions": [
    {
      "question": "Complete meaningful question?",
      "options": {
        "A": "Option A",
        "B": "Option B", 
        "C": "Option C",
        "D": "Option D"
      },
      "correctAnswer": "A",
      "explanation": "Explanation",
      "difficulty": "Easy"
    }
  ]
}

Rules:
- EXACTLY this JSON format
- options must be object with A, B, C, D keys
- correctAnswer must be A, B, C, or D
- No placeholder questions
- Use only this material

Study material:
${chunk}`;

  try {
    console.log(`Generating from chunk (${chunk.length} chars)...`);

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
        temperature: 0.3,
        max_tokens: 2000,
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

    if (!aiContent) {
      throw new Error("AI response is empty");
    }

    console.log("AI CONTENT SAMPLE:", aiContent.substring(0, 500));

    const parsed = extractJson(aiContent);
    console.log("PARSED JSON KEYS:", Object.keys(parsed));
    
    const questions = parsed.questions || [];
    console.log(`Extracted ${questions.length} questions from AI`);

    if (!questions || questions.length === 0) {
      throw new Error("No questions in AI response");
    }

    // Validate and format questions
    const validQuestions = questions.filter(q => validateQuestion(q)).map(q => {
      // Convert options to array format
      let optionsArray;
      let correctAnswer;
      
      if (Array.isArray(q.options)) {
        if (typeof q.options[0] === 'object') {
          // Format: [{id:1, text:"...", correct:true}, ...]
          optionsArray = q.options.map(opt => opt.text || opt);
          const correctOption = q.options.find(opt => opt.correct);
          correctAnswer = correctOption ? (correctOption.id || 1).toString() : "A";
        } else {
          // Format: ["Option A", "Option B", ...]
          optionsArray = q.options;
          correctAnswer = q.correctAnswer || "A";
        }
      } else if (typeof q.options === 'object') {
        // Object format {A: "...", B: "...", ...}
        optionsArray = Object.values(q.options);
        correctAnswer = q.correctAnswer || "A";
      } else {
        optionsArray = ["Option A", "Option B", "Option C", "Option D"];
        correctAnswer = "A";
      }

      // Map correctAnswer to A/B/C/D if needed
      const answerMap = {1: "A", 2: "B", 3: "C", 4: "D"};
      if (answerMap[correctAnswer]) {
        correctAnswer = answerMap[correctAnswer];
      }

      return {
        question: (q.question || q.text || "").trim(),
        options: optionsArray,
        correctAnswer: correctAnswer.toUpperCase(),
        explanation: (q.explanation || "Explanation not provided.").trim(),
        difficulty: q.difficulty || 'Medium'
      };
    });

    console.log(`Validated ${validQuestions.length} questions from chunk`);

    if (validQuestions.length === 0 && retryCount < 1) {
      console.log("No valid questions, retrying...");
      return generateQuestionsFromChunk(chunk, retryCount + 1);
    }

    return validQuestions;

  } catch (error) {
    console.error('Error generating from chunk:', error.message);
    if (retryCount < 1) {
      console.log('Retrying chunk generation...');
      return generateQuestionsFromChunk(chunk, retryCount + 1);
    }
    throw error;
  }
};

/**
 * Generate 30 MCQs from extracted text using chunking strategy
 */
const generateQuizFromText = async (extractedText, noteTitle) => {
  try {
    const chunks = chunkPdfText(extractedText);
    console.log(`PDF text split into ${chunks.length} chunks`);

    let validQuestions = [];

    // Generate questions in multiple rounds using round-robin chunking
    // Max 6 rounds, cycling through chunks until we have 30 questions
    const maxRounds = 6;
    
    for (let round = 1; round <= maxRounds; round++) {
      console.log(`=== Round ${round}/${maxRounds} ===`);
      console.log(`Current valid questions: ${validQuestions.length}`);
      
      // Select chunk using round-robin (cycle through chunks)
      const chunkIndex = (round - 1) % chunks.length;
      const chunk = chunks[chunkIndex];
      
      console.log(`Using chunk ${chunkIndex + 1}/${chunks.length} (${chunk.length} chars)`);
      
      try {
        const chunkQuestions = await generateQuestionsFromChunk(chunk);
        console.log(`Round ${round}: Generated ${chunkQuestions.length} questions`);
        
        // Add new questions
        validQuestions = validQuestions.concat(chunkQuestions);
        
        // Remove duplicate questions
        const uniqueQuestions = [];
        const seenQuestions = new Set();
        
        for (const q of validQuestions) {
          if (!seenQuestions.has(q.question)) {
            seenQuestions.add(q.question);
            uniqueQuestions.push(q);
          }
        }
        
        validQuestions = uniqueQuestions;
        console.log(`After deduplication: ${validQuestions.length} unique questions`);
        
        // Stop if we have enough questions
        if (validQuestions.length >= 30) {
          console.log(`Reached target of 30 questions, stopping generation`);
          break;
        }
      } catch (error) {
        console.error(`Round ${round} failed:`, error.message);
        // Continue with next round even if this one fails
      }
    }

    console.log(`=== Generation Complete ===`);
    console.log(`Total valid questions: ${validQuestions.length}`);

    // Only fail if we have NO questions at all
    if (validQuestions.length === 0) {
      throw new Error("Could not generate any valid questions from PDF");
    }

    // Return up to 30 questions (or fewer if that's all we got)
    const finalQuestions = validQuestions.slice(0, 30);

    console.log(`Returning ${finalQuestions.length} questions`);

    return {
      title: `Quiz based on ${noteTitle}`,
      questions: finalQuestions,
      totalQuestions: finalQuestions.length
    };

  } catch (error) {
    console.error('Error generating quiz from AI:', error.message);
    throw error;
  }
};

module.exports = {
  generateQuizFromText,
};