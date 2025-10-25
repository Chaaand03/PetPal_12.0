// api/check.js
// Use CommonJS syntax (module.exports) for max compatibility on Vercel
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Get the API key from Vercel's environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use module.exports instead of export default
module.exports = async (request, response) => {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Only POST requests allowed' });
  }
  
  const { food } = request.body;

  if (!food) {
    return response.status(400).json({ message: 'Missing "food" in request body' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // This is our "Safe Prompt"
    const prompt = `You are a helpful and cautious veterinary assistant. Your *only* job is to answer questions about the safety of human foods for common household pets (dogs, cats). 
    
    Answer for both dogs and cats if possible.
    Your answers must be short (3 sentences max), clear, and prioritize safety. 
    - If a food is dangerous, say so immediately (e.g., "NO, this is toxic.").
    - If it's safe, provide serving suggestions or warnings (e.g., "Yes, in small amounts, but remove the seeds.").
    - If you don't know, say you are unsure.
    
    The user's question is about: "${food}"`;

    const result = await model.generateContent(prompt);
    const aiResponse = await result.response;
    const text = aiResponse.text();

    // Send the AI's clean text back to the Creao app
    response.status(200).json({ message: text });
  
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: "Error communicating with AI" });
  }
};