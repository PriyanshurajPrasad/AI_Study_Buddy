/**
 * Prompt template for summarizing notes
 */
const summarizePrompt = (text) => {
  return `Please provide a concise and clear summary of the following text. The summary should be in bullet points and highlight the key concepts:

${text}

Please provide the summary in a structured format with:
- Main topics covered
- Key points
- Important definitions or formulas
- Any examples mentioned`;
};

module.exports = summarizePrompt;
