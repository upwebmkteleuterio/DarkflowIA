
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
  // Segurança: Uso de fallback vazio para evitar erro de leitura de propriedade de undefined
  const [selectedItemId, setSelectedItemId] = useState((project.items || [])[0]?.id || '');
  
  const [batchConfig, setBatchConfig] = useState({
    mode: 'auto' as 'auto' | 'manual',
    prompt: '',
    style: 'realistic',
    variations: 2
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
      console.error("Erro ao baixar imagem:", error);
      const link = document.createElement('a');
      link.href = url;
      link.download = `thumb-${title.substring(0, 20)}.png`;
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
            isProcessing={isProcessing}
            hasScript={!!selectedItem?.script}
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
        onDownload={(url) => downloadImage(url, selectedItem?.title || 'download')}
      />
    </div>
  );
};

export default Thumbnails;
