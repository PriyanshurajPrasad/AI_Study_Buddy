const axios = require('axios');

/**
 * Check if API key is configured
 */
const isApiKeyConfigured = () => {
  const apiKey = process.env.GROQ_API_KEY;
  console.log('Groq API Key configured:', !!apiKey);
  return apiKey && apiKey !== 'your_groq_api_key_here' && apiKey !== '';
};

/**
 * Generate summary of text using Groq AI
 */
const generateSummary = async (text) => {
  try {
    if (!isApiKeyConfigured()) {
      console.log('API key not configured, using fallback summary');
      return "Here's a summary of the content:\n\n• Main concept covered in the text\n• Key points and important details\n• Summary of the information presented\n\n(Note: This is a fallback summary. Configure Groq API key for AI-generated summaries.)";
    }

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant that provides concise and clear summaries in bullet points, highlighting key concepts.'
          },
          {
            role: 'user',
            content: `Please provide a concise and clear summary of the following text. The summary should be in bullet points and highlight the key concepts:\n\n${text}\n\nPlease provide the summary in a structured format.`
          }
        ],
        temperature: 0.5,
        max_tokens: 1024,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices?.[0]?.message?.content || "Summary generation failed";
  } catch (error) {
    console.error('Error generating summary:', error.message);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      code: error.code
    });
    // Return fallback instead of throwing
    return "Here's a summary of the content:\n\n• Main concept covered in the text\n• Key points and important details\n• Summary of the information presented\n\n(Note: AI service unavailable, using fallback summary.)";
  }
};

/**
 * Explain a concept using Groq AI
 */
const generateExplanation = async (question, language = 'english') => {
  try {
    if (!isApiKeyConfigured()) {
      console.log('API key not configured, throwing error');
      throw new Error('AI service is currently unavailable. Please check GROQ_API_KEY in .env file.');
    }

    const languagePrompt = language === 'hinglish'
      ? 'You are an expert AI tutor specializing in explaining complex topics in simple, easy-to-understand Hinglish (mix of Hindi and English) for students. Your explanations should be detailed, engaging, and educational.'
      : 'You are an expert teacher and technical mentor. Answer the user\'s question accurately in clear English.';

    const languageRequirements = language === 'hinglish'
      ? `Requirements:
- Explain in easy-to-understand Hinglish (mix of Hindi and English)
- Use clear headings and bullet points
- Add real-life examples to make it relatable
- Include important interview points for students
- Add practical applications
- Add code example if topic is technical
- End with a short summary
- Make explanation engaging and student-friendly`
      : `Rules:
1. Give the actual correct answer, not generic filler.
2. Use simple beginner-friendly English.
3. Use proper headings.
4. Explain step by step.
5. Add examples.
6. Add important points.
7. Add real-world use cases if relevant.
8. Add code only if the topic needs code.
9. End with a short summary.
10. Do not use Hinglish unless language is explicitly set to "hinglish".`;

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `${languagePrompt} Your explanations should be detailed, accurate, and educational.`
          },
          {
            role: 'user',
            content: `${languageRequirements}

Question: ${question}

Please provide a detailed, accurate, and well-structured explanation.`
          }
        ],
        temperature: 0.7,
        max_tokens: 4096,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices?.[0]?.message?.content || 'Explanation generation failed';
  } catch (error) {
    console.error('Error generating explanation:', error.message);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      code: error.code,
      data: error.response?.data
    });
    throw new Error('AI service is currently unavailable. Please try again.');
  }
};

/**
 * Generate MCQ quiz from text using Groq AI
 */
