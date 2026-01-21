
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, useParams, Link, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BatchProvider } from './context/BatchContext';
import { supabase } from './lib/supabase';
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
import TechSpecs from './pages/TechSpecs';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import GlobalBatchProgress from './components/Batch/GlobalBatchProgress';
import ErrorBoundary from './components/ErrorBoundary';
import { Project, ProjectStep } from './types';

const ProtectedRoute: React.FC<{ children: React.ReactNode, roles?: string[] }> = ({ children, roles }) => {
  const { status, profile, isLoading } = useAuth();
  
  // Se ainda estiver na fase de verificação inicial, mostra o loader global
  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-background-dark flex flex-col items-center justify-center gap-4">
        <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_15px_#8655f633]"></div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] animate-pulse">Autenticando...</p>
      </div>
    );
  }

  // Só redireciona se tiver certeza que não está logado
  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  // Verifica permissões de role se necessário
  if (roles && profile && !roles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  return <ErrorBoundary>{children}</ErrorBoundary>;
};

const ProjectFlow: React.FC<{ projects: Project[], onUpdate: (p: Project) => void }> = ({ projects, onUpdate }) => {
  const { id } = useParams();
  const [step, setStep] = useState<ProjectStep>(ProjectStep.IDEATION);
  const project = projects.find(p => p.id === id);
  const [editingTitle, setEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');

  useEffect(() => {
    if (project) setTempTitle(project.name);
  }, [project]);

  if (!project) return (
    <div className="flex-1 flex flex-col items-center justify-center p-10 text-center text-slate-400">
      <span className="material-symbols-outlined text-6xl mb-4 opacity-20">search_off</span>
      <p className="font-bold text-lg">Projeto não encontrado</p>
      <Link to="/" className="text-primary hover:underline mt-2">Voltar ao Painel</Link>
    </div>
  );

  const handleSaveTitle = async () => {
    setEditingTitle(false);
    if (tempTitle.trim() && tempTitle !== project.name) {
      onUpdate({ ...project, name: tempTitle });
      await supabase.from('projects').update({ name: tempTitle }).eq('id', project.id);
    }
  };

  const renderStep = () => {
    switch (step) {
      case ProjectStep.IDEATION: return <Ideation project={project} onUpdate={onUpdate} onNext={() => setStep(ProjectStep.SCRIPT)} />;
      case ProjectStep.SCRIPT: return <Script project={project} onUpdate={onUpdate} onNext={() => setStep(ProjectStep.THUMBNAIL)} />;
      case ProjectStep.THUMBNAIL: return <Thumbnails project={project} onUpdate={onUpdate} onNext={() => setStep(ProjectStep.METADATA)} />;
      case ProjectStep.METADATA: return <Metadata project={project} onUpdate={onUpdate} />;
      case ProjectStep.EXPORT: return <Export project={project} onUpdate={onUpdate} />;
      default: return <Ideation project={project} onUpdate={onUpdate} onNext={() => setStep(ProjectStep.SCRIPT)} />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <header className="border-b border-border-dark bg-background-dark pt-6 px-4 md:px-8 shrink-0">
        <div className="flex items-center gap-4 mb-6">
          {editingTitle ? (
            <input 
              autoFocus
              className="bg-background-dark border border-primary text-xl md:text-2xl font-bold text-white px-3 py-1 rounded outline-none w-full max-w-xl"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
            />
          ) : (
            <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setEditingTitle(true)}>
              <h2 className="text-xl md:text-2xl font-bold text-white truncate max-w-[250px] md:max-w-xl">{project.name}</h2>
              <span className="material-symbols-outlined text-slate-500 opacity-60 md:opacity-0 md:group-hover:opacity-100 transition-opacity">edit</span>
            </div>
          )}
        </div>
        <div className="flex gap-6 md:gap-8 pb-1 overflow-x-auto custom-scrollbar whitespace-nowrap">
          <button onClick={() => setStep(ProjectStep.IDEATION)} className={`pb-4 px-2 font-bold text-xs md:text-sm uppercase tracking-widest transition-all ${step === ProjectStep.IDEATION ? 'border-b-2 border-primary text-primary' : 'text-slate-400'}`}>1. Ideação</button>
          <button onClick={() => setStep(ProjectStep.SCRIPT)} className={`pb-4 px-2 font-bold text-xs md:text-sm uppercase tracking-widest transition-all ${step === ProjectStep.SCRIPT ? 'border-b-2 border-primary text-primary' : 'text-slate-400'}`}>2. Roteiros</button>
          <button onClick={() => setStep(ProjectStep.THUMBNAIL)} className={`pb-4 px-2 font-bold text-xs md:text-sm uppercase tracking-widest transition-all ${step === ProjectStep.THUMBNAIL ? 'border-b-2 border-primary text-primary' : 'text-slate-400'}`}>3. Thumbs</button>
          <button onClick={() => setStep(ProjectStep.METADATA)} className={`pb-4 px-2 font-bold text-xs md:text-sm uppercase tracking-widest transition-all ${step === ProjectStep.METADATA ? 'border-b-2 border-primary text-primary' : 'text-slate-400'}`}>4. SEO</button>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        {renderStep()}
      </main>
    </div>
  );
};

const AppContent: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const { user, status, isLoading } = useAuth();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  const loadProjects = useCallback(async () => {
    if (!user) return;
    console.log("[APP] Carregando projetos do usuário:", user.id);
    const { data, error } = await supabase
      .from('projects')
      .select('*, script_items(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProjects(data.map((p: any) => ({ 
        ...p, 
        createdAt: p.created_at,
        targetAudience: p.target_audience || '',
        baseTheme: p.base_theme || '',
        globalDuration: p.global_duration || 12,
        globalTone: p.global_tone || 'Misterioso e Sombrio',
        globalRetention: p.global_retention || 'AIDA',
        scriptMode: p.script_mode || 'auto',
        items: p.script_items || [] 
      })));
    } else if (error) {
      console.error("[APP] Erro ao carregar projetos:", error.message);
    }
  }, [user]);

  useEffect(() => {
    if (status === 'authenticated' && user) {
      loadProjects();

      const channel = supabase
        .channel('db-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'script_items' },
          () => {
            loadProjects();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else if (status === 'unauthenticated') {
      setProjects([]);
    }
  }, [status, user, loadProjects]);

  const handleUpdateProject = async (updated: Project) => {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
    if (user) {
      await supabase.from('projects').update({ 
        name: updated.name, 
        niche: updated.niche, 
        base_theme: updated.baseTheme,
        target_audience: updated.targetAudience,
        global_duration: updated.globalDuration,
        global_tone: updated.globalTone,
        global_retention: updated.globalRetention,
        script_mode: updated.scriptMode,
        winner_template: updated.winnerTemplate
      }).eq('id', updated.id);
    }
  };

  const createNewProject = async () => {
    if (!user) return;
    const newId = Date.now().toString();
    const newProject: Project = {
      id: newId,
      name: 'Novo Projeto',
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

    const { error } = await supabase
      .from('projects')
      .insert({
        id: newId,
        user_id: user.id,
        name: newProject.name,
        created_at: newProject.createdAt
      });

    if (!error) {
      setProjects([newProject, ...projects]);
      window.location.hash = `#/projects/${newId}`;
    }
  };

  // TELA DE CARREGAMENTO GLOBAL (SPLASH SCREEN)
  if (isLoading && !isAuthPage) {
    return (
      <div className="h-[100dvh] w-full bg-background-dark flex flex-col items-center justify-center gap-6">
        <div className="size-16 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_20px_#8655f633]"></div>
        <div className="text-center space-y-2">
           <h2 className="text-white font-black text-xl uppercase tracking-[0.3em] italic">DarkFlow</h2>
           <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest animate-pulse">Estabelecendo Conexão Segura...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-[100dvh] bg-background-dark text-slate-100 overflow-hidden relative">
      {!isAuthPage && status === 'authenticated' && <Sidebar isCollapsed={false} onToggleCollapse={() => {}} />}
      
      <main className="flex-1 flex flex-col min-w-0 min-h-0 h-full overflow-y-auto custom-scrollbar relative z-0">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><Dashboard projects={projects} setProjects={setProjects} onCreateProject={createNewProject} /></ProtectedRoute>} />
          <Route path="/projects/:id" element={<ProtectedRoute><ProjectFlow projects={projects} onUpdate={handleUpdateProject} /></ProtectedRoute>} />
          <Route path="/trends" element={<ProtectedRoute><TrendHunter /></ProtectedRoute>} />
          <Route path="/title-generator" element={<ProtectedRoute><TitleGenerator /></ProtectedRoute>} />
          <Route path="/plans" element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/cost-estimator" element={<ProtectedRoute roles={['adm']}><CostEstimator /></ProtectedRoute>} />
          <Route path="/admin/plans" element={<ProtectedRoute roles={['adm']}><AdminPlans /></ProtectedRoute>} />
          <Route path="/admin/tech-specs" element={<ProtectedRoute roles={['adm']}><TechSpecs /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <GlobalBatchProgress />
    </div>
  );
};

export default function App() { 
  return (
    <AuthProvider>
      <BatchProvider>
        <Router>
          <AppContent />
        </Router>
      </BatchProvider>
    </AuthProvider>
  ); 
}
