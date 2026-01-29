
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { VeoProject, VeoConsistency } from '../types';
import VeoInput from '../components/Veo/VeoInput';
import VeoConsistencyPanel from '../components/Veo/VeoConsistencyPanel';
import VeoPrompts from '../components/Veo/VeoPrompts';
import { analyzeVeoScript, generateVeoScenes } from '../services/geminiService';
import Button from '../components/ui/Button';
import DashboardToolbar from '../components/Dashboard/DashboardToolbar';
import Badge from '../components/ui/Badge';

type VeoView = 'dashboard' | 'editor';
const VEO_STORAGE_KEY = 'darkflow_veo_projects';

const VeoScript: React.FC = () => {
  const location = useLocation();
  const [view, setView] = useState<VeoView>('dashboard');
  const [step, setStep] = useState<'input' | 'consistency' | 'prompts'>('input');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [veoProjects, setVeoProjects] = useState<VeoProject[]>(() => {
    const saved = localStorage.getItem(VEO_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [currentProject, setCurrentProject] = useState<VeoProject | null>(null);

  // Sincroniza com localStorage sempre que a lista mudar
  useEffect(() => {
    localStorage.setItem(VEO_STORAGE_KEY, JSON.stringify(veoProjects));
  }, [veoProjects]);

  // RESET CRÍTICO: Se o usuário clicar no menu "Veo 3 Script", forçamos o retorno ao dashboard
  useEffect(() => {
    // Detectamos se a rota é exatamente /veo-script sem parâmetros extras
    if (location.pathname === '/veo-script') {
        setView('dashboard');
        setCurrentProject(null);
    }
  }, [location.pathname]);

  const saveProjectToList = (project: VeoProject) => {
    setVeoProjects(prev => {
      const exists = prev.find(p => p.id === project.id);
      if (exists) return prev.map(p => p.id === project.id ? project : p);
      return [project, ...prev];
    });
  };

  const handleCreateNew = () => {
    const newProj: VeoProject = {
      id: `veo-${Date.now()}`,
      titulo: 'Novo Vídeo VEO 3',
      roteiro_original: ''
    };
    setCurrentProject(newProj);
    setStep('input');
    setView('editor');
  };

  const handleAnalyze = async (titulo: string, roteiro: string) => {
    setLoading(true);
    try {
      const consistency = await analyzeVeoScript(roteiro);
      const updated: VeoProject = {
        ...currentProject!,
        titulo,
        roteiro_original: roteiro,
        consistency
      };
      setCurrentProject(updated);
      saveProjectToList(updated);
      setStep('consistency');
    } catch (error) {
      console.error("Erro na análise:", error);
      alert("Falha ao analisar o roteiro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePrompts = async () => {
    if (!currentProject?.consistency) return;
    setLoading(true);
    try {
      const result = await generateVeoScenes(currentProject.roteiro_original, currentProject.consistency);
      const updated: VeoProject = {
        ...currentProject,
        scenes: result.scenes,
        script_com_cenas: result.script_com_cenas
      };
      setCurrentProject(updated);
      saveProjectToList(updated);
      setStep('prompts');
    } catch (error) {
      console.error("Erro ao gerar prompts:", error);
      alert("Falha ao gerar os prompts do VEO 3.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProject = (updated: VeoProject) => {
    setCurrentProject(updated);
    saveProjectToList(updated);
  };

  const filteredProjects = veoProjects.filter(p => 
    p.titulo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (view === 'dashboard') {
    return (
      <div className="max-w-[1400px] mx-auto px-4 md:px-10 py-8 md:py-12 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="space-y-1 text-left">
            <h2 className="text-white text-3xl md:text-5xl font-black tracking-tighter font-display">
              Script <span className="text-primary italic">VEO 3</span>
            </h2>
            <p className="text-slate-400 text-sm font-medium">Gerencie seus projetos cinematográficos VEO.</p>
          </div>
          
          <Button 
            size="lg" 
            icon="add" 
            onClick={handleCreateNew}
            className="group"
          >
            Novo Script VEO
          </Button>
        </div>

        <DashboardToolbar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProjects.map((project) => (
            <div 
              key={project.id} 
              onClick={() => { 
                setCurrentProject(project); 
                setView('editor'); 
                setStep(project.scenes ? 'prompts' : (project.consistency ? 'consistency' : 'input')); 
              }}
              className="group bg-surface-dark rounded-2xl border border-border-dark p-6 hover:border-primary/50 hover:shadow-2xl transition-all cursor-pointer relative flex flex-col h-[200px] text-left"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="bg-primary/10 size-10 rounded-xl flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">movie_edit</span>
                </div>
                <Badge variant="success">VEO 3</Badge>
              </div>
              <h4 className="text-white text-lg font-bold truncate group-hover:text-primary transition-colors">{project.titulo}</h4>
              <p className="text-slate-500 text-xs mt-2 line-clamp-2">{project.roteiro_original.substring(0, 100)}...</p>
              <div className="mt-auto pt-4 border-t border-border-dark flex items-center justify-between text-[10px] font-black text-slate-500 uppercase">
                <span>Cenas: {project.scenes?.length || 0}</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </div>
          ))}

          {filteredProjects.length === 0 && (
            <button
              onClick={handleCreateNew}
              className="group border-2 border-dashed border-border-dark rounded-2xl flex flex-col items-center justify-center p-10 hover:border-primary/50 transition-all duration-300 bg-surface-dark/20 min-h-[200px] w-full"
            >
              <div className="size-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-all">
                <span className="material-symbols-outlined text-3xl">add</span>
              </div>
              <p className="text-white font-black text-[10px] uppercase tracking-widest">Criar Script VEO</p>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden animate-in fade-in duration-500 bg-background-dark">
      <header className="border-b border-border-dark bg-background-dark pt-6 px-4 md:px-8 shrink-0">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setView('dashboard')} className="size-10 flex items-center justify-center rounded-xl bg-surface-dark border border-border-dark text-slate-400 hover:text-white transition-all">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h2 className="text-xl md:text-2xl font-bold text-white truncate max-w-[250px] md:max-w-xl text-left">{currentProject?.titulo}</h2>
          </div>
          <Badge variant="primary" pulse>VEO 3 ENGINE</Badge>
        </div>
        
        <div className="flex gap-6 md:gap-8 pb-1 overflow-x-auto custom-scrollbar whitespace-nowrap">
          <button 
            onClick={() => setStep('input')} 
            className={`pb-4 px-2 font-bold text-xs md:text-sm uppercase tracking-widest transition-all ${step === 'input' ? 'border-b-2 border-primary text-primary' : 'text-slate-400'}`}
          >
            1. Entrada
          </button>
          <button 
            onClick={() => currentProject?.consistency && setStep('consistency')} 
            disabled={!currentProject?.consistency}
            className={`pb-4 px-2 font-bold text-xs md:text-sm uppercase tracking-widest transition-all ${step === 'consistency' ? 'border-b-2 border-primary text-primary' : 'text-slate-400 disabled:opacity-30'}`}
          >
            2. Consistência
          </button>
          <button 
            onClick={() => currentProject?.scenes && setStep('prompts')} 
            disabled={!currentProject?.scenes}
            className={`pb-4 px-2 font-bold text-xs md:text-sm uppercase tracking-widest transition-all ${step === 'prompts' ? 'border-b-2 border-primary text-primary' : 'text-slate-400 disabled:opacity-30'}`}
          >
            3. Prompts
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
        {step === 'input' && (
          <VeoInput 
            loading={loading} 
            initialTitulo={currentProject?.titulo}
            initialRoteiro={currentProject?.roteiro_original}
            onAnalyze={handleAnalyze} 
          />
        )}
        {step === 'consistency' && currentProject?.consistency && (
          <VeoConsistencyPanel 
            consistency={currentProject.consistency} 
            loading={loading}
            onUpdate={(updated) => handleUpdateProject({ ...currentProject!, consistency: updated })}
            onGenerate={handleGeneratePrompts}
          />
        )}
        {step === 'prompts' && currentProject?.scenes && (
          <VeoPrompts 
            scenes={currentProject.scenes} 
            consistency={currentProject.consistency!}
            scriptComCenas={currentProject.script_com_cenas}
            onUpdateScenes={(updatedScenes) => handleUpdateProject({ ...currentProject!, scenes: updatedScenes })}
            onBack={() => setStep('consistency')}
          />
        )}
      </main>
    </div>
  );
};

export default VeoScript;
