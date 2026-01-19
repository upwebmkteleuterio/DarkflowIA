
import { useState, useCallback, useRef, useEffect } from 'react';
import { Project, ScriptItem } from '../types';
import { generateThumbnail, generateScenePrompt } from '../services/geminiService';
import { uploadThumbnail } from '../services/storageService';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export const useThumbnailQueue = (project: Project, onUpdate: (updated: Project) => void) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user, profile, refreshProfile } = useAuth();
  const projectRef = useRef(project);
  
  useEffect(() => {
    projectRef.current = project;
  }, [project]);

  const updateItemStatus = useCallback((itemId: string, updates: Partial<ScriptItem>) => {
    const currentItems = projectRef.current.items || [];
    const updatedItems = currentItems.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    );
    onUpdate({ ...projectRef.current, items: updatedItems });
  }, [onUpdate]);

  const processSingleItem = async (itemId: string, batchConfig: { mode: 'auto' | 'manual', prompt: string, style: string, variations: number }) => {
    const currentItems = projectRef.current.items || [];
    const item = currentItems.find(i => i.id === itemId);
    
    if (!item || !user) return;

    const creditsNeeded = batchConfig.variations;
    if ((profile?.image_credits ?? 0) < creditsNeeded) {
      alert(`Saldo insuficiente de imagem. Você precisa de ${creditsNeeded} créditos.`);
      return;
    }

    updateItemStatus(itemId, { thumbStatus: 'generating' });

    try {
      const itemMode = item.thumbMode || batchConfig.mode;
      const itemPrompt = item.thumbPrompt || batchConfig.prompt;
      
      let finalPrompt = itemPrompt;

      if (itemMode === 'auto') {
        const generated = await generateScenePrompt(
          item.title, 
          item.script || "", 
          batchConfig.style
        );
        finalPrompt = generated || item.title;
      }

      const publicUrls: string[] = [];

      // Loop de geração e UPLOAD imediato
      for (let i = 0; i < batchConfig.variations; i++) {
        try {
           // 1. Gera o Base64 na IA
           const base64Image = await generateThumbnail(finalPrompt, batchConfig.style, item.title);
           
           if (base64Image) {
              // 2. Faz o upload para o Supabase Storage (Substitui Base64 por URL)
              const url = await uploadThumbnail(user.id, itemId, base64Image);
              publicUrls.push(url);
           }
        } catch (err) {
           console.error("Erro em variação/upload individual:", err);
        }
      }

      if (publicUrls.length > 0) {
        // 3. TENTA DEDUZIR CRÉDITOS
        const actualUsage = publicUrls.length;
        const { data: success, error: rpcError } = await supabase.rpc('deduct_image_credits', {
          user_id: user.id,
          amount: actualUsage
        });

        if (rpcError || !success) {
           throw new Error("Erro ao processar pagamento de imagens.");
        }

        // 4. PERSISTE AS URLS NO BANCO DE DADOS (Tabela script_items)
        const existingThumbs = item.thumbnails || [];
        const finalThumbs = [...publicUrls, ...existingThumbs];

        const { error: dbError } = await supabase
          .from('script_items')
          .update({ 
            thumbnails: finalThumbs,
            thumb_status: 'completed'
          })
          .eq('id', itemId);

        if (dbError) throw dbError;

        // 5. Atualiza Estado Local e Saldo
        updateItemStatus(itemId, { 
          thumbStatus: 'completed', 
          thumbnails: finalThumbs 
        });

        await refreshProfile();
      } else {
        throw new Error("Nenhuma imagem pôde ser gerada ou salva.");
      }
    } catch (error: any) {
      console.error("[THUMB-QUEUE] Erro crítico:", error);
      updateItemStatus(itemId, { thumbStatus: 'failed' });
    }
  };

  const handleGenerateSingle = async (itemId: string, config: { mode: 'auto' | 'manual', prompt: string, style: string, variations: number }) => {
    const item = projectRef.current.items.find(i => i.id === itemId);
    if (item?.thumbStatus === 'generating') return;
    await processSingleItem(itemId, config);
  };

  const handleRetry = (itemId: string, config: { mode: 'auto' | 'manual', prompt: string, style: string, variations: number }) => {
    updateItemStatus(itemId, { thumbStatus: 'pending' });
    handleGenerateSingle(itemId, config);
  };

  const items = project.items || [];
  return {
    isProcessing,
    handleGenerateSingle,
    handleRetry,
    stats: {
      total: items.length,
      completed: items.filter(i => i.thumbnails.length > 0).length,
      pending: items.filter(i => i.thumbStatus === 'pending').length,
      failed: items.filter(i => i.thumbStatus === 'failed').length,
      generating: items.filter(i => i.thumbStatus === 'generating').length,
    }
  };
};
