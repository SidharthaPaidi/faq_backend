const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function translateText(text, targetLang) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // Example prompt (adjust as needed)
    const prompt = `Translate the following English text to ${targetLang}:\n\n"${text}"`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translated = response.text().trim().replace(/"/g, ''); // Clean up quotes
    
    return translated;
  } catch (error) {
    console.error('Translation failed. Falling back to English:', error);
    return text; // Fallback to original
  }
}

module.exports = { translateText };