
import React, { useState } from 'react';
import { VeoScene, VeoConsistency } from '../../types';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { TextArea } from '../ui/Input';

interface VeoPromptsProps {
  scenes: VeoScene[];
  consistency: VeoConsistency;
  scriptComCenas?: string;
  onUpdateScenes: (updated: VeoScene[]) => void;
  onBack: () => void;
}

const VeoPrompts: React.FC<VeoPromptsProps> = ({ scenes, consistency, scriptComCenas, onUpdateScenes, onBack }) => {
  const [showFullScript, setShowFullScript] = useState(false);
  const [editingScene, setEditingScene] = useState<VeoScene | null>(null);

  const getFullPrompt = (base: string) => {
    let final = base;
    
    // Substitui Personagens
    consistency.personagens.forEach(char => {
      const charDetails = `(Character: ${char.nome}, ${char.identidade.faixa_etaria_aparente} years old, ${char.identidade.etnia}, ${char.identidade.tom_de_pele} skin, face: ${char.detalhes_rosto.formato_do_rosto}, eyes: ${char.detalhes_rosto.cor_dos_olhos}, hair: ${char.cabelo.cor_do_cabelo} ${char.cabelo.estilo_do_cabelo}, wearing ${char.vestimenta.roupas_principais})`;
      final = final.replace(new RegExp(`\\[${char.id}\\]`, 'g'), charDetails);
    });

    // Substitui Locais
    consistency.locais.forEach(loc => {
      const locDetails = `(Location: ${loc.nome_do_local}, ${loc.tipo_de_ambiente}, ${loc.descricao_visual_detalhada}, lighting: ${loc.iluminacao_padrao}, weather: ${loc.clima_atmosferico})`;
      final = final.replace(new RegExp(`\\[${loc.id}\\]`, 'g'), locDetails);
    });

    // Adiciona Tom Global ao final
    const globalStyle = `Visual Style: ${consistency.epoca.estilo_visual_da_epoca}, Cinematic Tone: ${consistency.tom_global.estilo_narrativo}, Lighting: ${consistency.tom_global.iluminacao_predominante}.`;
    
    return `${final}. ${globalStyle}`;
  };

  const handleCopy = (id: string, base: string) => {
    const fullText = getFullPrompt(base);
    navigator.clipboard.writeText(fullText);
    
    const updated = scenes.map(s => s.id === id ? { ...s, isCopied: true } : s);
    onUpdateScenes(updated);
  };

  const handleSaveEdit = () => {
    if (!editingScene) return;
    const updated = scenes.map(s => s.id === editingScene.id ? editingScene : s);
    onUpdateScenes(updated);
    setEditingScene(null);
  };

  const insertMarker = (marker: string) => {
    if (!editingScene) return;
    setEditingScene({
        ...editingScene,
        prompt_base: editingScene.prompt_base + ` [${marker}]`
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      
      {/* 3.1 Ver Roteiro Completo - Banner Accordion Melhorado */}
      <div className="bg-surface-dark border border-border-dark rounded-[32px] overflow-hidden shadow-2xl transition-all duration-500">
        <button 
          onClick={() => setShowFullScript(!showFullScript)}
          className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="bg-primary/20 p-2 rounded-xl group-hover:bg-primary group-hover:text-white transition-all">
                <span className="material-symbols-outlined text-primary group-hover:text-white">description</span>
            </div>
            <div className="text-left">
                <span className="block font-black text-xs uppercase tracking-widest text-white">Visualizador de Roteiro Mapeado</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest">Confira a relação exata entre texto e cena</span>
            </div>
          </div>
          <span className={`material-symbols-outlined transition-transform duration-500 text-slate-500 ${showFullScript ? 'rotate-180 text-white' : ''}`}>
            keyboard_arrow_down
          </span>
        </button>
        
        {showFullScript && (
          <div className="p-10 border-t border-border-dark bg-background-dark/80 animate-in slide-in-from-top-4 duration-500 text-left">
            <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed font-sans text-base whitespace-pre-wrap selection:bg-primary/30">
               {(scriptComCenas || consistency.roteiro_marcado).split(/(\[CHAR_[A-Z_]+\]|\[LOC_[0-9]+\]|\[CENA_[0-9]+\]|\[SCENE_[0-9]+\]|\[CENA [0-9]+\])/).map((part, i) => {
                  if (part.startsWith('[CHAR_')) return <span key={i} className="text-primary font-black bg-primary/10 px-1.5 py-0.5 rounded mx-0.5 border border-primary/20">{part}</span>;
                  if (part.startsWith('[LOC_')) return <span key={i} className="text-accent-green font-black bg-accent-green/10 px-1.5 py-0.5 rounded mx-0.5 border border-accent-green/20">{part}</span>;
                  if (part.startsWith('[CENA') || part.startsWith('[SCENE')) {
                    const numMatch = part.match(/[0-9]+/);
                    const num = numMatch ? numMatch[0] : '?';
                    return (
                      <span key={i} className="inline-flex items-center gap-1.5 bg-primary text-white font-black px-3 py-1 rounded-lg border border-white/20 mx-2 my-1 shadow-[0_0_15px_#8655f633] scale-110">
                        <span className="material-symbols-outlined text-[14px] fill-1">movie</span>
                        CENA {num}
                      </span>
                    );
                  }
                  return <span key={i}>{part}</span>;
               })}
            </div>
            <div className="mt-10 flex justify-end border-t border-border-dark pt-6">
                <Button variant="ghost" size="sm" onClick={() => setShowFullScript(false)}>Fechar Visualização</Button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between bg-surface-dark border border-border-dark p-6 rounded-[32px] shadow-xl">
        <div className="flex items-center gap-4 text-left">
           <div className="bg-accent-green/20 text-accent-green p-3 rounded-2xl">
              <span className="material-symbols-outlined">movie_filter</span>
           </div>
           <div>
              <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Estúdio de Prompts VEO 3</h3>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{scenes.length} Cenas cinematográficas geradas</p>
           </div>
        </div>
        <Button variant="outline" icon="arrow_back" onClick={onBack}>Voltar Consistência</Button>
      </div>

      <div className="space-y-4 pb-20">
        {scenes.map((scene, index) => (
          <div 
            key={scene.id} 
            className={`bg-surface-dark border transition-all duration-300 p-8 rounded-[32px] shadow-lg flex flex-col md:flex-row items-center gap-8 ${
              scene.isCopied ? 'border-accent-green/50 opacity-80' : 'border-border-dark'
            }`}
          >
            <div className="flex flex-col items-center gap-2 shrink-0">
               <div className={`size-14 rounded-2xl flex items-center justify-center font-black text-xl transition-colors ${scene.isCopied ? 'bg-accent-green text-black' : 'bg-background-dark text-slate-500'}`}>
                 {index + 1}
               </div>
               <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{scene.timestamp}</span>
            </div>

            <div className="flex-1 text-left">
               <p className="text-slate-300 text-lg leading-relaxed mb-4">
                 {scene.prompt_base.split(/(\[CHAR_[A-Z_]+\]|\[LOC_[0-9]+\])/).map((part, i) => {
                   if (part.startsWith('[CHAR_')) return <span key={i} className="text-primary font-bold">{part}</span>;
                   if (part.startsWith('[LOC_')) return <span key={i} className="text-accent-green font-bold">{part}</span>;
                   return <span key={i}>{part}</span>;
                 })}
               </p>
               <div className="flex items-center gap-4">
                 <div className="h-1 flex-1 bg-background-dark rounded-full overflow-hidden">
                    <div className={`h-full bg-primary transition-all duration-500 ${scene.isCopied ? 'w-full' : 'w-0'}`}></div>
                 </div>
                 {scene.isCopied && <span className="text-[9px] font-black text-accent-green uppercase tracking-widest">Prompt Copiado</span>}
               </div>
            </div>

            <div className="flex flex-col gap-2 shrink-0">
                <button 
                onClick={() => handleCopy(scene.id, scene.prompt_base)}
                className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-xl flex items-center justify-center gap-2 w-full ${
                    scene.isCopied 
                    ? 'bg-accent-green text-black' 
                    : 'bg-white text-black hover:bg-primary hover:text-white'
                }`}
                >
                <span className="material-symbols-outlined text-sm">{scene.isCopied ? 'check_circle' : 'content_copy'}</span>
                {scene.isCopied ? 'Copiado' : 'Copiar Prompt'}
                </button>
                
                <button 
                  onClick={() => setEditingScene(scene)}
                  className="px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] bg-surface-dark border border-border-dark text-slate-500 hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-2 w-full"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                  Editar
                </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE EDIÇÃO DE PROMPT */}
      {editingScene && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setEditingScene(null)} />
           <div className="relative bg-surface-dark border border-border-dark w-full max-w-2xl p-8 md:p-10 rounded-[40px] shadow-2xl space-y-8 animate-in zoom-in-95 duration-300">
              <div className="text-left space-y-2">
                 <Badge variant="primary">Editor de Cena {scenes.indexOf(editingScene) + 1}</Badge>
                 <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">Refinar Prompt da Cena</h3>
              </div>

              <div className="space-y-4 text-left">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Prompt Base</label>
                    <TextArea 
                        className="h-40 leading-relaxed text-base"
                        value={editingScene.prompt_base}
                        onChange={(e) => setEditingScene({...editingScene, prompt_base: e.target.value})}
                    />
                  </div>

                  <div className="space-y-3">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Atalhos de Marcadores:</p>
                     <div className="flex flex-wrap gap-2">
                        {consistency.personagens.map(char => (
                            <button 
                                key={char.id}
                                onClick={() => insertMarker(char.id)}
                                className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[10px] font-black hover:bg-primary hover:text-white transition-all"
                            >
                                + {char.nome || char.id}
                            </button>
                        ))}
                        {consistency.locais.map(loc => (
                            <button 
                                key={loc.id}
                                onClick={() => insertMarker(loc.id)}
                                className="px-3 py-1.5 rounded-lg bg-accent-green/10 border border-accent-green/20 text-accent-green text-[10px] font-black hover:bg-accent-green hover:text-black transition-all"
                            >
                                + {loc.nome_do_local || loc.id}
                            </button>
                        ))}
                     </div>
                  </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                 <Button fullWidth variant="white" onClick={handleSaveEdit}>Salvar Alterações</Button>
                 <Button fullWidth variant="ghost" onClick={() => setEditingScene(null)}>Cancelar</Button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default VeoPrompts;
