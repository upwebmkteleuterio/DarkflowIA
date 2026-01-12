
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

    // Extrair links das fontes para cumprir a regra de grounding
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

    // Limpar duplicatas de fontes
    const uniqueSources = Array.from(new Set(sources.map(s => s.uri)))
      .map(uri => sources.find(s => s.uri === uri))
      .slice(0, 5);

    const trends = JSON.parse(response.text || "[]");
    
    // Anexar as fontes a cada trend (simulando para cada uma ou globalmente)
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
  tone: string, 
  retentionStructure: string,
  context?: string,
  negatives?: string,
  positives?: string
) => {
  try {
    const ai = getAI();
    const targetWordCount = duration * 140;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Escreva um roteiro completo para YouTube para o vídeo: "${title}".
                 Nicho: ${niche}. 
                 Tom de voz: ${tone}. 
                 Duração alvo: ${duration} minutos (aproximadamente ${targetWordCount} palavras).
                 Estrutura de Retenção: ${retentionStructure}.
                 
                 ${context ? `CONTEXTO ADICIONAL / PROMPT: ${context}` : ''}
                 ${positives ? `OBRIGATÓRIO CITAR/INCLUIR: ${positives}` : ''}
                 ${negatives ? `PROIBIDO CITAR/INCLUIR: ${negatives}` : ''}

                 REGRAS CRÍTICAS:
                 1. Retorne APENAS o texto que será lido pelo narrador.
                 2. NÃO inclua indicações visuais, sugestões de edição, timestamps ou cabeçalhos.
                 3. NÃO use formatação Markdown como asteriscos (**) ou hashtags (#).
                 4. O texto deve ser contínuo e pronto para ser colado em um software de conversão de texto em fala (TTS).
                 5. Tente atingir a duração solicitada mantendo o engajamento alto.
                 6. Comece direto no Hook do vídeo.`,
    });
    const text = response.text;
    if (!text) throw new Error("A IA retornou um texto vazio.");
    return text;
  } catch (error) {
    console.error("Erro ao gerar roteiro:", error);
    throw error;
  }
};

export const generateThumbnail = async (prompt: string, style: string, thumbTitle?: string, referenceImageBase64?: string) => {
  try {
    const ai = getAI();
    
    const parts: any[] = [
      { text: `Create a high-impact YouTube thumbnail image. 
               Style: ${style}. 
               Scene: ${prompt}. 
               ${thumbTitle ? `The thumbnail should visually represent or suggest the text: "${thumbTitle}".` : ''}
               Cinematic lighting, high contrast, viral potential, 4k detail, professional color grading.` }
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
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
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
      contents: `Baseado no título "${title}" e no roteiro fornecido, gere metadados otimizados para YouTube.
                 Roteiro: ${script.substring(0, 3000)}
                 
                 Retorne um objeto JSON com:
                 1. "description": Uma descrição longa (aproximadamente 300-500 palavras) rica em palavras-chave de cauda longa, hashtags e apelo para o usuário.
                 2. "chapters": Uma lista de capítulos/timestamps baseada na narrativa do roteiro (Ex: 00:00 - Introdução, 01:25 - O Segredo...).
                 
                 REGRAS:
                 - Sem markdown no texto da descrição.
                 - Os capítulos devem seguir o formato "MM:SS - Nome do Capítulo".`,
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
