
import React, { useState } from 'react';
import { Project } from '../types';
import { useVoiceover } from '../hooks/useVoiceover';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

interface VoiceoverProps {
  project: Project;
  onUpdate: (updated: Project) => void;
  onNext: () => void;
}

const VOICES = [
  { name: 'Kore', label: 'Masculino - Autoritário', preview: 'Voz ideal para documentários e canais de curiosidades.' },
  { name: 'Puck', label: 'Feminino - Suave', preview: 'Excelente para storytelling emocional e vlogs narrados.' },
  { name: 'Charon', label: 'Masculino - Profundo', preview: 'Voz grave para canais de terror e mistério.' },
  { name: 'Fenrir', label: 'Masculino - Enérgico', preview: 'Voz rápida para canais de notícias e tech.' },
  { name: 'Zephyr', label: 'Feminino - Profissional', preview: 'Voz equilibrada para tutoriais e negócios.' },
];

const Voiceover: React.FC<VoiceoverProps> = ({ project, onUpdate, onNext }) => {
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  const { isProcessing, handleGenerateVoice, handleGenerateBatch, stats } = useVoiceover(project, onUpdate);

  const itemsArray = project.items || [];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h2 className="text-3xl font-black text-white font-display uppercase tracking-tight">Locução <span className="text-primary italic">Neural</span></h2>
          <p className="text-slate-500 text-sm font-medium mt-1">Gere narrações humanas em lote para seus {itemsArray.length} roteiros.</p>
        </div>

        <div className="flex gap-3">
          <Button 
            variant="white"
            icon="arrow_forward"
            size="lg"
            onClick={onNext}
            disabled={stats.voiced === 0}
          >
            Avançar para SEO
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Painel de Vozes */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-surface-dark border border-border-dark rounded-[32px] p-8 shadow-2xl">
             <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
               <span className="material-symbols-outlined text-primary">record_voice_over</span>
               Catálogo de Vozes
             </h3>

             <div className="space-y-3">
               {VOICES.map(voice => (
                 <button
                    key={voice.name}
                    onClick={() => setSelectedVoice(voice.name)}
                    className={`w-full p-4 rounded-2xl text-left border transition-all ${
                      selectedVoice === voice.name 
                      ? 'bg-primary/10 border-primary shadow-lg shadow-primary/5' 
                      : 'bg-background-dark/30 border-transparent hover:border-white/10'
                    }`}
                 >
                    <div className="flex items-center justify-between mb-1">
                       <p className={`font-black text-sm uppercase tracking-tight ${selectedVoice === voice.name ? 'text-primary' : 'text-white'}`}>
                         {voice.label}
                       </p>
                       {selectedVoice === voice.name && <span className="material-symbols-outlined text-primary text-sm">check_circle</span>}
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">{voice.preview}</p>
                 </button>
               ))}
             </div>

             <div className="mt-8 pt-8 border-t border-border-dark/50">
                <Button 
                  fullWidth 
                  size="lg" 
                  icon="campaign" 
                  loading={isProcessing}
                  onClick={() => handleGenerateBatch(selectedVoice)}
                  disabled={stats.pending === 0}
                >
                  {isProcessing ? 'Narrando...' : 'Narrar Fila em Lote'}
                </Button>
                <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest text-center mt-4">
                  {stats.voiced} de {stats.ready} vídeos com áudio
                </p>
             </div>
          </div>
        </div>

        {/* Fila de Itens */}
        <div className="lg:col-span-2 space-y-4">
           {itemsArray.map(item => (
             <div key={item.id} className="bg-surface-dark border border-border-dark p-6 rounded-3xl flex items-center justify-between gap-6 group hover:border-primary/30 transition-all">
                <div className="flex-1 min-w-0">
                   <h4 className="text-sm font-bold text-white truncate mb-1">{item.title}</h4>
                   <div className="flex items-center gap-3">
                      {item.voiceStatus === 'completed' ? (
                        <Badge variant="success">Áudio Pronto</Badge>
                      ) : item.voiceStatus === 'generating' ? (
                        <Badge variant="primary" pulse>Gerando Locução...</Badge>
                      ) : (
                        <Badge variant="neutral">Aguardando</Badge>
                      )}
                      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                        {item.script?.split(' ').length || 0} palavras
                      </span>
                   </div>
                </div>

                <div className="flex items-center gap-3">
                   {item.audioUrl && (
                     <audio src={item.audioUrl} controls className="h-10 w-48 rounded-lg brightness-75 contrast-125" />
                   )}
                   
                   <Button 
                    variant="ghost" 
                    icon={item.voiceStatus === 'completed' ? 'refresh' : 'play_arrow'}
                    size="sm"
                    loading={item.voiceStatus === 'generating'}
                    onClick={() => handleGenerateVoice(item.id, selectedVoice)}
                    className="size-10 p-0"
                   />
                </div>
             </div>
           ))}

           {itemsArray.length === 0 && (
             <div className="py-20 text-center text-slate-500 bg-surface-dark/10 rounded-[48px] border-2 border-dashed border-border-dark">
                <span className="material-symbols-outlined text-6xl mb-4 opacity-10">mic_off</span>
                <p className="font-bold">Nenhum roteiro pronto para locução</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Voiceover;
