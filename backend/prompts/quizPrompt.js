/**
 * Prompt template for generating MCQ quiz
 */
const quizPrompt = (text) => {
  return `Generate 10 multiple choice questions (MCQs) from the following text. Each question should have 4 options and one correct answer. Return the response in the following JSON format:

[
  {
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A"
  }
]

Text:
${text}

Please ensure:
- Questions test understanding of key concepts
- Options are plausible and not obviously wrong
- Correct answers are clearly identifiable
- Response is valid JSON format`;
};

module.exports = quizPrompt;
