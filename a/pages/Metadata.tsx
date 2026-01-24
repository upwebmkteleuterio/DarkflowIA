
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Project, ScriptItem } from '../types';
import { useMetadata } from '../hooks/useMetadata';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import SidebarItemList from '../components/Project/SidebarItemList';
import SEOMainPanel from '../components/Metadata/SEOMainPanel';

interface MetadataProps {
  project: Project;
  onUpdate: (updated: Project) => void;
}

const Metadata: React.FC<MetadataProps> = ({ project, onUpdate }) => {
  const navigate = useNavigate();
  const {
    loading,
    batchLoading,
    copyingDesc,
    copyingChap,
    copyingTags,
    selectedItemId,
    setSelectedItemId,
    handleGenerateSingle,
    handleGenerateBatch,
    copyToClipboard
  } = useMetadata(project, onUpdate);

  const itemsArray = project.items || [];
  const selectedItem = itemsArray.find(i => i.id === selectedItemId);
  const completedScripts = itemsArray.filter(i => i.status === 'completed');

  const renderSEOBadge = (item: ScriptItem) => {
    const isOptimized = !!(item.description && item.tags);
    if (isOptimized) return <Badge variant="success" pulse>OTIMIZADO</Badge>;
    if (loading && selectedItemId === item.id) return <Badge variant="primary" pulse>ANALISANDO...</Badge>;
    return <Badge variant="neutral">PENDENTE</Badge>;
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6 md:py-8 min-h-full flex flex-col animate-in fade-in duration-500">
      {/* Bloco Superior */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 bg-surface-dark border border-border-dark p-6 rounded-[32px] shadow-xl shrink-0">
        <div className="flex items-center gap-5">
          <div className="bg-primary/10 size-14 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
            <span className="material-symbols-outlined text-3xl">query_stats</span>
          </div>
          <div className="text-left">
            <h2 className="text-xl font-black text-white font-display tracking-tight uppercase italic">Engenharia de <span className="text-primary">SEO</span></h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Otimização Algorítmica em Massa</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button 
            variant="outline"
            onClick={handleGenerateBatch}
            disabled={batchLoading || completedScripts.length === 0}
            loading={batchLoading}
            icon="auto_mode"
            size="lg"
            className="flex-1 md:flex-none"
          >
            Otimizar Lote Inteiro
          </Button>
          
          <Button 
            variant="white"
            icon="rocket_launch"
            size="lg"
            onClick={() => navigate(`/projects/${project.id}/export`)}
            className="flex-1 md:flex-none"
          >
            Finalizar Projeto
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 md:gap-8 items-start flex-1">
        
        {/* Bloco Lateral */}
        <div className="flex flex-col gap-6 lg:sticky lg:top-8">
           <div className="bg-surface-dark border border-border-dark p-6 rounded-[32px] shadow-lg relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 size-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
              <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                 <span className="material-symbols-outlined text-sm">psychology</span>
                 Tecnologia SEO Flow
              </h4>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="size-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary shrink-0">1</div>
                  <p className="text-[11px] text-slate-400 leading-tight"><strong>Scan Semântico:</strong> Identificação de palavras-chave latentes.</p>
                </div>
                <div className="flex gap-3">
                  <div className="size-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary shrink-0">2</div>
                  <p className="text-[11px] text-slate-400 leading-tight"><strong>Indexação:</strong> Geração de timestamps para retenção.</p>
                </div>
              </div>
           </div>

           <SidebarItemList 
              title="Vídeos do Lote"
              items={itemsArray}
              selectedId={selectedItemId}
              onSelect={setSelectedItemId}
              renderBadge={renderSEOBadge}
           />
        </div>

        {/* Bloco Principal */}
        <SEOMainPanel 
          selectedItem={selectedItem}
          loading={loading}
          onGenerate={() => handleGenerateSingle(selectedItemId)}
          copyingDesc={copyingDesc}
          copyingChap={copyingChap}
          copyingTags={copyingTags}
          onCopy={copyToClipboard}
          onUpdateMetadata={(field, value) => {
            const updatedItems = itemsArray.map(i => i.id === selectedItemId ? { ...i, [field]: value } : i);
            onUpdate({ ...project, items: updatedItems });
          }}
        />

      </div>
    </div>
  );
};

export default Metadata;
