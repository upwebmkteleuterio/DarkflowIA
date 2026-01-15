
import React, { useState } from 'react';
import { Project } from '../types';
import { useThumbnailQueue } from '../hooks/useThumbnailQueue';
import FullscreenPreview from '../components/Thumbnails/FullscreenPreview';

interface ThumbnailsProps {
  project: Project;
  onUpdate: (updated: Project) => void;
  onNext: () => void;
}

const Thumbnails: React.FC<ThumbnailsProps> = ({ project, onUpdate, onNext }) => {
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  
  // Configurações de Lote de Thumbnail
  const [batchConfig, setBatchConfig] = useState({
    mode: 'auto' as 'auto' | 'manual',
    prompt: '',
    style: 'realistic',
    variations: 1
  });

  const {
    isProcessing,
    handleStartBatch,
    handleRetry,
    stats
  } = useThumbnailQueue(project, onUpdate);

  const itemsArray = project.items || [];

  const downloadImage = (url: string, title: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `thumb-${title.substring(0, 20)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isStartDisabled = isProcessing || stats.pending === 0 || (
    batchConfig.mode === 'manual' && batchConfig.prompt.trim().length < 5
  );

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* COLUNA ESQUERDA: CONFIGURAÇÕES DE ARTE EM LOTE (1/3) */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-8">
          <div className="bg-surface-dark border border-border-dark rounded-[32px] shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-border-dark bg-card-dark/50">
              <h3 className="text-xl font-black text-white font-display tracking-tight uppercase">Configuração de Thumbnails</h3>
              <p className="text-slate-500 text-xs">Defina como a IA criará as artes para o seu lote.</p>
            </div>

            <div className="p-6 space-y-8">
              {/* MODO DE GERAÇÃO */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Estratégia de Prompt</label>
                
                <div 
                  onClick={() => setBatchConfig(prev => ({...prev, mode: 'auto'}))}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${batchConfig.mode === 'auto' ? 'border-primary bg-primary/5' : 'border-border-dark bg-background-dark/30 opacity-60'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
                      <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Automático</h4>
                    </div>
                    <input type="radio" checked={batchConfig.mode === 'auto'} readOnly className="accent-primary" />
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed italic">A IA lerá o roteiro de cada vídeo individualmente para criar artes altamente contextuais.</p>
                </div>

                <div 
                  onClick={() => setBatchConfig(prev => ({...prev, mode: 'manual'}))}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${batchConfig.mode === 'manual' ? 'border-primary bg-primary/5' : 'border-border-dark bg-background-dark/30 opacity-60'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-sm">edit_note</span>
                      <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Manual (Descritivo)</h4>
                    </div>
                    <input type="radio" checked={batchConfig.mode === 'manual'} readOnly className="accent-primary" />
                  </div>
                  <textarea 
                    disabled={batchConfig.mode !== 'manual'}
                    className="w-full h-24 bg-surface-dark border border-border-dark rounded-xl p-3 text-xs text-slate-300 focus:ring-1 focus:ring-primary outline-none transition-all resize-none placeholder:text-slate-600 disabled:opacity-50"
                    placeholder="Descreva a cena que deseja para todas as thumbs (ex: Um astronauta triste em Marte)..."
                    value={batchConfig.prompt}
                    onChange={(e) => setBatchConfig(prev => ({...prev, prompt: e.target.value}))}
                  />
                </div>
              </div>

              {/* VARIAÇÕES */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Artes por Vídeo</label>
                  <span className="bg-primary/20 text-primary text-[10px] font-black px-2 py-0.5 rounded-md">{batchConfig.variations} {batchConfig.variations === 1 ? 'Arte' : 'Artes'}</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map(n => (
                    <button 
                      key={n}
                      onClick={() => setBatchConfig(prev => ({...prev, variations: n}))}
                      className={`py-2 text-xs font-black rounded-lg border transition-all ${batchConfig.variations === n ? 'bg-primary border-primary text-white shadow-lg' : 'bg-background-dark border-border-dark text-slate-500 hover:text-white'}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* ESTILO ARTÍSTICO */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Estilo Visual</label>
                <select 
                  className="w-full bg-surface-dark border border-border-dark rounded-xl py-3 px-3 text-xs text-white outline-none focus:ring-1 focus:ring-primary"
                  value={batchConfig.style}
                  onChange={(e) => setBatchConfig(prev => ({...prev, style: e.target.value}))}
                >
                  <option value="realistic">Foto Realista (Cinema 4D)</option>
                  <option value="3d">3D Render High-Contrast</option>
                  <option value="cyber">Cyberpunk Dark Channel</option>
                  <option value="anime">Anime / Ilustrado</option>
                  <option value="minimalist">Minimalista Moderno</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: FILA DE ARTES (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Resumo Rápido */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-surface-dark border border-border-dark p-4 rounded-2xl flex flex-col items-center">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Vídeos Total</span>
              <p className="text-xl font-black text-white">{stats.total}</p>
            </div>
            <div className="bg-surface-dark border border-border-dark p-4 rounded-2xl flex flex-col items-center">
              <span className="text-[9px] font-black text-accent-green uppercase tracking-widest">Artes Prontas</span>
              <p className="text-xl font-black text-white">{stats.completed}</p>
            </div>
            <div className="bg-surface-dark border border-border-dark p-4 rounded-2xl flex flex-col items-center">
              <span className="text-[9px] font-black text-primary uppercase tracking-widest">Fila</span>
              <p className="text-xl font-black text-white">{stats.pending}</p>
            </div>
            <div className="bg-surface-dark border border-border-dark p-4 rounded-2xl flex flex-col items-center">
              <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">Falhas</span>
              <p className="text-xl font-black text-white">{stats.failed}</p>
            </div>
          </div>

          {/* Ações da Fila */}
          <div className="bg-surface-dark border border-border-dark p-6 rounded-[32px] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className={`size-12 rounded-2xl flex items-center justify-center ${isProcessing ? 'bg-primary animate-pulse' : 'bg-white/5 text-slate-500'}`}>
                <span className="material-symbols-outlined">{isProcessing ? 'palette' : 'image'}</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white leading-tight">
                  {isProcessing ? 'Processando Lote...' : 'Produção de Artes'}
                </h3>
                <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                  {stats.completed}/{stats.total} Vídeos Com Capa
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button 
                onClick={() => handleStartBatch(batchConfig)}
                disabled={isStartDisabled}
                className="flex-1 md:flex-none px-8 py-3.5 bg-primary hover:bg-primary-hover text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">brush</span>
                Iniciar Produção
              </button>
              
              {stats.completed > 0 && (
                <button 
                  onClick={onNext}
                  className="flex-1 md:flex-none px-8 py-3.5 bg-white text-black font-black text-xs uppercase tracking-[0.2em] rounded-xl hover:bg-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  Próxima Etapa
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              )}
            </div>
          </div>

          {/* Lista de Itens com Preview de Thumb */}
          <div className="bg-surface-dark border border-border-dark rounded-[32px] shadow-2xl overflow-hidden">
            <div className="grid grid-cols-[100px_1fr_180px_120px] p-4 border-b border-border-dark bg-card-dark/30 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <span className="text-center">Arte</span>
              <span className="ml-4">Título do Vídeo</span>
              <span className="text-center">Status</span>
              <span className="text-right mr-4">Ações</span>
            </div>

            <div className="divide-y divide-border-dark/30 max-h-[600px] overflow-y-auto custom-scrollbar">
              {itemsArray.map((item) => (
                <div key={item.id} className="grid grid-cols-[100px_1fr_180px_120px] p-4 items-center hover:bg-white/5 transition-colors group">
                  {/* Preview da Imagem */}
                  <div className="flex justify-center">
                    {item.thumbnails && item.thumbnails[0] ? (
                      <div 
                        onClick={() => setFullscreenImage(item.thumbnails[0])}
                        className="w-16 aspect-video rounded-md bg-cover bg-center border border-border-dark cursor-zoom-in hover:scale-110 transition-transform shadow-lg"
                        style={{ backgroundImage: `url(${item.thumbnails[0]})` }}
                      />
                    ) : (
                      <div className="w-16 aspect-video rounded-md bg-background-dark border border-border-dark flex items-center justify-center text-slate-700">
                        <span className="material-symbols-outlined text-xs">image_not_supported</span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs font-bold text-slate-200 truncate pr-4 max-w-full" title={item.title}>
                    {item.title}
                  </p>
                  
                  <div className="flex justify-center">
                    {item.thumbnails.length > 0 && (
                      <span className="text-[9px] font-black text-accent-green bg-accent-green/10 px-3 py-1 rounded-full border border-accent-green/20">
                        {item.thumbnails.length} {item.thumbnails.length === 1 ? 'ARTE' : 'ARTES'}
                      </span>
                    )}
                    {item.thumbStatus === 'generating' && <span className="text-[9px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 animate-pulse">GERANDO ARTE...</span>}
                    {item.thumbStatus === 'pending' && <span className="text-[9px] font-black text-slate-500 bg-slate-500/10 px-3 py-1 rounded-full border border-slate-500/20">NA FILA</span>}
                    {item.thumbStatus === 'failed' && <span className="text-[9px] font-black text-red-500 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">FALHA</span>}
                    {(!item.thumbStatus && item.thumbnails.length === 0) && <span className="text-[9px] font-black text-slate-600">---</span>}
                  </div>

                  <div className="flex justify-end gap-1.5 pr-2">
                    {item.thumbnails.length > 0 && (
                      <>
                        <button 
                          onClick={() => setFullscreenImage(item.thumbnails[0])}
                          className="size-8 bg-white/5 hover:bg-primary hover:text-white rounded-lg flex items-center justify-center text-slate-400 transition-all border border-border-dark"
                          title="Ver em Tela Cheia"
                        >
                          <span className="material-symbols-outlined text-base">fullscreen</span>
                        </button>
                        <button 
                          onClick={() => downloadImage(item.thumbnails[0], item.title)}
                          className="size-8 bg-white/5 hover:bg-accent-green hover:text-black rounded-lg flex items-center justify-center text-slate-400 transition-all border border-border-dark"
                          title="Baixar Thumbnail"
                        >
                          <span className="material-symbols-outlined text-base">download</span>
                        </button>
                      </>
                    )}
                    
                    {(item.thumbStatus === 'failed' || (item.thumbnails.length > 0 && !isProcessing)) && (
                      <button 
                        onClick={() => handleRetry(item.id, batchConfig)}
                        disabled={isProcessing}
                        className="size-8 bg-white/5 hover:bg-primary hover:text-white rounded-lg flex items-center justify-center text-slate-400 transition-all border border-border-dark disabled:opacity-30"
                        title="Regerar Artes"
                      >
                        <span className="material-symbols-outlined text-base">refresh</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
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
