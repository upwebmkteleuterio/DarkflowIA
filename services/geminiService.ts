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

export const generateScript = async (title: string, niche: string, duration: number, mode: string, tone?: string, retention?: string, winnerTemplate?: string, baseTheme?: string): Promise<string> => {
  return callWithRetry(async () => {
    const ai = getAI();
    const prompt = `
      Escreva um roteiro épico de YouTube para: "${title}". 
      Duração alvo: ${duration} minutos. Nicho: ${niche}. 
      Contexto: ${baseTheme}. Regra: Apenas a narração pura.
    `;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { systemInstruction: "Você é um roteirista sênior de canais Dark." }
    });
    return response.text || "";
  });
};

export const generateThumbnail = async (prompt: string, style: string, title?: string, referenceImage?: string): Promise<string> => {
  return callWithRetry(async () => {
    const ai = getAI();
    const contents: any = { parts: [{ text: `Thumbnail Style: ${style}. Scene: ${prompt}. Text: ${title || ''}` }] };
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents,
      config: { imageConfig: { aspectRatio: "16:9" } }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("Erro na imagem");
  });
};

export const generateScenePrompt = async (title: string, script: string, style: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Prompt visual para thumbnail de: "${title}". Estilo: ${style}.`,
  });
  return response.text || title;
};

export const generateMetadata = async (title: string, script: string): Promise<{ description: string; chapters: string; tags: string }> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Gere Metadados (descrição, chapters e tags) para: "${title}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          chapters: { type: Type.STRING },
          tags: { type: Type.STRING },
        },
        required: ["description", "chapters", "tags"]
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

export const searchTrends = async (theme: string, country: string): Promise<Trend[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Tendências virais sobre "${theme}" em "${country}" em JSON.`,
    config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || "[]");
};

export const generateTitles = async (niche: string, audience: string, trigger: string, format: string, baseTheme: string): Promise<TitleIdea[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Gere 5 títulos virais para ${niche}`,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || "[]");
};

// Implementação de Text-to-Speech usando o modelo gemini-2.5-flash-preview-tts
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
            prebuiltVoiceConfig: { voiceName: voiceName as any },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("Falha ao gerar áudio");

    // Decodifica base64 para bytes manualmente seguindo as diretrizes
    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Cria um Blob e gera uma URL temporária para consumo pelo hook useVoiceover
    const blob = new Blob([bytes], { type: 'audio/pcm' });
    return URL.createObjectURL(blob);
  });
};