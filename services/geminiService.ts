
import { GoogleGenAI } from "@google/genai";

export const analyzeContent = async (content: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze the following content extracted from a QR code and provide a brief summary of what it is and any potential security risks if it's a URL. Content: "${content}"`,
      config: {
        systemInstruction: "You are a security-focused AI assistant that helps users understand QR code content safely and quickly.",
        maxOutputTokens: 200,
      }
    });

    return response.text;
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return "Analysis unavailable at this moment.";
  }
};
