/**
 * Prompt template for explaining concepts in Hinglish
 */
const explainPrompt = (concept) => {
  return `Please explain the following concept in Hinglish (a mix of Hindi and English). Make it easy to understand for students. Use simple language and include examples if possible:

Concept: ${concept}

Please provide:
- Simple explanation in Hinglish
- Real-life examples if applicable
- Key points to remember
- Common mistakes to avoid`;
};

module.exports = explainPrompt;