const generateQuiz = async (text) => {
  try {
    if (!isApiKeyConfigured()) {
      console.log('API key not configured, using fallback quiz');
      return [
        {
          "question": "What is the main concept discussed in the text?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": "Option A"
        },
        {
          "question": "Which of the following is NOT mentioned in the content?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": "Option B"
        },
        {
          "question": "According to the text, what is the primary purpose?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": "Option C"
        }
      ];
    }

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant that generates multiple choice questions in valid JSON format. Always return valid JSON arrays.'
          },
          {
            role: 'user',
            content: `Generate 10 multiple choice questions (MCQs) from the following text. Each question should have 4 options and one correct answer. Return the response in the following JSON format:\n\n[\n  {\n    "question": "Question text here",\n    "options": ["Option A", "Option B", "Option C", "Option D"],\n    "correctAnswer": "Option A"\n  }\n]\n\nText:\n${text}\n\nPlease ensure the response is valid JSON format only, without any markdown or extra text.`
          }
        ],
        temperature: 0.5,
        max_tokens: 4096,
        response_format: { type: "json_object" }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const quizText = response.data.choices?.[0]?.message?.content || '[]';
    
    // Parse the JSON response
    // Remove markdown code blocks if present
    const cleanJson = quizText.replace(/```json\n?|\n?```/g, '').trim();
    
    // Handle case where response might be wrapped in quotes
    let quiz;
    try {
      quiz = JSON.parse(cleanJson);
    } catch (e) {
      // Try to extract JSON if it's wrapped in other text
      const jsonMatch = cleanJson.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        quiz = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse JSON response');
      }
    }

    return quiz;
  } catch (error) {
    console.error('Error generating quiz:', error.message);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      code: error.code
    });
    // Return fallback instead of throwing
    return [
      {
        "question": "What is the main concept discussed in the text?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": "Option A"
      },
      {
        "question": "Which of the following is NOT mentioned in the content?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": "Option B"
      },
      {
        "question": "According to the text, what is the primary purpose?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": "Option C"
      }
    ];
  }
};

/**
 * Generate viva questions from text using Groq AI
 */
const generateViva = async (text) => {
  try {
    if (!isApiKeyConfigured()) {
      console.log('API key not configured, using fallback viva questions');
      return [
        {
          "question": "Can you explain the main concept from the text?",
          "answer": "The main concept discussed is about the core topic covered in the material."
        },
        {
          "question": "What are the key components mentioned?",
          "answer": "The key components include the main elements that make up the system or concept."
        },
        {
          "question": "How would you apply this in a real scenario?",
          "answer": "This can be applied by implementing the concepts in practical situations."
        }
      ];
    }

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant that generates viva/oral questions in valid JSON format for oral examinations.'
          },
          {
            role: 'user',
            content: `Generate 10 viva/oral questions from the following text. These questions should be suitable for oral examination and test understanding. Return the response in the following JSON format:\n\n[\n  {\n    "question": "Question text here",\n    "answer": "Expected answer here"\n  }\n]\n\nText:\n${text}\n\nPlease ensure the response is valid JSON format only, without any markdown or extra text.`
          }
        ],
        temperature: 0.5,
        max_tokens: 4096,
        response_format: { type: "json_object" }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const vivaText = response.data.choices?.[0]?.message?.content || '[]';
    
    // Parse the JSON response
    // Remove markdown code blocks if present
    const cleanJson = vivaText.replace(/```json\n?|\n?```/g, '').trim();
    
    // Handle case where response might be wrapped in quotes
    let vivaQuestions;
    try {
      vivaQuestions = JSON.parse(cleanJson);
    } catch (e) {
      // Try to extract JSON if it's wrapped in other text
      const jsonMatch = cleanJson.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        vivaQuestions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse JSON response');
      }
    }

    return vivaQuestions;
  } catch (error) {
    console.error('Error generating viva questions:', error.message);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      code: error.code
    });
    // Return fallback instead of throwing
    return [
      {
        "question": "Can you explain the main concept from the text?",
        "answer": "The main concept discussed is about the core topic covered in the material."
      },
      {
        "question": "What are the key components mentioned?",
        "answer": "The key components include the main elements that make up the system or concept."
      },
      {
        "question": "How would you apply this in a real scenario?",
        "answer": "This can be applied by implementing the concepts in practical situations."
      }
    ];
  }
};

/**
 * Ask a study doubt/question using Groq AI
 */
const askQuestion = async (question) => {
  try {
    if (!isApiKeyConfigured()) {
      console.log('API key not configured, throwing error');
      throw new Error('AI service is currently unavailable. Please check GROQ_API_KEY in .env file.');
    }

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant that answers study-related questions in a clear and detailed manner. Include code examples if the question is about programming.'
          },
          {
            role: 'user',
            content: `Please answer the following study-related question in a clear and detailed manner. If the question is about programming, include code examples if helpful.\n\nQuestion: ${question}\n\nPlease provide a comprehensive answer.`
          }
        ],
        temperature: 0.7,
        max_tokens: 2048,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices?.[0]?.message?.content || 'Answer generation failed';
  } catch (error) {
    console.error('Error answering question:', error.message);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      code: error.code
    });
    throw new Error('AI service is currently unavailable. Please try again.');
  }
};

module.exports = {
  generateSummary,
  generateExplanation,
  generateQuiz,
  generateViva,
  askQuestion,
};
