
/**
 * REGRAS DE NEGÓCIO APROVADAS - NÃO ALTERAR SEM SOLICITAÇÃO DIRETA
 * Este arquivo define o comportamento do sistema de roteiros.
 */

export const SCRIPT_RULES = {
  // Limites de Tempo
  MIN_DURATION: 3,
  MAX_DURATION: 60, // Fixado conforme solicitado
  DEFAULT_DURATION: 12,

  // Cálculos de Texto
  WORDS_PER_MINUTE: 140, // Média industrial de narração

  // Regras de Créditos
  CREDITS_LOGIC: {
    base_minutes_per_credit: 30,
    calculateNeeded: (duration: number, minutesPerCredit: number = 30) => {
      return Math.ceil(duration / minutesPerCredit);
    }
  },

  // Configurações de IA
  MODELS: {
    writer: 'gemini-3-flash-preview',
    system_instruction: 'Você é um roteirista sênior de canais Dark do YouTube. Escreva roteiros com ganchos fortes e alta retenção.'
  }
};
