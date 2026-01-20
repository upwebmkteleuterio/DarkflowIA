
import React, { useState, useEffect } from 'react';
import { Project, ScriptItem } from '../types';
import { useThumbnailQueue } from '../hooks/useThumbnailQueue';
import FullscreenPreview from '../components/Thumbnails/FullscreenPreview';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { TextArea } from '../components/ui/Input';
import SidebarItemList from '../components/Project/SidebarItemList';
import AdvanceButton from '../components/ui/AdvanceButton';

interface ThumbnailsProps {
  project: Project;
  onUpdate: (updated: Project) => void;
  onNext: () => void;
}

const Thumbnails: React.FC<ThumbnailsProps> = ({ project, onUpdate, onNext }) => {
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState(project.items[0]?.id || '');
  
  const [batchConfig, setBatchConfig] = useState({
    mode: 'auto' as 'auto' | 'manual',
    prompt: '',
    style: 'realistic',
    variations: 1
  });

  const {
    isProcessing,
    handleGenerateSingle,
    handleRetry,
    stats
  } = useThumbnailQueue(project, onUpdate);

  const itemsArray = project.items || [];
  const selectedItem = itemsArray.find(i => i.id === selectedItemId);

  useEffect(() => {
    if (selectedItem) {
      setBatchConfig(prev => ({
        ...prev,
        mode: selectedItem.thumbMode || 'auto',
        prompt: selectedItem.thumbPrompt || ''
      }));
    }
  }, [selectedItemId]);

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

  const downloadImage = (url: string, title: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `thumb-${title.substring(0, 20)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderThumbBadge = (item: ScriptItem) => {
    if (item.thumbnails.length > 0) return <Badge variant="success" pulse>{item.thumbnails.length} ARTES PRONTAS</Badge>;
    if (item.thumbStatus === 'generating') return <Badge variant="primary" pulse>GERANDO...</Badge>;
    if (item.thumbStatus === 'failed') return <Badge variant="error">FALHA</Badge>;
    return <Badge variant="neutral">PENDENTE</Badge>;
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-8 animate-in fade-in duration-500 h-full overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 items-start h-full overflow-hidden">
        
        <div className="h-full flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-1 pb-10">
          <SidebarItemList 
            title="Lista de Vídeos"
            items={itemsArray}
            selectedId={selectedItemId}
            onSelect={setSelectedItemId}
            renderBadge={renderThumbBadge}
          />

          <div className="bg-surface-dark border border-border-dark rounded-[32px] shadow-2xl overflow-hidden shrink-0">
            <div className="p-6 border-b border-border-dark bg-card-dark/50">
              <h3 className="text-xl font-black text-white font-display tracking-tight uppercase">Configuração Visual</h3>
            </div>

            <div className="p-6 space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Estratégia para este vídeo</label>
                
                <div onClick={() => handleModeChange('auto')} className={`p-4 rounded-2xl border cursor-pointer transition-all ${batchConfig.mode === 'auto' ? 'border-primary bg-primary/5' : 'border-border-dark bg-background-dark/30 opacity-60'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
                      <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Automático</h4>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed italic">IA analisará o conteúdo.</p>
                </div>

                <div onClick={() => handleModeChange('manual')} className={`p-4 rounded-2xl border cursor-pointer transition-all ${batchConfig.mode === 'manual' ? 'border-primary bg-primary/5' : 'border-border-dark bg-background-dark/30 opacity-60'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-sm">edit_note</span>
                      <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Manual</h4>
                    </div>
                  </div>
                  <TextArea 
                    disabled={batchConfig.mode !== 'manual'}
                    placeholder="Cena específica..."
                    value={batchConfig.prompt}
                    onChange={(e) => handlePromptChange(e.target.value)}
                    className="h-24 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Estilo Visual</label>
                <select 
                  className="w-full bg-surface-dark border border-border-dark rounded-xl py-3 px-3 text-xs text-white outline-none"
                  value={batchConfig.style}
                  onChange={(e) => setBatchConfig(prev => ({...prev, style: e.target.value}))}
                >
                  <option value="realistic">Foto Realista</option>
                  <option value="3d">3D Render</option>
                  <option value="cyber">Cyberpunk</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="h-full flex flex-col overflow-hidden">
          <div className="bg-surface-dark border border-border-dark rounded-[32px] p-8 shadow-2xl flex flex-col flex-1 overflow-hidden relative">
            <div className="p-0 border-b border-border-dark/50 bg-transparent flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 mb-6">
              <div className="flex-1">
                <h3 className="text-2xl font-black text-white leading-tight mb-2 truncate max-w-xl">{selectedItem?.title || 'Selecione um vídeo'}</h3>
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-slate-500 text-sm">tag</span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{project.niche}</span>
                   </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 w-full md:w-auto">
                 <Button 
                   onClick={() => handleGenerateSingle(selectedItemId, batchConfig)}
                   loading={selectedItem?.thumbStatus === 'generating' || isProcessing}
                   icon="brush"
                   size="lg"
                 >
                   Gerar Imagens
                 </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar bg-background-dark/10 p-4 rounded-3xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {selectedItem?.thumbnails && selectedItem.thumbnails.length > 0 ? (
                  selectedItem.thumbnails.map((url, idx) => (
                    <div key={idx} className="group relative aspect-video bg-background-dark rounded-3xl overflow-hidden border border-border-dark shadow-2xl animate-in zoom-in-95 duration-500">
                      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${url}")` }} />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-4 backdrop-blur-[2px]">
                        <Button variant="white" size="md" icon="fullscreen" onClick={() => setFullscreenImage(url)}>Ampliar</Button>
                        <Button variant="primary" size="md" icon="download" onClick={() => downloadImage(url, selectedItem.title)} className="size-12 p-0" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-24 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-border-dark/40 rounded-[40px]">
                    <span className="material-symbols-outlined text-4xl opacity-20">image_search</span>
                    <p className="text-sm font-bold text-white uppercase tracking-tight mt-4">Sem artes geradas</p>
                  </div>
                )}
              </div>
            </div>

            <AdvanceButton 
              isVisible={stats.completed > 0} 
              onClick={onNext} 
              label="Avançar para SEO" 
            />
          </div>
        </div>
      </div>

      <FullscreenPreview 
        url={fullscreenImage} 
        onClose={() => setFullscreenImage(null)}
        onDownload={(url) => downloadImage(url, 'download')}
      />
    </div>
  );
};

export default Thumbnails;
