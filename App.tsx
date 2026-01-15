
import React, { useState, useCallback, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useParams, Link } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Ideation from './pages/Ideation';
import Script from './pages/Script';
import Thumbnails from './pages/Thumbnails';
import Metadata from './pages/Metadata';
import Export from './pages/Export';
import TrendHunter from './pages/TrendHunter';
import TitleGenerator from './pages/TitleGenerator';
import Pricing from './pages/Pricing';
import { Project, ProjectStep } from './types';

const STORAGE_KEY = 'darkflow_ai_projects';

const INITIAL_PROJECTS: Project[] = [];

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

  const isReadyForBatch = project.items.length > 0 && project.niche && project.baseTheme;

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <header className="border-b border-border-dark bg-background-dark pt-6 px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold font-display tracking-tight text-white truncate max-w-[300px] md:max-w-[500px]">
              Projeto: {project.name || 'Sem Nome'}
            </h2>
            <p className="text-slate-500 text-xs md:text-sm">Fábrica de Roteiros em Lote ({project.items.length} itens)</p>
          </div>
        </div>
        <div className="flex gap-4 md:gap-8 overflow-x-auto custom-scrollbar whitespace-nowrap">
          <button 
            onClick={() => setStep(ProjectStep.IDEATION)}
            className={`flex items-center gap-2 border-b-2 pb-4 px-2 transition-all ${step === ProjectStep.IDEATION ? 'border-primary text-primary' : 'border-transparent text-slate-400'}`}
          >
            <span className="material-symbols-outlined text-sm">edit_note</span>
            <p className="text-xs md:text-sm font-bold">1. Ideação</p>
          </button>
          
          <button 
            disabled={!isReadyForBatch}
            onClick={() => setStep(ProjectStep.SCRIPT)}
            className={`flex items-center gap-2 border-b-2 pb-4 px-2 transition-all ${
              step === ProjectStep.SCRIPT ? 'border-primary text-primary' : 'border-transparent text-slate-400'
            } ${!isReadyForBatch ? 'opacity-40 cursor-not-allowed' : 'hover:text-white'}`}
          >
            <span className="material-symbols-outlined text-sm">queue</span>
            <p className="text-xs md:text-sm font-bold">2. Roteiros</p>
          </button>
          
          <button 
            disabled={!isReadyForBatch}
            onClick={() => setStep(ProjectStep.THUMBNAIL)}
            className={`flex items-center gap-2 border-b-2 pb-4 px-2 transition-all ${
              step === ProjectStep.THUMBNAIL ? 'border-primary text-primary' : 'border-transparent text-slate-400'
            } ${!isReadyForBatch ? 'opacity-40 cursor-not-allowed' : 'hover:text-white'}`}
          >
            <span className="material-symbols-outlined text-sm">image</span>
            <p className="text-xs md:text-sm font-bold">3. Thumbnail</p>
          </button>

          <button 
            disabled={!isReadyForBatch}
            onClick={() => setStep(ProjectStep.METADATA)}
            className={`flex items-center gap-2 border-b-2 pb-4 px-2 transition-all ${
              step === ProjectStep.METADATA ? 'border-primary text-primary' : 'border-transparent text-slate-400'
            } ${!isReadyForBatch ? 'opacity-40 cursor-not-allowed' : 'hover:text-white'}`}
          >
            <span className="material-symbols-outlined text-sm">insights</span>
            <p className="text-xs md:text-sm font-bold">4. SEO</p>
          </button>

          <button 
            disabled={!isReadyForBatch}
            onClick={() => setStep(ProjectStep.EXPORT)}
            className={`flex items-center gap-2 border-b-2 pb-4 px-2 transition-all ${
              step === ProjectStep.EXPORT ? 'border-primary text-primary' : 'border-transparent text-slate-400'
            } ${!isReadyForBatch ? 'opacity-40 cursor-not-allowed' : 'hover:text-white'}`}
          >
            <span className="material-symbols-outlined text-sm">check_circle</span>
            <p className="text-xs md:text-sm font-bold">5. Finalizar</p>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar bg-background-dark/30">
        {step === ProjectStep.IDEATION && <Ideation project={project} onUpdate={onUpdate} onNext={() => setStep(ProjectStep.SCRIPT)} />}
        {isReadyForBatch && step === ProjectStep.SCRIPT && <Script project={project} onUpdate={onUpdate} onNext={() => setStep(ProjectStep.THUMBNAIL)} />}
        {isReadyForBatch && step === ProjectStep.THUMBNAIL && <Thumbnails project={project} onUpdate={onUpdate} onNext={() => setStep(ProjectStep.METADATA)} />}
        {isReadyForBatch && step === ProjectStep.METADATA && <Metadata project={project} onUpdate={onUpdate} />}
        {isReadyForBatch && step === ProjectStep.EXPORT && <Export project={project} />}
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
      targetAudience: '',
      createdAt: new Date().toISOString(),
      items: [],
      globalTone: 'Misterioso e Sombrio',
      globalRetention: 'AIDA',
      globalDuration: 12,
      thumbnails: [],
      scriptMode: 'manual',
      winnerTemplate: ''
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
          <Route path="/title-generator" element={<TitleGenerator />} />
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
