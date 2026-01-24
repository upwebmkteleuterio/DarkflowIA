
import React, { useState, useEffect } from 'react';
import { Project, ScriptItem } from '../types';
import { useThumbnailQueue } from '../hooks/useThumbnailQueue';
import { useNavigate } from 'react-router-dom';
import FullscreenPreview from '../components/Thumbnails/FullscreenPreview';
import SidebarItemList from '../components/Project/SidebarItemList';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ThumbnailConfigPanel from '../components/Thumbnails/ThumbnailConfigPanel';
import ThumbnailMainPanel from '../components/Thumbnails/ThumbnailMainPanel';

interface ThumbnailsProps {
  project: Project;
  onUpdate: (updated: Project) => void;
  onNext: () => void;
}

const Thumbnails: React.FC<ThumbnailsProps> = ({ project, onUpdate, onNext }) => {
  const navigate = useNavigate();
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState((project.items || [])[0]?.id || '');
  
  const [batchConfig, setBatchConfig] = useState({
    mode: 'auto' as 'auto' | 'manual',
    prompt: '',
    style: 'realistic',
    variations: 2,
    titleOnArt: ''
  });

  const {
    isProcessing,
    handleStartBatch,
    confirmBatch,
    showConfirm,
    setShowConfirm,
    totalCost,
    pendingCount,
    canGenerateCount,
    isOutOfCredits,
    availableCredits,
    stats
  } = useThumbnailQueue(project, onUpdate);

  const itemsArray = project.items || [];
  const selectedItem = itemsArray.find(i => i.id === selectedItemId);

  useEffect(() => {
    if (selectedItem) {
      setBatchConfig(prev => ({
        ...prev,
        mode: selectedItem.thumbMode || 'auto',
        prompt: selectedItem.thumbPrompt || '',
        titleOnArt: selectedItem.title // Sincroniza automaticamente ao selecionar item
      }));
    }
  }, [selectedItemId, selectedItem]);

  const updateSelectedItemConfig = (updates: Partial<ScriptItem>) => {
    const updatedItems = itemsArray.map(item => 
      item.id === selectedItemId ? { ...item, ...updates } : item
    );
    onUpdate({ ...project, items: updatedItems });
  };

  const handleModeChange = (mode: 'auto' | 'manual') => {
    setBatchConfig(prev => ({ ...prev, mode }));
    updateSelectedItemConfig({ thumbMode: mode });
  };

  const handlePromptChange = (prompt: string) => {
    setBatchConfig(prev => ({ ...prev, prompt }));
    updateSelectedItemConfig({ thumbPrompt: prompt });
  };

  const handleTitleOnArtChange = (title: string) => {
    setBatchConfig(prev => ({ ...prev, titleOnArt: title }));
  };

  const handleStyleChange = (style: string) => {
    setBatchConfig(prev => ({ ...prev, style }));
  };

  const handleVariationsChange = (count: number) => {
    setBatchConfig(prev => ({ ...prev, variations: count }));
  };

  const downloadImage = async (url: string, title: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `thumb-${title.substring(0, 20).replace(/\s+/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.click();
    }
  };

  const renderThumbBadge = (item: ScriptItem) => {
    if (item.thumbnails && item.thumbnails.length > 0) return <Badge variant="success" pulse>{item.thumbnails.length} ARTES PRONTAS</Badge>;
    if (item.thumbStatus === 'generating') return <Badge variant="primary" pulse>GERANDO...</Badge>;
    if (item.thumbStatus === 'failed') return <Badge variant="error">FALHA</Badge>;
    return <Badge variant="neutral">PENDENTE</Badge>;
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6 md:py-8 h-full overflow-y-auto lg:overflow-hidden animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 md:gap-8 items-start lg:h-full lg:overflow-hidden">
        
        <div className="flex flex-col gap-6 lg:h-full lg:overflow-y-auto custom-scrollbar lg:pr-1 pb-4 lg:pb-10">
          <ThumbnailConfigPanel 
            mode={batchConfig.mode}
            prompt={batchConfig.prompt}
            style={batchConfig.style}
            variations={batchConfig.variations}
            titleOnArt={batchConfig.titleOnArt}
            isProcessing={isProcessing}
            hasScript={!!selectedItem?.script}
            onModeChange={handleModeChange}
            onPromptChange={handlePromptChange}
            onTitleOnArtChange={handleTitleOnArtChange}
            onStyleChange={handleStyleChange}
            onVariationsChange={handleVariationsChange}
          />

          <SidebarItemList 
            title="Lista de Vídeos"
            items={itemsArray}
            selectedId={selectedItemId}
            onSelect={setSelectedItemId}
            renderBadge={renderThumbBadge}
          />
        </div>

        <ThumbnailMainPanel 
          selectedItem={selectedItem}
          projectNiche={project.niche}
          isProcessing={isProcessing}
          onGenerate={() => handleStartBatch(selectedItemId, batchConfig)}
          onNext={onNext}
          onPreview={setFullscreenImage}
          onDownload={downloadImage}
          stats={stats}
        />
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-surface-dark border border-border-dark w-full max-w-md p-8 rounded-[32px] shadow-2xl space-y-8 animate-in zoom-in-95 duration-300">
            
            {/* ESTADO 1: TOTALMENTE SEM CRÉDITOS */}
            {isOutOfCredits ? (
              <>
                <div className="text-center space-y-4">
                  <div className="size-20 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                    <span className="material-symbols-outlined text-4xl">warning</span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight italic">Saldo de Imagens Insuficiente</h3>
                    <p className="text-slate-400 text-sm">Você não possui créditos de imagem disponíveis no momento.</p>
                  </div>
                </div>

                <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 text-center">
                  <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Seu Saldo de Imagens</p>
                  <p className="text-3xl font-black text-white">{availableCredits} <span className="text-xs text-slate-500">créditos</span></p>
                </div>

                <div className="flex flex-col gap-3">
                  <Button size="lg" onClick={() => navigate('/plans')}>Ver Planos & Créditos</Button>
                  <Button variant="ghost" onClick={() => setShowConfirm(false)}>Agora não</Button>
                </div>
              </>
            ) : (
              /* ESTADO 2: SALDO DISPONÍVEL (TOTAL OU PARCIAL) */
              <>
                <div className="text-center space-y-2">
                  <div className="size-16 bg-accent-green/20 text-accent-green rounded-full flex items-center justify-center mx-auto mb-4 border border-accent-green/20">
                    <span className="material-symbols-outlined text-3xl">palette</span>
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight italic">Confirmar Criação</h3>
                  <p className="text-slate-400 text-xs">Resumo da geração de miniaturas.</p>
                </div>

                <div className="space-y-4 text-left">
                  <div className="bg-background-dark/50 border border-border-dark rounded-2xl p-6 space-y-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-bold uppercase tracking-widest">Artes Solicitadas</span>
                      <span className="text-white font-black">{pendingCount} variações</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-bold uppercase tracking-widest">Saldo de Imagens</span>
                      <span className="text-accent-green font-black">{availableCredits} créditos</span>
                    </div>
                    <div className="h-px bg-border-dark"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Custo da Geração</span>
                      <span className="text-primary font-black text-lg">{totalCost} <span className="text-[10px]">créditos</span></span>
                    </div>
                  </div>

                  {/* AVISO DE GERAÇÃO PARCIAL */}
                  {canGenerateCount < pendingCount && (
                    <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl animate-in shake duration-500">
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-orange-500">error_outline</span>
                        <div className="text-left">
                          <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Atenção: Limite de Saldo</p>
                          <p className="text-[11px] text-slate-300 leading-tight mt-1">
                            Você solicitou <strong>{pendingCount} artes</strong>, mas seu saldo permite apenas <strong>{canGenerateCount}</strong>. 
                            <span className="block mt-1 text-white font-bold">Apenas as primeiras {canGenerateCount} variações serão criadas.</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <Button size="lg" onClick={confirmBatch}>Iniciar Geração</Button>
                  <Button variant="ghost" onClick={() => setShowConfirm(false)}>Cancelar</Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <FullscreenPreview 
        url={fullscreenImage} 
        onClose={() => setFullscreenImage(null)}
        onDownload={(url) => downloadImage(url, selectedItem?.title || 'download')}
      />
    </div>
  );
};

export default Thumbnails;
