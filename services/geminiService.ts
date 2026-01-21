
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
    
    // Prompt reforçado para garantir o texto na imagem
    const textInstruction = title 
      ? `\n\nCRITICAL REQUIREMENT: You MUST overlay the following text clearly on the image: "${title}". 
         The text must be large, bold, and in a high-contrast color that stands out from the background. 
         Position it strategically for maximum click-through rate.`
      : '';

    const contents: any = { 
      parts: [
        { 
          text: `Create a high-impact YouTube Thumbnail. 
                 Style: ${style}. 
                 Visual Scene: ${prompt}.${textInstruction}` 
        }
      ] 
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents,
      config: { imageConfig: { aspectRatio: "16:9" } }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("Erro na geração da imagem: a IA não retornou dados binários.");
  });
};

export const generateScenePrompt = async (title: string, script: string, style: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Atue como um diretor de arte de YouTube. Analise o título "${title}" e o roteiro para criar um prompt visual épico para uma thumbnail. Estilo desejado: ${style}. Retorne apenas o prompt descritivo da cena.`,
  });
  return response.text || title;
};

export const generateMetadata = async (title: string, script: string): Promise<{ description: string; chapters: string; tags: string }> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Gere Metadados (descrição persuasiva, capítulos timestamps e tags) para o vídeo: "${title}". Roteiro base: ${script.substring(0, 3000)}`,
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
  return callWithRetry(async () => {
    const ai = getAI();
    const prompt = `
      Atue como um analista de tendências virais do YouTube. 
      Sua tarefa é pesquisar na web usando o Google Search e identificar 5 tendências EMERGENTES e REAIS sobre "${theme}" em "${country}".
      
      Regras:
      1. Use o Google Search para encontrar notícias e tópicos reais que estão subindo em buscas.
      2. O viralScore deve refletir o quão explosiva é a tendência (0 a 100).
      3. No campo 'marketGap', explique o que falta nos vídeos atuais sobre esse tema.
      4. No campo 'reason', explique por que esse tópico está em alta agora (fatores sociais, notícias, memes).
      5. Inclua fontes reais (links) que comprovam a tendência.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: { 
        tools: [{ googleSearch: {} }], 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              topic: { type: Type.STRING, description: "Nome curto e chamativo da tendência" },
              reason: { type: Type.STRING, description: "Justificativa detalhada do porquê está viralizando" },
              viralScore: { type: Type.INTEGER, description: "Score de 0 a 100 de potencial viral" },
              marketGap: { type: Type.STRING, description: "O que os criadores atuais ainda não fizeram sobre isso" },
              sources: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    uri: { type: Type.STRING }
                  },
                  required: ["title", "uri"]
                }
              }
            },
            required: ["id", "topic", "reason", "viralScore", "marketGap", "sources"]
          }
        }
      }
    });
    
    try {
      return JSON.parse(response.text || "[]");
    } catch (e) {
      console.error("Erro ao parsear JSON de tendências:", e);
      return [];
    }
  });
};

export const generateTitles = async (niche: string, audience: string, trigger: string, format: string, baseTheme: string): Promise<TitleIdea[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Gere 5 títulos virais altamente clicáveis para o nicho ${niche} focado em ${audience}. Base: ${baseTheme}. Gatilho: ${trigger}.`,
    config: { 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            ctrScore: { type: Type.STRING }
          },
          required: ["title", "tags", "ctrScore"]
        }
      }
    }
  });
  return JSON.parse(response.text || "[]");
};

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

    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const blob = new Blob([bytes], { type: 'audio/pcm' });
    return URL.createObjectURL(blob);
  });
};
