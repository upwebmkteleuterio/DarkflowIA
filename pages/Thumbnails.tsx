
import React, { useState, useEffect } from 'react';
import { Project, ScriptItem } from '../types';
import { useThumbnailQueue } from '../hooks/useThumbnailQueue';
import FullscreenPreview from '../components/Thumbnails/FullscreenPreview';
import SidebarItemList from '../components/Project/SidebarItemList';
import Badge from '../components/ui/Badge';
import ThumbnailConfigPanel from '../components/Thumbnails/ThumbnailConfigPanel';
import ThumbnailMainPanel from '../components/Thumbnails/ThumbnailMainPanel';

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
    variations: 2 // Padrão solicitado: 2 imagens
  });

  const {
    isProcessing,
    handleGenerateSingle,
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

  const handleStyleChange = (style: string) => {
    setBatchConfig(prev => ({ ...prev, style }));
  };

  const handleVariationsChange = (count: number) => {
    setBatchConfig(prev => ({ ...prev, variations: count }));
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
    if (item.thumbnails && item.thumbnails.length > 0) return <Badge variant="success" pulse>{item.thumbnails.length} ARTES PRONTAS</Badge>;
    if (item.thumbStatus === 'generating') return <Badge variant="primary" pulse>GERANDO...</Badge>;
    if (item.thumbStatus === 'failed') return <Badge variant="error">FALHA</Badge>;
    return <Badge variant="neutral">PENDENTE</Badge>;
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6 md:py-8 h-full overflow-y-auto lg:overflow-hidden animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 md:gap-8 items-start lg:h-full lg:overflow-hidden">
        
        {/* Lado Esquerdo: Configurações e Lista (No mobile ficam no topo) */}
        <div className="flex flex-col gap-6 lg:h-full lg:overflow-y-auto custom-scrollbar lg:pr-1 pb-4 lg:pb-10">
          <ThumbnailConfigPanel 
            mode={batchConfig.mode}
            prompt={batchConfig.prompt}
            style={batchConfig.style}
            variations={batchConfig.variations}
            isProcessing={isProcessing}
            onModeChange={handleModeChange}
            onPromptChange={handlePromptChange}
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

        {/* Lado Direito: Editor Principal e Galeria */}
        <ThumbnailMainPanel 
          selectedItem={selectedItem}
          projectNiche={project.niche}
          isProcessing={isProcessing}
          onGenerate={() => handleGenerateSingle(selectedItemId, batchConfig)}
          onNext={onNext}
          onPreview={setFullscreenImage}
          onDownload={downloadImage}
          stats={stats}
        />
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
