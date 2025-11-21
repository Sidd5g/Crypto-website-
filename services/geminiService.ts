import { GoogleGenAI } from "@google/genai";
import { GeminiAnalysisResult, GroundingSource } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeCryptoSentiment = async (coinName: string, currentPrice: string): Promise<GeminiAnalysisResult> => {
  const ai = getAiClient();
  
  const prompt = `
    Analyze the current market sentiment for ${coinName} (Current Price: $${currentPrice}).
    Search for the latest news, regulatory updates, and major influencer opinions from the last 24 hours.
    Provide a concise 3-bullet point summary of why the price might be moving.
    Do not use markdown formatting for the bullets, just plain text lines starting with "•".
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "Analysis unavailable.";
    
    // Extract grounding metadata
    const sources: GroundingSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({
            title: chunk.web.title,
            uri: chunk.web.uri
          });
        }
      });
    }

    return {
      markdown: text,
      sources: sources
    };
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      markdown: "Unable to perform AI analysis at this time. Please check your API key or try again later.",
      sources: []
    };
  }
};

export const streamChatResponse = async (
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  newMessage: string,
  onChunk: (text: string) => void
): Promise<GroundingSource[]> => {
  const ai = getAiClient();
  
  const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    history: history,
    config: {
      tools: [{ googleSearch: {} }],
    }
  });

  try {
    const result = await chat.sendMessageStream({ message: newMessage });
    
    let finalSources: GroundingSource[] = [];

    for await (const chunk of result) {
      const text = chunk.text;
      if (text) {
        onChunk(text);
      }
      
      // Collect sources from chunks if available
      const chunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        chunks.forEach((c: any) => {
          if (c.web) {
            finalSources.push({ title: c.web.title, uri: c.web.uri });
          }
        });
      }
    }
    
    // Deduplicate sources
    return Array.from(new Map(finalSources.map(s => [s.uri, s])).values());
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    onChunk("\n(Error: Could not connect to Gemini AI)");
    return [];
  }
};