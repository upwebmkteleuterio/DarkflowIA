
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Trend, TitleIdea, VeoConsistency } from "../types";

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

export const analyzeVeoScript = async (script: string): Promise<VeoConsistency> => {
  return callWithRetry(async () => {
    const ai = getAI();
    
    const prompt = `
      TRANSFORME O ROTEIRO ABAIXO EM UMA ESTRUTURA DE CONSISTÊNCIA PROFISSIONAL PARA VÍDEO (VEO 3).
      
      ROTEIRO:
      ---
      ${script}
      ---
      
      INSTRUÇÕES DE EXTRAÇÃO:
      1. Identifique Personagens Principais (IDs: CHAR_A, CHAR_B...).
      2. Identifique Ambientes Recorrentes (IDs: LOC_1, LOC_2...).
      3. Defina Época e Tom Global.
      4. Marque o roteiro original com os IDs entre colchetes [CHAR_X] [LOC_X] sem alterar nenhuma palavra.

      RETORNE APENAS UM JSON NO FORMATO ABAIXO:
      {
        "personagens": [{
          "id": "CHAR_A",
          "nome": "",
          "identidade": { "sexo": "", "faixa_etaria_aparente": "", "etnia": "", "tom_de_pele": "" },
          "detalhes_rosto": { "formato_do_rosto": "", "cor_dos_olhos": "", "sobrancelhas": "", "tipo_de_nariz": "", "boca_labios": "", "marcas_faciais": "" },
          "cabelo": { "cor_do_cabelo": "", "estilo_do_cabelo": "", "pelos_faciais": "" },
          "corpo": { "altura_aproximada": "", "tipo_fisico": "" },
          "vestimenta": { "roupas_principais": "", "cores_predominantes": "" },
          "presenca": { "postura": "", "expressao_facial_base": "", "linguagem_corporal": "" }
        }],
        "locais": [{
          "id": "LOC_1",
          "nome_do_local": "",
          "tipo_de_ambiente": "interno/externo",
          "descricao_visual_detalhada": "",
          "iluminacao_padrao": "",
          "clima_atmosferico": "",
          "elementos_fixos_importantes": ""
        }],
        "epoca": { "periodo_temporal": "", "tecnologia_presente": "", "estilo_visual_da_epoca": "" },
        "tom_global": { "estilo_narrativo": "", "ritmo": "", "clima_emocional": "", "iluminacao_predominante": "", "referencia_cinematografica": "" },
        "roteiro_marcado": "Texto original com [IDs]"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { 
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || "{}");
  });
};

export const generateVeoScenes = async (script: string, consistency: VeoConsistency): Promise<{ scenes: any[], script_com_cenas: string }> => {
  return callWithRetry(async () => {
    const ai = getAI();
    const prompt = `
      ESTRATEGISTA VISUAL VEO 3: Divida o roteiro em cenas cinematográficas de 5 a 10 segundos cada.
      
      REGRAS CRÍTICAS:
      1. COBERTA TOTAL: Você DEVE processar o roteiro do início até a ÚLTIMA PALAVRA. Não interrompa a geração antes de chegar ao fim do texto fornecido.
      2. MAPEAMENTO EXATO: Retorne o roteiro original completo. Insira marcadores [CENA_1], [CENA_2]... exatamente no início de cada bloco de texto que corresponde à cena gerada.
      3. PROMPTS: Para cada cena, descreva a ação visual rica em detalhes usando obrigatoriamente os IDs de consistência [CHAR_X] e [LOC_X].
      
      ROTEIRO PARA PROCESSAR:
      ${consistency.roteiro_marcado}
      
      RETORNE UM JSON ESTRUTURADO:
      {
        "scenes": [
          { "id": "SCENE_1", "timestamp": "00:00", "prompt_base": "Ação visual detalhada com [IDs]" },
          ... continue até o fim do roteiro ...
        ],
        "script_com_cenas": "O roteiro completo com [CENA_1], [CENA_2] etc injetados no texto."
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const result = JSON.parse(response.text || "{\"scenes\":[], \"script_com_cenas\":\"\"}");
    
    // Fallback de segurança se o script_com_cenas vier vazio
    if (!result.script_com_cenas) {
        result.script_com_cenas = consistency.roteiro_marcado;
    }

    return result;
  });
};

export const generateScript = async (title: string, niche: string, duration: number, mode: string, tone?: string, retention?: string, winnerTemplate?: string, baseTheme?: string): Promise<string> => {
  return callWithRetry(async () => {
    const ai = getAI();
    
    const targetWordCount = duration * 140;

    const winnerInstruction = mode === 'winner' && winnerTemplate 
      ? `
      REQUISITO ESPECIAL: MODO CLONAGEM DE ESTRUTURA (WINNER)
      O usuário forneceu um ROTEIRO VENCEDOR abaixo. 
      Sua tarefa é fazer uma engenharia reversa deste roteiro para extrair a "FORMA DO BOLO" (a estrutura narrativa, o ritmo, o tempo de cada gancho e a progressão de tópicos).
      
      MODELO VENCEDOR PARA CLONAR:
      ---
      ${winnerTemplate}
      ---
      
      INSTRUÇÃO: Crie o novo roteiro sobre "${title}" seguindo rigorosamente o molde acima. Mantenha o estilo de escrita e a cadência do modelo, mas mude todo o conteúdo para o novo tema solicitado.`
      : `
      ESTRUTURA DE RETENÇÃO: ${retention || 'AIDA'}
      TOM DE VOZ: ${tone || 'Misterioso'}`;

    const prompt = `
      NOME DO VÍDEO: "${title}"
      NICHO: ${niche}
      CONTEXTO DO CANAL: ${baseTheme}
      ${winnerInstruction}
      
      REQUISITO 1: COERÊNCIA LINGUÍSTICA (CRÍTICO)
      Identifique o idioma do "NOME DO VÍDEO". O roteiro gerado DEVE estar exatamente no mesmo idioma do título. 
      
      REQUISITO 2: TAMANHO DO ROTEIRO (CRÍTICO)
      O resultado final desse roteiro DEVE ter aproximadamente ${targetWordCount} palavras. 
      
      REQUISITO 3: FORMATO "CLEAN TEXT" (CRÍTICO)
      Retorne APENAS o texto que será narrado. PROIBIÇÃO ABSOLUTA de incluir explicações de cenas ou marcações.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { 
        systemInstruction: "Você é um roteirista bilíngue de alta performance para YouTube. Sua especialidade é detectar padrões em roteiros de sucesso e clonar sua estrutura narrativa para novos temas.",
        temperature: 0.7 
      }
    });

    return response.text || "";
  });
};

export const generateThumbnail = async (prompt: string, style: string, title?: string, referenceImage?: string): Promise<string> => {
  return callWithRetry(async () => {
    const ai = getAI();
    const textInstruction = title ? `\n\nCRITICAL REQUIREMENT: You MUST overlay the following text clearly on the image: "${title}". The text must be large, bold, and in a high-contrast color that stands out from the background. Position it strategically for maximum click-through rate.` : '';
    const contents: any = { parts: [{ text: `Create a high-impact YouTube Thumbnail. Visual Style: ${style}. Visual Scene: ${prompt}.${textInstruction}` }] };
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
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Identifique 5 tendências EMERGENTES sobre "${theme}" em "${country}".`,
      config: { tools: [{ googleSearch: {} }] }
    });
    return JSON.parse(response.text || "[]");
  });
};

export const generateTitles = async (niche: string, audience: string, trigger: string, format: string, baseTheme: string): Promise<TitleIdea[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Gere 5 títulos virais para o nicho ${niche}.`,
    config: { responseMimeType: "application/json" }
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
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName as any } } },
      },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("Falha ao gerar áudio");
    const blob = new Blob([new Uint8Array(atob(base64Audio).split("").map(c => c.charCodeAt(0)))], { type: 'audio/pcm' });
    return URL.createObjectURL(blob);
  });
};
