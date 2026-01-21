import React from 'react';
import Badge from '../components/ui/Badge';

const TechSpecs: React.FC = () => {
  const sections = [
    {
      title: "Engine de Concorrência (Background Workers)",
      icon: "memory",
      description: "Sistema de processamento em paralelo via React Context + Queue Management. Permite que o motor fabrique roteiros e imagens em segundo plano sem travar a interface do usuário.",
      details: [
        "Fila de execução assíncrona com persistência de estado.",
        "Processamento 'Non-Blocking' que permite navegar enquanto a IA trabalha.",
        "Feedback visual global (GlobalBatchProgress) sincronizado entre abas."
      ]
    },
    {
      title: "Sincronização Real-time (Postgres Changes)",
      icon: "sync_alt",
      description: "Utilizamos o protocolo de Webhooks do Supabase para manter a UI atualizada sem necessidade de recarregamento manual (F5).",
      details: [
        "Escuta ativa de eventos 'INSERT/UPDATE' na tabela script_items.",
        "Atualização otimista de estado: a UI reage no milissegundo em que o banco muda.",
        "Redução drástica de chamadas desnecessárias à API, economizando recursos."
      ]
    },
    {
      title: "Protocolo Transacional de Créditos (RPC)",
      icon: "security",
      description: "Garantia de integridade financeira através de Funções Remotas (Remote Procedure Calls) no servidor.",
      details: [
        "Dedução atômica: o crédito só sai se a IA entregar o conteúdo com sucesso.",
        "Proteção contra 'Double-Spend': evita que o usuário use o mesmo crédito em duas tarefas.",
        "Logs de auditoria transparentes para cada geração realizada."
      ]
    },
    {
      title: "Orquestração Multi-Modelo (AI Routing)",
      icon: "hub",
      description: "O sistema roteia tarefas para diferentes modelos da família Gemini para equilibrar qualidade e margem de lucro.",
      details: [
        "Gemini 3 Flash: Roteiros e SEO (Baixa latência e custo zero em escala).",
        "Gemini 2.5 Flash Image: Geração de thumbnails ultra-rápidas.",
        "Gemini 3 Pro: Pesquisa de tendências (Grounding) com busca Google real-time."
      ]
    },
    {
      title: "Engenharia de Prompt SEO Flow",
      icon: "psychology",
      description: "Arquitetura avançada de metadados que extrai a semântica profunda do roteiro para o algoritmo do YouTube.",
      details: [
        "Extração de LSI Keywords (Latent Semantic Indexing) para otimização de busca.",
        "Geração de Timestamps automáticos baseados na curva de retenção narrativa.",
        "Descrições formatadas com gatilhos de 'Click-Through Rate' (CTR)."
      ]
    },
    {
      title: "Processamento de Mídia & Storage CDN",
      icon: "cloud_upload",
      description: "Gerenciamento eficiente de ativos binários para garantir que o SaaS não fique lento com milhares de imagens.",
      details: [
        "Conversão inteligente de Base64 para Blobs reais antes do upload.",
        "Distribuição via CDN Global para carregamento instantâneo de thumbnails.",
        "Protocolo de limpeza automática de temporários não utilizados."
      ]
    },
    {
      title: "Camada de Segurança & Anti-Abuso",
      icon: "admin_panel_settings",
      description: "Proteção de chaves de API e isolamento de dados entre usuários (Multi-tenancy).",
      details: [
        "RLS (Row Level Security): Um usuário nunca consegue ver os dados de outro.",
        "Ofuscação de chaves de API no Client-side para prevenir extração de segredos.",
        "Sanitização de prompts para prevenir ataques de injeção de IA."
      ]
    }
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-12 animate-in fade-in duration-700">
      <header className="mb-12 border-b border-border-dark pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 text-left">
            <h1 className="text-4xl font-black text-white font-display uppercase tracking-tight italic">
              DarkFlow <span className="text-primary">Core</span>
            </h1>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.3em]">Manual Técnico de Infraestrutura v1.0.0-PRO</p>
          </div>
          <div className="flex items-center gap-3">
             <Badge variant="success" pulse>Núcleo Estável</Badge>
             <div className="bg-primary/10 border border-primary/20 px-4 py-2 rounded-xl">
               <span className="text-[10px] font-black text-primary uppercase tracking-widest">Build: 2025.PRO.ALPHA</span>
             </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section, idx) => (
          <div key={idx} className="bg-surface-dark border border-border-dark p-8 rounded-[40px] shadow-2xl relative overflow-hidden group hover:border-primary/40 transition-all duration-500 flex flex-col">
            <div className="absolute -right-10 -top-10 size-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>
            
            <div className="flex gap-6 relative z-10 mb-6">
              <div className="size-14 bg-background-dark border border-border-dark rounded-2xl flex items-center justify-center text-primary shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">{section.icon}</span>
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight self-center text-left">{section.title}</h3>
            </div>
            
            <div className="space-y-4 text-left flex-1">
              <p className="text-slate-400 text-sm leading-relaxed">{section.description}</p>
              
              <div className="space-y-2 pt-2">
                {section.details.map((detail, dIdx) => (
                  <div key={dIdx} className="flex items-start gap-2 bg-background-dark/50 p-3 rounded-xl border border-border-dark/50">
                    <span className="material-symbols-outlined text-primary text-[14px] mt-0.5">check_circle</span>
                    <p className="text-[11px] font-medium text-slate-300 leading-tight">{detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <footer className="mt-16 bg-primary/5 border border-primary/10 p-10 rounded-[48px] text-center relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none"></div>
         <h4 className="text-primary font-black text-xs uppercase tracking-[0.4em] mb-4 relative z-10">Conclusão de Auditoria Tecnológica</h4>
         <p className="text-slate-400 text-sm leading-relaxed max-w-3xl mx-auto relative z-10">
           O Dark Flow é uma interface complexa de micro-sincronização que garante custo operacional mínimo e produtividade máxima. A separação de responsabilidades entre o banco de dados em tempo real e os workers de IA permite que o sistema escale sem perder performance.
         </p>
         
         <div className="mt-10 pt-10 border-t border-primary/10 grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
            <div>
               <p className="text-white font-black text-2xl leading-none">REALTIME</p>
               <p className="text-[9px] font-bold text-slate-500 uppercase mt-2 tracking-widest">Sincronia UI</p>
            </div>
            <div>
               <p className="text-white font-black text-2xl leading-none">GEMINI 3</p>
               <p className="text-[9px] font-bold text-slate-500 uppercase mt-2 tracking-widest">Core Engine</p>
            </div>
            <div>
               <p className="text-white font-black text-2xl leading-none">ATOMIC</p>
               <p className="text-[9px] font-bold text-slate-500 uppercase mt-2 tracking-widest">Transactions</p>
            </div>
            <div>
               <p className="text-white font-black text-2xl leading-none">AES-256</p>
               <p className="text-[9px] font-bold text-slate-500 uppercase mt-2 tracking-widest">Privacy Shield</p>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default TechSpecs;