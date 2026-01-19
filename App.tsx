
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useParams, Link, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import CostEstimator from './pages/CostEstimator';
import AdminPlans from './pages/AdminPlans';
import Login from './pages/Login';
import Register from './pages/Register';
import ErrorBoundary from './components/ErrorBoundary';
import { Project, ProjectStep } from './types';

const ProtectedRoute: React.FC<{ children: React.ReactNode, roles?: string[] }> = ({ children, roles }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && profile && !roles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
};

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

  const itemsCount = project.items?.length || 0;
  const isReadyForBatch = itemsCount > 0 && project.niche && project.baseTheme;
  const hasCompletedScripts = project.items?.some(i => i.status === 'completed');
  const hasCompletedThumbs = project.items?.some(i => i.thumbnails && i.thumbnails.length > 0);

  const renderStep = () => {
    switch (step) {
      case ProjectStep.IDEATION:
        return <Ideation project={project} onUpdate={onUpdate} onNext={() => setStep(ProjectStep.SCRIPT)} />;
      case ProjectStep.SCRIPT:
        return <Script project={project} onUpdate={onUpdate} onNext={() => setStep(ProjectStep.THUMBNAIL)} />;
      case ProjectStep.THUMBNAIL:
        return <Thumbnails project={project} onUpdate={onUpdate} onNext={() => setStep(ProjectStep.METADATA)} />;
      case ProjectStep.METADATA:
        return <Metadata project={project} onUpdate={onUpdate} />;
      case ProjectStep.EXPORT:
        return <Export project={project} onUpdate={onUpdate} />;
      default:
        return <Ideation project={project} onUpdate={onUpdate} onNext={() => setStep(ProjectStep.SCRIPT)} />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <header className="border-b border-border-dark bg-background-dark pt-6 px-4 md:px-8 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold font-display tracking-tight text-white truncate max-w-[300px] md:max-w-[500px]">
              Projeto: {project.name || 'Sem Nome'}
            </h2>
            <p className="text-slate-500 text-xs md:text-sm">Fábrica de Roteiros em Lote ({itemsCount} itens)</p>
          </div>
        </div>
        <div className="flex gap-4 md:gap-8 overflow-x-auto custom-scrollbar whitespace-nowrap pb-1">
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
            className={`flex items-center gap-2 border-b-2 pb-4 px-2 transition-all disabled:opacity-30 ${step === ProjectStep.SCRIPT ? 'border-primary text-primary' : 'border-transparent text-slate-400'}`}
          >
            <span className="material-symbols-outlined text-sm">description</span>
            <p className="text-xs md:text-sm font-bold">2. Roteiros</p>
          </button>

          <button 
            disabled={!hasCompletedScripts} 
            onClick={() => setStep(ProjectStep.THUMBNAIL)} 
            className={`flex items-center gap-2 border-b-2 pb-4 px-2 transition-all disabled:opacity-30 ${step === ProjectStep.THUMBNAIL ? 'border-primary text-primary' : 'border-transparent text-slate-400'}`}
          >
            <span className="material-symbols-outlined text-sm">image</span>
            <p className="text-xs md:text-sm font-bold">3. Thumbs</p>
          </button>

          <button 
            disabled={!hasCompletedThumbs} 
            onClick={() => setStep(ProjectStep.METADATA)} 
            className={`flex items-center gap-2 border-b-2 pb-4 px-2 transition-all disabled:opacity-30 ${step === ProjectStep.METADATA ? 'border-primary text-primary' : 'border-transparent text-slate-400'}`}
          >
            <span className="material-symbols-outlined text-sm">query_stats</span>
            <p className="text-xs md:text-sm font-bold">4. SEO</p>
          </button>

          <button 
            disabled={!hasCompletedThumbs} 
            onClick={() => setStep(ProjectStep.EXPORT)} 
            className={`flex items-center gap-2 border-b-2 pb-4 px-2 transition-all disabled:opacity-30 ${step === ProjectStep.EXPORT ? 'border-primary text-primary' : 'border-transparent text-slate-400'}`}
          >
            <span className="material-symbols-outlined text-sm">package_2</span>
            <p className="text-xs md:text-sm font-bold">5. Exportar</p>
          </button>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto bg-background-dark/30 custom-scrollbar">
        {renderStep()}
      </main>
    </div>
  );
};

const AppContent: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('darkflow_ai_projects');
    return saved ? JSON.parse(saved) : [];
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  useEffect(() => {
    localStorage.setItem('darkflow_ai_projects', JSON.stringify(projects));
  }, [projects]);

  const handleUpdateProject = (updated: Project) => {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const createNewProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
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
      scriptMode: 'auto'
    };
    setProjects([newProject, ...projects]);
    window.location.hash = `#/projects/${newProject.id}`;
  };

  return (
    <div className="flex flex-col lg:flex-row h-[100dvh] bg-background-dark text-slate-100 selection:bg-primary/30 overflow-hidden">
      {!isAuthPage && (
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
        />
      )}
      
      <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden relative">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard projects={projects} setProjects={setProjects} onCreateProject={createNewProject} />
            </ProtectedRoute>
          } />

          <Route path="/projects/:id" element={
            <ProtectedRoute>
              <ProjectFlow projects={projects} onUpdate={handleUpdateProject} />
            </ProtectedRoute>
          } />

          <Route path="/trends" element={
            <ProtectedRoute>
              <TrendHunter />
            </ProtectedRoute>
          } />

          <Route path="/title-generator" element={
            <ProtectedRoute>
              <TitleGenerator />
            </ProtectedRoute>
          } />

          <Route path="/plans" element={
            <ProtectedRoute>
              <Pricing />
            </ProtectedRoute>
          } />

          <Route path="/cost-estimator" element={
            <ProtectedRoute roles={['adm']}>
              <CostEstimator />
            </ProtectedRoute>
          } />

          <Route path="/admin/plans" element={
            <ProtectedRoute roles={['adm']}>
              <AdminPlans />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
