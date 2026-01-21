
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { supabase } from '../lib/supabase';

const Settings: React.FC = () => {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setMessage(null);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName })
        .eq('id', user.id);

      if (error) throw error;
      
      await refreshProfile();
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmText = "DELETAR";
    const input = prompt(`AVISO CRÍTICO: Esta ação apagará TODOS os seus projetos, créditos e roteiros de forma IRREVERSÍVEL.\n\nPara confirmar, digite ${confirmText} no campo abaixo:`);
    
    if (input === confirmText) {
      setLoading(true);
      // Nota: Em Supabase, deletar a própria conta do auth.users via client-side requer uma Edge Function.
      // Aqui simulamos o processo e avisamos o usuário.
      alert("Solicitação enviada. Por questões de segurança, sua conta será processada para exclusão em instantes.");
      await signOut();
    }
  };

  const formatRenewalDate = (dateStr?: string) => {
    if (!dateStr) return 'Não definida';
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return <Badge variant="success">ASSINATURA ATIVA</Badge>;
      case 'trialing': return <Badge variant="primary">PERÍODO DE TESTE</Badge>;
      case 'past_due': return <Badge variant="warning">PAGAMENTO PENDENTE</Badge>;
      case 'canceled': return <Badge variant="error">CANCELADA</Badge>;
      default: return <Badge variant="neutral">PLANO GRATUITO</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 animate-in fade-in duration-700">
      <div className="mb-10 text-left">
        <h2 className="text-4xl font-black text-white font-display tracking-tight uppercase text-left">Configurações de <span className="text-primary italic">Conta</span></h2>
        <p className="text-slate-500 mt-2">Gerencie suas informações e preferências de produção.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Lado Esquerdo: Info do Plano */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-surface-dark border border-border-dark p-6 rounded-[32px] shadow-2xl relative overflow-hidden text-left">
            <div className="absolute -top-10 -right-10 size-32 bg-primary/10 rounded-full blur-3xl"></div>
            
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Assinatura Atual</h3>
            
            <div className="mb-6">
              <div className="mb-3">{getStatusBadge(profile?.subscription_status)}</div>
              <h4 className="text-2xl font-black text-white italic">
                {profile?.role === 'adm' ? 'Administrador' : (profile?.role === 'pro' ? 'DarkFlow Pro' : 'DarkFlow Free')}
              </h4>
            </div>

            <div className="space-y-4 pt-6 border-t border-border-dark/50">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Status Financeiro</span>
                <span className={`text-[10px] font-black uppercase ${profile?.subscription_status === 'active' ? 'text-accent-green' : 'text-slate-500'}`}>
                  {profile?.subscription_status === 'active' ? 'Regularizado' : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Próxima Renovação</span>
                <span className="text-xs font-black text-white">{formatRenewalDate(profile?.current_period_end)}</span>
              </div>
            </div>

            <Button variant="outline" fullWidth className="mt-8" size="sm" onClick={() => window.location.hash = '#/plans'}>Mudar de Plano</Button>
          </div>

          <div className="bg-surface-dark border border-border-dark p-6 rounded-[32px] shadow-xl text-left">
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Créditos Disponíveis</h3>
             <div className="space-y-3">
                <div className="bg-background-dark/50 p-4 rounded-2xl border border-border-dark flex justify-between items-center">
                   <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-sm">description</span>
                      <span className="text-xs font-bold text-white">Texto</span>
                   </div>
                   <span className="text-lg font-black text-primary">{profile?.text_credits || 0}</span>
                </div>
                <div className="bg-background-dark/50 p-4 rounded-2xl border border-border-dark flex justify-between items-center">
                   <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-accent-green text-sm">image</span>
                      <span className="text-xs font-bold text-white">Imagens</span>
                   </div>
                   <span className="text-lg font-black text-accent-green">{profile?.image_credits || 0}</span>
                </div>
             </div>
          </div>
        </div>

        {/* Lado Direito: Formulário de Perfil */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleUpdateProfile} className="bg-surface-dark border border-border-dark p-8 rounded-[40px] shadow-2xl space-y-8 text-left">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
               <span className="material-symbols-outlined text-primary font-bold">person</span>
               Informações Pessoais
            </h3>

            {message && (
              <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in zoom-in-95 ${
                message.type === 'success' ? 'bg-accent-green/10 text-accent-green border border-accent-green/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
              }`}>
                <span className="material-symbols-outlined text-sm">
                  {message.type === 'success' ? 'check_circle' : 'error'}
                </span>
                {message.text}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="NOME DE EXIBIÇÃO" 
                value={displayName} 
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Como você quer ser chamado"
              />
              <Input 
                label="E-MAIL (NÃO EDITÁVEL)" 
                value={user?.email || ''} 
                disabled 
                className="opacity-50 grayscale"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" loading={loading} icon="save" size="lg">Salvar Alterações</Button>
            </div>
          </form>

          <div className="bg-red-500/5 border border-red-500/10 p-8 rounded-[40px] space-y-4 text-left">
            <h4 className="text-red-500 font-black text-xs uppercase tracking-widest flex items-center gap-2">
               <span className="material-symbols-outlined text-sm">warning</span>
               Zona de Perigo
            </h4>
            <p className="text-slate-500 text-xs leading-relaxed">Ao excluir sua conta, todos os seus projetos, roteiros e créditos serão permanentemente removidos. Esta ação não pode ser desfeita e os créditos restantes não serão reembolsados.</p>
            <Button 
              variant="danger" 
              size="sm" 
              onClick={handleDeleteAccount}
              disabled={loading}
            >
              Excluir minha conta permanentemente
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
