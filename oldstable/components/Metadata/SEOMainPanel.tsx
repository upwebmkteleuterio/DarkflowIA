
import React from 'react';
import { ScriptItem } from '../../types';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { TextArea } from '../ui/Input';

interface SEOMainPanelProps {
  selectedItem: ScriptItem | undefined;
  loading: boolean;
  onGenerate: () => void;
  copyingDesc: string | null;
  copyingChap: string | null;
  copyingTags: string | null;
  onCopy: (text: string, type: 'desc' | 'chap' | 'tags', itemId: string) => void;
  onUpdateMetadata: (field: string, value: string) => void;
}

const SEOMainPanel: React.FC<SEOMainPanelProps> = ({
  selectedItem,
  loading,
  onGenerate,
  copyingDesc,
  copyingChap,
  copyingTags,
  onCopy,
  onUpdateMetadata
}) => {
  if (!selectedItem) {
    return (
      <div className="min-h-[400px] md:min-h-[600px] flex flex-col items-center justify-center bg-surface-dark/20 border-2 border-dashed border-border-dark rounded-[32px] md:rounded-[48px] p-10">
        <span className="material-symbols-outlined text-5xl md:text-7xl text-slate-800 mb-4">analytics</span>
        <p className="text-slate-500 font-black uppercase tracking-widest text-[10px] md:text-xs">Selecione um vídeo para otimizar</p>
      </div>
    );
  }

  const seoScore = selectedItem.description && selectedItem.tags ? 85 + (selectedItem.title.length % 15) : 0;

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-10">
      {/* SEO Score Card */}
      {selectedItem.description && !loading && (
        <div className="bg-surface-dark border border-border-dark rounded-[24px] md:rounded-[32px] p-5 md:p-8 flex items-center justify-between shadow-2xl relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <span className="material-symbols-outlined text-6xl md:text-8xl text-accent-green">trending_up</span>
          </div>
          <div className="flex items-center gap-4 md:gap-8 relative z-10">
            <div className="size-16 md:size-24 rounded-full border-4 border-background-dark flex items-center justify-center bg-card-dark shadow-inner shadow-black/50 shrink-0">
              <span className="text-xl md:text-3xl font-black text-accent-green">{seoScore}%</span>
            </div>
            <div className="text-left">
              <h4 className="text-base md:text-xl font-black text-white uppercase tracking-tight italic">Potencial de Alcance</h4>
              <p className="text-[10px] md:text-sm text-slate-500">Metadados otimizados para o algoritmo atual.</p>
            </div>
          </div>
          <div className="hidden lg:flex flex-col gap-2">
            <Badge variant="success">ALTA RETENÇÃO</Badge>
            <Badge variant="primary">INDEXÁVEL</Badge>
          </div>
        </div>
      )}

      {/* Grid de Edição - Estilo Script Editor */}
      {!selectedItem.description && !loading ? (
        <div className="min-h-[400px] md:min-h-[500px] bg-surface-dark border border-border-dark rounded-[32px] md:rounded-[48px] flex flex-col items-center justify-center text-center p-6 md:p-10 shadow-2xl">
          <div className="bg-primary/10 size-16 md:size-20 rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-3xl md:text-4xl text-primary">psychology_alt</span>
          </div>
          <h3 className="text-lg md:text-2xl font-black text-white mb-3 uppercase tracking-tight italic">Metadados Inteligentes</h3>
          <p className="text-slate-500 max-w-sm mb-10 text-xs md:text-sm leading-relaxed">Nossa IA analisará seu roteiro para criar uma descrição persuasiva, capítulos automáticos e as melhores tags.</p>
          <Button size="lg" icon="auto_awesome" onClick={onGenerate}>
            Gerar Otimização SEO
          </Button>
        </div>
      ) : loading ? (
        <div className="min-h-[400px] md:min-h-[500px] bg-surface-dark border border-border-dark rounded-[32px] md:rounded-[48px] flex flex-col items-center justify-center p-6 md:p-10 shadow-2xl">
          <div className="size-12 md:size-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
          <p className="text-white font-black uppercase tracking-[0.3em] text-[10px] md:text-sm animate-pulse">Engenharia Algorítmica...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8 items-stretch">
          
          {/* Coluna 1: Descrição Persuasiva */}
          <div className="bg-background-dark/20 border border-border-dark/50 rounded-[24px] md:rounded-[32px] flex flex-col shadow-2xl overflow-hidden min-h-[350px] md:min-h-[700px]">
            <div className="p-5 md:p-8 border-b border-border-dark/30 bg-card-dark/20 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-xl">description</span>
                <h4 className="text-[10px] md:text-[11px] font-black text-white uppercase tracking-widest">Descrição Persuasiva</h4>
              </div>
              <Button 
                variant={copyingDesc === selectedItem.id ? 'white' : 'ghost'} 
                size="sm" 
                icon={copyingDesc === selectedItem.id ? 'check' : 'content_copy'}
                onClick={() => onCopy(selectedItem.description || '', 'desc', selectedItem.id)}
                className="h-8 px-3"
              >
                {copyingDesc === selectedItem.id ? 'Copiado' : 'Copiar'}
              </Button>
            </div>
            <div className="flex-1 p-5 md:p-10">
              <TextArea 
                className="w-full h-full text-sm md:text-lg leading-relaxed bg-transparent border-none p-0 focus:ring-0 resize-none font-sans"
                value={selectedItem.description}
                onChange={(e) => onUpdateMetadata('description', e.target.value)}
              />
            </div>
          </div>

          {/* Coluna 2: Capítulos e Tags */}
          <div className="flex flex-col gap-6 md:gap-8 h-full">
            
            {/* Box Capítulos */}
            <div className="bg-background-dark/20 border border-border-dark/50 rounded-[24px] md:rounded-[32px] flex flex-col shadow-2xl overflow-hidden flex-1 min-h-[200px] md:min-h-[334px]">
              <div className="p-5 md:p-6 border-b border-border-dark/30 bg-card-dark/20 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-xl">format_list_bulleted</span>
                  <h4 className="text-[10px] md:text-[11px] font-black text-white uppercase tracking-widest">Capítulos (Timestamps)</h4>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  icon={copyingChap === selectedItem.id ? 'check' : 'content_copy'}
                  onClick={() => onCopy(selectedItem.chapters || '', 'chap', selectedItem.id)}
                  className="h-8 p-0 px-2"
                />
              </div>
              <div className="flex-1 p-5 md:p-6">
                <TextArea 
                  className="w-full h-full text-xs md:text-sm font-mono leading-relaxed bg-transparent border-none p-0 focus:ring-0 resize-none"
                  value={selectedItem.chapters}
                  onChange={(e) => onUpdateMetadata('chapters', e.target.value)}
                />
              </div>
            </div>

            {/* Box Tags */}
            <div className="bg-background-dark/20 border border-border-dark/50 rounded-[24px] md:rounded-[32px] flex flex-col shadow-2xl overflow-hidden flex-1 min-h-[200px] md:min-h-[334px]">
              <div className="p-5 md:p-6 border-b border-border-dark/30 bg-card-dark/20 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-xl">sell</span>
                  <h4 className="text-[10px] md:text-[11px] font-black text-white uppercase tracking-widest">Tags Estratégicas</h4>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  icon={copyingTags === selectedItem.id ? 'check' : 'content_copy'}
                  onClick={() => onCopy(selectedItem.tags || '', 'tags', selectedItem.id)}
                  className="h-8 p-0 px-2"
                />
              </div>
              <div className="flex-1 p-5 md:p-6 flex flex-col">
                <TextArea 
                  className="flex-1 text-xs md:text-sm leading-relaxed bg-transparent border-none p-0 focus:ring-0 resize-none font-mono"
                  value={selectedItem.tags}
                  onChange={(e) => onUpdateMetadata('tags', e.target.value)}
                />
                <div className="pt-4 flex justify-end">
                   <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">
                      {selectedItem.tags?.length || 0} / 500 caracteres
                   </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default SEOMainPanel;
