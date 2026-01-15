
import { GoogleGenAI, Type } from "@google/genai";

// Re-using the same helper for all AI calls
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const searchTrends = async (theme: string, country: string) => {
  try {
    const ai = getAI();
    const prompt = `Atue como um analista de tendências digitais e especialista em YouTube Automation.
                    Analise o tema "${theme}" no país "${country}".
                    Identifique 5 tópicos ou nichos específicos que estão em alta (trending) ou com alto potencial de crescimento.
                    Considere especialmente conteúdos que estão explodindo no exterior e ainda não foram saturados no mercado local.
                    
                    Retorne um JSON com a seguinte estrutura:
                    Array de objetos contendo:
                    - topic: O nome do tema/nicho.
                    - reason: Por que está em alta agora.
                    - viralScore: Número de 0 a 100 de potencial viral.
                    - marketGap: Uma breve explicação de como esse tema pode ser explorado de forma única.
                    
                    IMPORTANTE: Retorne APENAS o JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
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
            required: ["topic", "reason", "viralScore", "marketGap"]
          }
        }
      }
    });

    const sources: any[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web && chunk.web.uri) {
          sources.push({
            title: chunk.web.title || "Referência Externa",
            uri: chunk.web.uri
          });
        }
      });
    }

    const uniqueSources = Array.from(new Set(sources.map(s => s.uri)))
      .map(uri => sources.find(s => s.uri === uri))
      .slice(0, 5);

    const trends = JSON.parse(response.text || "[]");
    
    return trends.map((t: any, idx: number) => ({
      ...t,
      id: Date.now().toString() + idx,
      sources: uniqueSources
    }));
  } catch (error) {
    console.error("Erro ao buscar tendências:", error);
    return [];
  }
};

export const generateTitles = async (niche: string, audience: string, trigger: string, format: string, baseTheme: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate 5 highly engaging YouTube titles for a Dark Channel.
                 Base Theme/Topic: ${baseTheme}.
                 Niche: ${niche}. 
                 Target audience: ${audience}. 
                 Emotional trigger: ${trigger}. 
                 Format: ${format}. 
                 Return as a JSON array of objects with properties: title, tags (array of strings), ctrScore (one of: High, Trending, Optimized, Panic).`,
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
  } catch (error) {
    console.error("Erro ao gerar títulos:", error);
    return [];
  }
};

export const generateScenePrompt = async (title: string, script: string, style: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Based on the following YouTube video script and title, create a highly detailed visual prompt for an AI image generator (like Midjourney or Stable Diffusion) to create a viral thumbnail background.
                 Title: ${title}
                 Script snippet: ${script.substring(0, 1000)}
                 Style requested: ${style}
                 Focus on dramatic lighting, high contrast, and emotional impact. Return ONLY the prompt text, without any labels or markdown.`,
    });
    return response.text?.trim() || "";
  } catch (error) {
    console.error("Erro ao gerar prompt de cena:", error);
    return "";
  }
};

export const generateScript = async (
  title: string, 
  niche: string, 
  duration: number, 
  mode: 'manual' | 'winner' | 'auto',
  tone?: string, 
  retentionStructure?: string,
  winnerTemplate?: string,
  context?: string,
) => {
  const logId = `ScriptGen-${Date.now().toString().slice(-4)}`;
  console.group(`[AI SERVICE] ${logId}: Iniciando Geração de Roteiro (${mode})`);
  
  try {
    const ai = getAI();
    const targetWordCount = duration * 140;

    let modeInstructions = "";
    if (mode === 'auto') {
      modeInstructions = `MODO AUTOMÁTICO ATIVADO: Analise o nicho "${niche}" e o título "${title}" para determinar o melhor tom de voz e estrutura narrativa que maximizem a retenção do público. Use sua inteligência para criar algo viral.`;
    } else if (mode === 'winner') {
      modeInstructions = `MODO ESTRUTURA VENCEDORA ATIVADO: Siga RIGOROSAMENTE o estilo, o ritmo e a estrutura narrativa (o "esqueleto") do roteiro modelo abaixo. Adapte o conteúdo para o novo título mantendo a mesma fórmula de sucesso.
      
      ESTRUTURA VENCEDORA (MODELO):
      ---
      ${winnerTemplate}
      ---`;
    } else {
      modeInstructions = `Tom de voz solicitado: ${tone}. Estrutura de Retenção: ${retentionStructure}.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Atue como um roteirista sênior de canais Dark de alto desempenho.
                 VÍDEO ALVO: "${title}".
                 Nicho: ${niche}. 
                 Duração alvo: ${duration} minutos (aproximadamente ${targetWordCount} palavras).
                 
                 ${modeInstructions}
                 
                 ${context ? `CONTEXTO ADICIONAL: ${context}` : ''}

                 REGRAS CRÍTICAS:
                 1. Retorne APENAS o texto da narração.
                 2. SEM marcações visuais, timestamps ou cabeçalhos.
                 3. SEM formatação Markdown (negritos, hashtags).
                 4. O texto deve ser contínuo e pronto para narração TTS.
                 5. Comece direto no Hook irresistível.`,
    });
    
    const text = response.text;
    if (!text) throw new Error("A IA retornou um texto vazio.");

    console.log(`[AI SERVICE] ${logId}: Sucesso. Comprimento: ${text.length} caracteres.`);
    console.groupEnd();
    return text;
  } catch (error: any) {
    console.error(`[AI SERVICE] ${logId}: FALHA CRÍTICA`, error);
    console.groupEnd();
    throw error;
  }
};

export const generateThumbnail = async (prompt: string, style: string, thumbTitle?: string, referenceImageBase64?: string) => {
  try {
    const ai = getAI();
    const parts: any[] = [
      { text: `Create a high-impact YouTube thumbnail image. Style: ${style}. Scene: ${prompt}. ${thumbTitle ? `The thumbnail should visually represent or suggest the text: "${thumbTitle}".` : ''} Cinematic lighting, high contrast, viral potential, 4k detail.` }
    ];

    if (referenceImageBase64) {
      parts.unshift({
        inlineData: {
          mimeType: "image/jpeg",
          data: referenceImageBase64.split(',')[1] || referenceImageBase64
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
      config: { imageConfig: { aspectRatio: "16:9" } }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch (error) {
    console.error("Erro ao gerar thumbnail:", error);
    return null;
  }
};

export const generateMetadata = async (title: string, script: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Baseado no título "${title}" e no roteiro, gere metadados otimizados (Descrição e Capítulos).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            chapters: { type: Type.STRING }
          },
          required: ["description", "chapters"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Erro ao gerar metadados:", error);
    return { description: "", chapters: "" };
  }
};
