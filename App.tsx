
import React, { useState, useCallback, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useParams, Link } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Ideation from './pages/Ideation';
import Script from './pages/Script';
import Thumbnails from './pages/Thumbnails';
import Metadata from './pages/Metadata';
import TrendHunter from './pages/TrendHunter';
import Pricing from './pages/Pricing';
import { Project, ProjectStep } from './types';

const STORAGE_KEY = 'darkflow_ai_projects';

const INITIAL_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Mistérios do Espaço',
    niche: 'Espaço',
    baseTheme: 'Exploração de buracos negros e o fim do universo',
    createdAt: new Date().toISOString(),
    titles: [
      { id: 'ex1', title: 'Mistérios do Espaço', tags: ['espaco', 'ciencia'], ctrScore: 'High' }
    ],
    script: '',
    thumbnails: [],
    targetAudience: 'Entusiastas de Astronomia',
    emotionalTrigger: 'curiosity',
    format: 'top10'
  }
];

const ProjectFlow: React.FC<{ projects: Project[], onUpdate: (p: Project) => void }> = ({ projects, onUpdate }) => {
  const { id } = useParams();
  const [step, setStep] = useState<ProjectStep>(ProjectStep.IDEATION);
  
  const project = projects.find(p => p.id === id);

  if (!project) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4">
        <span className="material-symbols-outlined text-6xl animate-pulse">search</span>
        <p className="text-xl font-bold">Projeto não encontrado</p>
        <Link to="/" className="text-primary hover:underline">Voltar ao início</Link>
      </div>
    );
  }

  const isTitleReady = project.titles.length > 0 && 
                       project.name !== 'Novo Projeto de Vídeo' && 
                       project.name.trim() !== '';

  const isScriptReady = !!project.script;

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <header className="border-b border-border-dark bg-background-dark pt-6 px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold font-display tracking-tight text-white truncate max-w-[300px] md:max-w-[500px]">
              Projeto: {project.name || 'Sem Nome'}
            </h2>
            <p className="text-slate-500 text-xs md:text-sm">Fluxo de automação inteligente</p>
          </div>
          <div className="flex items-center gap-2">
          </div>
        </div>
        <div className="flex gap-4 md:gap-8 overflow-x-auto custom-scrollbar whitespace-nowrap">
          <button 
            onClick={() => setStep(ProjectStep.IDEATION)}
            className={`flex items-center gap-2 border-b-2 pb-4 px-2 transition-all ${step === ProjectStep.IDEATION ? 'border-primary text-primary' : 'border-transparent text-slate-400'}`}
          >
            <span className="material-symbols-outlined text-sm">lightbulb</span>
            <p className="text-xs md:text-sm font-bold">1. Ideação</p>
          </button>
          
          <button 
            disabled={!isTitleReady}
            onClick={() => setStep(ProjectStep.SCRIPT)}
            className={`flex items-center gap-2 border-b-2 pb-4 px-2 transition-all ${
              step === ProjectStep.SCRIPT ? 'border-primary text-primary' : 'border-transparent text-slate-400'
            } ${!isTitleReady ? 'opacity-40 cursor-not-allowed' : 'hover:text-white'}`}
          >
            <span className="material-symbols-outlined text-sm">{isTitleReady ? 'description' : 'lock'}</span>
            <p className="text-xs md:text-sm font-bold">2. Roteiro</p>
          </button>
          
          <button 
            disabled={!isTitleReady}
            onClick={() => setStep(ProjectStep.THUMBNAIL)}
            className={`flex items-center gap-2 border-b-2 pb-4 px-2 transition-all ${
              step === ProjectStep.THUMBNAIL ? 'border-primary text-primary' : 'border-transparent text-slate-400'
            } ${!isTitleReady ? 'opacity-40 cursor-not-allowed' : 'hover:text-white'}`}
          >
            <span className="material-symbols-outlined text-sm">{isTitleReady ? 'image' : 'lock_person'}</span>
            <p className="text-xs md:text-sm font-bold">3. Thumbnail</p>
          </button>

          <button 
            disabled={!isScriptReady}
            onClick={() => setStep(ProjectStep.METADATA)}
            className={`flex items-center gap-2 border-b-2 pb-4 px-2 transition-all ${
              step === ProjectStep.METADATA ? 'border-primary text-primary' : 'border-transparent text-slate-400'
            } ${!isScriptReady ? 'opacity-40 cursor-not-allowed' : 'hover:text-white'}`}
          >
            <span className="material-symbols-outlined text-sm">{isScriptReady ? 'seo' : 'lock_person'}</span>
            <p className="text-xs md:text-sm font-bold">4. SEO & Metadados</p>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar bg-background-dark/30">
        {!isTitleReady && step !== ProjectStep.IDEATION && (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in fade-in duration-500">
            <div className="bg-primary/10 p-6 rounded-full mb-4">
              <span className="material-symbols-outlined text-5xl text-primary animate-bounce">lock</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Etapa Bloqueada</h3>
            <p className="text-slate-400 max-w-xs mb-6 text-sm">Você precisa definir um título na etapa de Ideação antes de prosseguir.</p>
            <button 
              onClick={() => setStep(ProjectStep.IDEATION)}
              className="bg-primary px-6 py-2 rounded-lg font-bold text-white text-sm"
            >
              Voltar para Ideação
            </button>
          </div>
        )}
        
        {step === ProjectStep.IDEATION && <Ideation project={project} onUpdate={onUpdate} onNext={() => setStep(ProjectStep.SCRIPT)} />}
        {isTitleReady && step === ProjectStep.SCRIPT && <Script project={project} onUpdate={onUpdate} onNext={() => setStep(ProjectStep.THUMBNAIL)} />}
        {isTitleReady && step === ProjectStep.THUMBNAIL && <Thumbnails project={project} onUpdate={onUpdate} onNext={() => setStep(ProjectStep.METADATA)} />}
        {isTitleReady && step === ProjectStep.METADATA && <Metadata project={project} onUpdate={onUpdate} />}
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  const handleUpdateProject = useCallback((updated: Project) => {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
  }, []);

  const handleCreateProject = useCallback(() => {
    const newId = Date.now().toString();
    const newProject: Project = {
      id: newId,
      name: 'Novo Projeto de Vídeo',
      niche: '',
      baseTheme: '',
      createdAt: new Date().toISOString(),
      titles: [],
      script: '',
      thumbnails: [],
      targetAudience: '',
      emotionalTrigger: 'curiosity',
      format: 'top10'
    };
    
    setProjects(prev => [newProject, ...prev]);
    navigate(`/projects/${newId}`);
  }, [navigate]);

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-background-dark">
      <Sidebar isCollapsed={isSidebarCollapsed} onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <main className="flex-1 overflow-y-auto custom-scrollbar flex flex-col relative transition-all duration-300">
        <Routes>
          <Route path="/" element={<Dashboard projects={projects} setProjects={setProjects} onCreateProject={handleCreateProject} />} />
          <Route path="/projects" element={<Dashboard projects={projects} setProjects={setProjects} onCreateProject={handleCreateProject} />} />
          <Route path="/projects/:id" element={<ProjectFlow projects={projects} onUpdate={handleUpdateProject} />} />
          <Route path="/trends" element={<TrendHunter />} />
          <Route path="/plans" element={<Pricing />} />
          <Route path="/settings" element={<div className="p-10 text-slate-500">Configurações em breve.</div>} />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
