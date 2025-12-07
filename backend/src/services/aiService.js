import { GoogleGenAI } from "@google/genai";

async function generateSummaryFromLLM(text) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("GEMINI_API_KEY not set, returning dummy summary.");
    return "AI summary is not configured yet.";
  }

  // Initialize the client
  const ai = new GoogleGenAI({ apiKey: apiKey });

  const prompt = `
    You are an accessibility assistant. Summarize this web page content in simple, clear language for a user with motor impairments:
    "${text}"
  `;

  try {
    // Call the API
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash", // or 'gemini-1.5-flash'
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        maxOutputTokens: 300,
      },
    });

    // The new SDK simplifies response parsing
    const summary = response.text || "No summary generated.";
    return summary;
  } catch (err) {
    console.error("Gemini API error:", err);
    return "Failed to generate AI summary.";
  }
}

export { generateSummaryFromLLM };
