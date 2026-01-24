
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Button from '../components/ui/Button';
import { Input, TextArea } from '../components/ui/Input';
import Badge from '../components/ui/Badge';

interface Plan {
  id: string;
  name: string;
  price: number;
  text_credits: number;
  image_credits: number;
  minutes_per_credit: number;
  max_duration_limit: number;
  features: string[];
  type: 'free' | 'pro';
}

const AdminPlans: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const fetchPlans = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .order('price', { ascending: true });
    
    if (!error && data) setPlans(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    const { error } = await supabase
      .from('plans')
      .update({
        name: editingPlan.name,
        price: editingPlan.price,
        text_credits: editingPlan.text_credits,
        image_credits: editingPlan.image_credits,
        minutes_per_credit: editingPlan.minutes_per_credit,
        max_duration_limit: editingPlan.max_duration_limit,
        features: editingPlan.features
      })
      .eq('id', editingPlan.id);

    if (!error) {
      setEditingPlan(null);
      fetchPlans();
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 animate-in fade-in duration-700">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-4xl font-black text-white font-display tracking-tight uppercase">Gerenciar <span className="text-primary italic">Planos</span></h2>
          <p className="text-slate-500 mt-2">Configure os valores, créditos e limites de tempo.</p>
        </div>
        <Button icon="refresh" variant="ghost" onClick={fetchPlans} loading={loading}>Atualizar</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map(plan => (
          <div key={plan.id} className="bg-surface-dark border border-border-dark p-8 rounded-[32px] shadow-2xl flex flex-col gap-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4">
              <Badge variant={plan.type === 'free' ? 'neutral' : 'primary'}>{plan.type.toUpperCase()}</Badge>
            </div>
            
            <div>
              <h3 className="text-xl font-black text-white uppercase">{plan.name}</h3>
              <p className="text-3xl font-black text-primary mt-2">R$ {plan.price}</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                 <div className="bg-background-dark/50 p-2 rounded-xl border border-border-dark">
                    <p className="text-[8px] font-black text-slate-500 uppercase">Text Credits</p>
                    <p className="text-sm font-black text-white">{plan.text_credits}</p>
                 </div>
                 <div className="bg-background-dark/50 p-2 rounded-xl border border-border-dark">
                    <p className="text-[8px] font-black text-slate-500 uppercase">Image Credits</p>
                    <p className="text-sm font-black text-white">{plan.image_credits}</p>
                 </div>
              </div>
            </div>

            <div className="space-y-1 bg-primary/5 p-4 rounded-2xl border border-primary/20">
               <p className="text-[9px] font-black text-primary uppercase tracking-widest">Regras de Consumo:</p>
               <p className="text-xs text-white font-bold">1 Crédito a cada {plan.minutes_per_credit} min</p>
               <p className="text-[10px] text-slate-500 italic">Limite máximo: {plan.max_duration_limit} min</p>
            </div>

            <Button fullWidth variant="outline" icon="edit" onClick={() => setEditingPlan(plan)}>Editar Plano</Button>
          </div>
        ))}
      </div>

      {editingPlan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setEditingPlan(null)} />
           <form onSubmit={handleUpdate} className="relative bg-surface-dark border border-border-dark w-full max-w-2xl p-10 rounded-[40px] shadow-2xl space-y-6 overflow-y-auto max-h-[90vh] custom-scrollbar">
              <h3 className="text-2xl font-black text-white uppercase italic">Editar Plano: {editingPlan.name}</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <Input label="Nome" value={editingPlan.name} onChange={e => setEditingPlan({...editingPlan, name: e.target.value})} />
                <Input label="Preço (R$)" type="number" value={editingPlan.price} onChange={e => setEditingPlan({...editingPlan, price: Number(e.target.value)})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label="Créditos Texto" type="number" value={editingPlan.text_credits} onChange={e => setEditingPlan({...editingPlan, text_credits: Number(e.target.value)})} />
                <Input label="Créditos Imagem" type="number" value={editingPlan.image_credits} onChange={e => setEditingPlan({...editingPlan, image_credits: Number(e.target.value)})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label="Minutos por 1 Crédito" type="number" value={editingPlan.minutes_per_credit} onChange={e => setEditingPlan({...editingPlan, minutes_per_credit: Number(e.target.value)})} />
                <Input label="Limite Slider (Min)" type="number" value={editingPlan.max_duration_limit} onChange={e => setEditingPlan({...editingPlan, max_duration_limit: Number(e.target.value)})} />
              </div>

              <TextArea label="Benefícios (JSON Array)" value={JSON.stringify(editingPlan.features)} onChange={e => { try { setEditingPlan({...editingPlan, features: JSON.parse(e.target.value)}); } catch(err) {} }} />

              <div className="flex gap-4 pt-4">
                <Button fullWidth variant="ghost" onClick={() => setEditingPlan(null)}>Cancelar</Button>
                <Button fullWidth type="submit">Salvar Alterações</Button>
              </div>
           </form>
        </div>
      )}
    </div>
  );
};

export default AdminPlans;
