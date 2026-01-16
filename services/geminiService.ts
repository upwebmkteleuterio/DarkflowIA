
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Trend, TitleIdea } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

async function callWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const isRateLimit = error?.message?.includes('429') || error?.status === 429;
    if (isRateLimit && retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return callWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export const searchTrends = async (theme: string, country: string): Promise<Trend[]> => {
  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Encontre 5 tendências virais de vídeos no YouTube para o nicho "${theme}" no país "${country}". Retorne JSON com topic, reason, viralScore, marketGap.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              topic: { type: Type.STRING },
              reason: { type: Type.STRING },
              viralScore: { type: Type.NUMBER },
              marketGap: { type: Type.STRING }
            },
            required: ['topic', 'reason', 'viralScore', 'marketGap']
          }
        }
      }
    });
    
    const text = response.text;
    if (text) {
      const results = JSON.parse(text);
      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
        title: chunk.web?.title || "Fonte externa",
        uri: chunk.web?.uri || "#"
      })) || [];
      return results.map((r: any, i: number) => ({ ...r, id: `trend-${Date.now()}-${i}`, sources: sources.slice(0, 3) }));
    }
    return [];
  });
};

export const generateTitles = async (niche: string, audience: string, trigger: string, format: string, baseTheme: string): Promise<TitleIdea[]> => {
  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Gere 5 sugestões de títulos virais para ${niche}. Tema: ${baseTheme}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              ctrScore: { type: Type.STRING, enum: ['High', 'Trending', 'Optimized', 'Panic'] }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  });
};

export const generateScript = async (title: string, niche: string, duration: number, mode: string, tone?: string, retention?: string, winnerTemplate?: string, baseTheme?: string): Promise<string> => {
  return callWithRetry(async () => {
    const ai = getAI();
    const prompt = `Escreva um roteiro de YouTube para "${title}". Nicho: ${niche}. Contexto: ${baseTheme}. Duração alvo: ${duration}min.`;
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: { systemInstruction: "Você é um roteirista sênior de canais dark." }
    });
    return response.text || "";
  });
};

export const generateThumbnail = async (prompt: string, style: string, title?: string, referenceImage?: string): Promise<string> => {
  return callWithRetry(async () => {
    const ai = getAI();
    const contents: any = { parts: [{ text: `YouTube Thumbnail. Style: ${style}. Scene: ${prompt}. Text: ${title || ''}` }] };
    if (referenceImage) contents.parts.unshift({ inlineData: { mimeType: "image/png", data: referenceImage.split(',')[1] } });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents,
      config: { imageConfig: { aspectRatio: "16:9" } }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("Falha ao gerar imagem");
  });
};

export const generateMetadata = async (title: string, script: string): Promise<{description: string, chapters: string, tags: string}> => {
  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Gere SEO (descrição, capítulos, tags) para: "${title}". Roteiro: ${script.substring(0, 3000)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            chapters: { type: Type.STRING },
            tags: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || "{}");
  });
};

export const generateScenePrompt = async (title: string, script: string, style: string): Promise<string> => {
  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Crie um prompt visual detalhado para thumbnail. Título: ${title}. Estilo: ${style}.`,
    });
    return response.text || title;
  });
};

// Generate speech using gemini-2.5-flash-preview-tts model
export const generateSpeech = async (text: string, voiceName: string): Promise<string> => {
  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });
    
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("Falha ao gerar áudio");
    }
    
    // Return a data URI with the base64 PCM data. 
    // Note: PCM data requires custom decoding for playback as shown in guidelines.
    return `data:audio/pcm;base64,${base64Audio}`;
  });
};
