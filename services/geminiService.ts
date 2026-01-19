
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
    const isLongFormat = duration > 30;
    const model = 'gemini-3-flash-preview'; // Forçado Flash conforme pedido

    if (!isLongFormat) {
      const prompt = `
        Escreva um roteiro épico de YouTube para: "${title}". 
        Duração alvo: ${duration} minutos (~${duration * 140} palavras).
        Nicho: ${niche}. Contexto: ${baseTheme}. 
        ${mode === 'manual' ? `Tom: ${tone}. Estrutura: ${retention}.` : ''}
        ${mode === 'winner' ? `Use este modelo como base: ${winnerTemplate}.` : ''}
        Regra: Apenas a narração pura.
      `;
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: { systemInstruction: "Você é um roteirista sênior de canais Dark de alta retenção." }
      });
      return response.text || "";
    }

    // ESTRATÉGIA PARA ROTEIROS LONGOS (> 30 min) EM 3 ETAPAS USANDO FLASH
    console.log("[GEMINI] Iniciando orquestração FLASH para roteiro longo...");
    
    // ETAPA 1: Gerar Outline
    const outlinePrompt = `Crie um outline detalhado com 12 subtópicos para um roteiro de 60 minutos sobre: "${title}". Nicho: ${niche}. Tema: ${baseTheme}.`;
    const outlineResponse = await ai.models.generateContent({
      model: model,
      contents: outlinePrompt
    });
    const outline = outlineResponse.text || "";

    // ETAPA 2: Escrever Primeira Metade (Até 30 min)
    const part1Prompt = `Baseado neste outline: ${outline}. Escreva a PRIMEIRA METADE do roteiro (os primeiros 6 tópicos). Desenvolva cada parágrafo com muita profundidade para garantir tempo de tela. Tom: ${tone}.`;
    const part1Response = await ai.models.generateContent({
      model: model,
      contents: part1Prompt
    });

    // ETAPA 3: Escrever Segunda Metade (Restante até 60 min)
    const part2Prompt = `Baseado no outline e na primeira parte, escreva a SEGUNDA METADE final (os últimos 6 tópicos) para concluir o roteiro de 60 minutos sobre "${title}".`;
    const part2Response = await ai.models.generateContent({
      model: model,
      contents: part2Prompt
    });

    return `${part1Response.text}\n\n[CONTINUAÇÃO DA NARRATIVA]\n\n${part2Response.text}`;
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

export const generateScenePrompt = async (title: string, script: string, style: string): Promise<string> => {
  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Crie um prompt visual detalhado para thumbnail de YouTube. Título: ${title}. Estilo: ${style}. Baseado no roteiro: ${script.substring(0, 1000)}`,
    });
    return response.text || title;
  });
};

// Fix: Implement generateMetadata for SEO optimization
export const generateMetadata = async (title: string, script: string): Promise<{ description: string; chapters: string; tags: string }> => {
  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Gere metadados de SEO (descrição longa, capítulos com timestamps e tags separadas por vírgula) para este vídeo: "${title}". Use o roteiro como base: ${script.substring(0, 2000)}`,
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
  });
};

// Fix: Implement searchTrends using Google Search grounding
export const searchTrends = async (theme: string, country: string): Promise<Trend[]> => {
  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Encontre 6 tendências atuais e tópicos virais sobre "${theme}" em "${country}". Retorne em formato JSON.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              topic: { type: Type.STRING },
              reason: { type: Type.STRING },
              viralScore: { type: Type.NUMBER },
              marketGap: { type: Type.STRING },
              sources: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    uri: { type: Type.STRING }
                  }
                }
              }
            },
            required: ["id", "topic", "reason", "viralScore", "marketGap"]
          }
        }
      }
    });
    
    const results = JSON.parse(response.text || "[]");
    
    // Enrich with grounding chunks if sources are empty
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks && results.length > 0) {
      results.forEach((trend: any) => {
        if (!trend.sources || trend.sources.length === 0) {
          trend.sources = chunks.map((c: any) => ({
            title: c.web?.title || 'Fonte de Pesquisa',
            uri: c.web?.uri || '#'
          })).slice(0, 3);
        }
      });
    }
    
    return results;
  });
};

// Fix: Implement generateTitles for viral hook suggestions
export const generateTitles = async (niche: string, audience: string, trigger: string, format: string, baseTheme: string): Promise<TitleIdea[]> => {
  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Gere 5 títulos de alta performance para o nicho "${niche}", focado no público "${audience}", usando o gatilho emocional "${trigger}" e o formato "${format}". Tema central: ${baseTheme}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              ctrScore: { 
                type: Type.STRING,
                description: 'Categorias: High, Trending, Optimized, Panic'
              }
            },
            required: ["title", "tags", "ctrScore"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  });
};

// Fix: Implement generateSpeech for high-quality TTS using raw PCM conversion
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

    const base64Data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Data) throw new Error("Falha ao gerar áudio");

    // Decode base64 manual to Uint8Array
    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Add WAV Header for Linear PCM 16-bit 24kHz Mono
    const sampleRate = 24000;
    const numChannels = 1;
    const bitsPerSample = 16;
    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);

    // RIFF identifier
    view.setUint32(0, 0x52494646, false); // "RIFF"
    view.setUint32(4, 36 + bytes.length, true); // Total size
    view.setUint32(8, 0x57415645, false); // "WAVE"
    
    // fmt sub-chunk
    view.setUint32(12, 0x666d7420, false); // "fmt "
    view.setUint32(16, 16, true); // Size
    view.setUint16(20, 1, true); // PCM Format
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * bitsPerSample / 8, true); // Byte Rate
    view.setUint16(32, numChannels * bitsPerSample / 8, true); // Block Align
    view.setUint16(34, bitsPerSample, true);
    
    // data sub-chunk
    view.setUint32(36, 0x64617461, false); // "data"
    view.setUint32(40, bytes.length, true);

    const blob = new Blob([wavHeader, bytes], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  });
};
