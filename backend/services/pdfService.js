const fs = require('fs').promises;
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Extract text from uploaded file
 * Supports PDF, DOCX, and TXT files
 */
const extractTextFromFile = async (filePath, mimeType, originalName) => {
  try {
    let extractedText = '';

    // Check file extension
    const extension = originalName.split('.').pop().toLowerCase();

    if (extension === 'pdf') {
      // Extract text from PDF
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdfParse(dataBuffer);
      extractedText = data.text;
    } else if (extension === 'docx') {
      // Extract text from DOCX
      const dataBuffer = await fs.readFile(filePath);
      const result = await mammoth.extractRawText({ buffer: dataBuffer });
      extractedText = result.value;
    } else if (extension === 'txt') {
      // Read text file
      extractedText = await fs.readFile(filePath, 'utf-8');
    } else {
      throw new Error('Unsupported file format. Please upload PDF, DOCX, or TXT files.');
    }

    // Clean up the extracted text
    extractedText = extractedText
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '') // Remove control characters but keep text
      .trim();

    // Check if extracted text is empty or too short
    if (extractedText.length < 50) {
      throw new Error('Could not extract sufficient text from this file. The file might be empty, password-protected, or contain only images.');
    }

    return extractedText;
  } catch (error) {
    console.error('Error extracting text from file:', error);
    throw new Error(`Could not extract text from this file: ${error.message}`);
  }
};

/**
 * Chunk text into smaller pieces for AI processing
 */
const chunkText = (text, chunkSize = 3000) => {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
};

module.exports = {
  extractTextFromFile,
  chunkText,
};