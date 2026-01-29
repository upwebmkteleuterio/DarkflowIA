
import React from 'react';
import { VeoConsistency } from '../../types';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { Input, TextArea } from '../ui/Input';

interface VeoConsistencyPanelProps {
  consistency: VeoConsistency;
  loading: boolean;
  onUpdate: (updated: VeoConsistency) => void;
  onGenerate: () => void;
}

const VeoConsistencyPanel: React.FC<VeoConsistencyPanelProps> = ({ consistency, loading, onUpdate, onGenerate }) => {
  
  const updateCharacter = (index: number, field: string, value: any, subfield?: string) => {
    const newChars = [...consistency.personagens];
    if (subfield) {
      (newChars[index] as any)[field][subfield] = value;
    } else {
      (newChars[index] as any)[field] = value;
    }
    onUpdate({ ...consistency, personagens: newChars });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      
      {/* Coluna 1: Personagens */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">Personagens Identificados</h3>
          <Badge variant="primary">{consistency.personagens.length} Ativos</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {consistency.personagens.map((char, idx) => (
            <div key={char.id} className="bg-surface-dark border border-border-dark p-6 rounded-[32px] shadow-xl space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <span className="material-symbols-outlined text-6xl">person</span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="size-12 bg-primary rounded-xl flex items-center justify-center font-black text-white shadow-lg">
                  {char.id.split('_')[1]}
                </div>
                <Input 
                  value={char.nome} 
                  onChange={(e) => updateCharacter(idx, 'nome', e.target.value)}
                  placeholder="Nome do Personagem"
                  className="bg-background-dark/30 font-bold"
                />
              </div>

              <div className="space-y-4">
                 <div className="bg-background-dark/50 p-4 rounded-2xl border border-border-dark space-y-3">
                    <p className="text-[9px] font-black text-primary uppercase tracking-widest">Identidade Visual</p>
                    <div className="grid grid-cols-2 gap-3">
                       <Input label="Sexo" value={char.identidade.sexo} onChange={e => updateCharacter(idx, 'identidade', e.target.value, 'sexo')} className="text-[10px]" />
                       <Input label="Idade" value={char.identidade.faixa_etaria_aparente} onChange={e => updateCharacter(idx, 'identidade', e.target.value, 'faixa_etaria_aparente')} className="text-[10px]" />
                    </div>
                 </div>

                 <div className="bg-background-dark/50 p-4 rounded-2xl border border-border-dark space-y-3">
                    <p className="text-[9px] font-black text-primary uppercase tracking-widest">Detalhes do Rosto</p>
                    <div className="grid grid-cols-2 gap-3">
                       <Input label="Rosto" value={char.detalhes_rosto.formato_do_rosto} onChange={e => updateCharacter(idx, 'detalhes_rosto', e.target.value, 'formato_do_rosto')} className="text-[10px]" />
                       <Input label="Olhos" value={char.detalhes_rosto.cor_dos_olhos} onChange={e => updateCharacter(idx, 'detalhes_rosto', e.target.value, 'cor_dos_olhos')} className="text-[10px]" />
                    </div>
                 </div>

                 <TextArea 
                    label="Vestimenta Padrão" 
                    value={char.vestimenta.roupas_principais} 
                    onChange={e => updateCharacter(idx, 'vestimenta', e.target.value, 'roupas_principais')}
                    className="h-20 text-[11px]"
                 />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coluna 2: Contexto Global */}
      <div className="space-y-6">
        <div className="bg-surface-dark border border-border-dark p-8 rounded-[40px] shadow-2xl space-y-8 sticky top-8">
          <div className="space-y-6">
            <h3 className="text-xl font-black text-white uppercase italic tracking-tight border-b border-border-dark pb-4">Configurações Globais</h3>
            
            <div className="space-y-4">
               <Input 
                 label="Época / Período" 
                 value={consistency.epoca.periodo_temporal} 
                 onChange={e => onUpdate({...consistency, epoca: {...consistency.epoca, periodo_temporal: e.target.value}})}
               />
               <Input 
                 label="Estilo Visual" 
                 value={consistency.tom_global.estilo_narrativo} 
                 onChange={e => onUpdate({...consistency, tom_global: {...consistency.tom_global, estilo_narrativo: e.target.value}})}
               />
               <TextArea 
                 label="Atmosfera e Tom" 
                 value={consistency.tom_global.clima_emocional} 
                 onChange={e => onUpdate({...consistency, tom_global: {...consistency.tom_global, clima_emocional: e.target.value}})}
                 className="h-24"
               />
            </div>
          </div>

          <div className="pt-6">
            <Button 
              fullWidth 
              size="lg" 
              icon="auto_awesome" 
              loading={loading}
              onClick={onGenerate}
            >
              Gerar Script Completo VEO 3
            </Button>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest text-center mt-4">
              A IA vai dividir o roteiro em cenas de 8 segundos com prompts consistentes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VeoConsistencyPanel;
