// Gemini AI : 
const { GoogleGenAI } = require("@google/genai");
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const getAiResponse = async(prompt) => {
    const aiResponse = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
    });

    return aiResponse;
}

module.exports = getAiResponse

