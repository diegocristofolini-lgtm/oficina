import React from 'react';
import { 
  X, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Calculator, 
  Clock, 
  Lightbulb, 
  Scale 
} from 'lucide-react';

interface EfficiencyExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEfficiency: number;
  completedEfficiency: number;
}

export const EfficiencyExplainerModal: React.FC<EfficiencyExplainerModalProps> = ({
  isOpen,
  onClose,
  currentEfficiency,
  completedEfficiency,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-800 sticky top-0 bg-neutral-900/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-100">
                Como Funciona a Eficiência da Oficina?
              </h3>
              <p className="text-xs text-neutral-400">
                Entenda a métrica de produtividade, a fórmula e como interpretar os resultados
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          
          {/* Snapshot atual da oficina */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-neutral-950 border border-neutral-800">
            <div>
              <span className="text-[11px] text-neutral-400 block mb-0.5">Eficiência Geral Ponderada</span>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-2xl font-bold font-mono ${currentEfficiency >= 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {currentEfficiency}%
                </span>
                <span className="text-xs text-neutral-500">(Todas as OS)</span>
              </div>
            </div>

            <div>
              <span className="text-[11px] text-neutral-400 block mb-0.5">Eficiência em Concluídas</span>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-2xl font-bold font-mono ${completedEfficiency >= 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {completedEfficiency}%
                </span>
                <span className="text-xs text-neutral-500">(Serviços entregues)</span>
              </div>
            </div>
          </div>

          {/* O Conceito */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-amber-400" />
              <span>O Conceito e a Fórmula Padrão Automotiva</span>
            </h4>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Na gestão de oficinas mecânicas e concessionárias, a <strong>Eficiência de Mão de Obra</strong> mede o quão rápido e produtivo foi o serviço em comparação com o tempo que foi <strong>vendido/orçado</strong> para o cliente:
            </p>
            <div className="p-3 rounded-lg bg-neutral-950 font-mono text-center text-xs text-amber-300 border border-neutral-800">
              Eficiência (%) = (Horas Orçadas ÷ Horas Executadas) × 100
            </div>
          </div>

          {/* O que significa cada faixa */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
              <Scale className="w-4 h-4 text-blue-400" />
              <span>Como Interpretar a Porcentagem?</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Acima de 100%</span>
                </div>
                <p className="text-neutral-300 text-[11px] leading-relaxed">
                  <strong>Alta Produtividade:</strong> O mecânico concluiu antes do tempo orçado.
                  Ex: Orçou 4h e fez em 3h = <strong>133%</strong>. A oficina ganha 1h de margem!
                </p>
              </div>

              <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/30">
                <div className="flex items-center gap-1.5 text-blue-400 font-bold mb-1">
                  <Clock className="w-4 h-4" />
                  <span>Exatamente 100%</span>
                </div>
                <p className="text-neutral-300 text-[11px] leading-relaxed">
                  <strong>Dentro da Meta:</strong> O mecânico executou no tempo exato orçado.
                  Ex: Orçou 3h e gastou 3h = <strong>100%</strong>. Meta de equilíbrio atingida.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30">
                <div className="flex items-center gap-1.5 text-rose-400 font-bold mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Abaixo de 100%</span>
                </div>
                <p className="text-neutral-300 text-[11px] leading-relaxed">
                  <strong>Atraso / Estouro:</strong> O serviço demorou mais do que o orçado.
                  Ex: Orçou 2h e gastou 3h = <strong>67%</strong>. Houve estouro de 1h de box.
                </p>
              </div>
            </div>
          </div>

          {/* Por que antes marcava mais de 1000%? */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-amber-500/30 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
              <Lightbulb className="w-4 h-4" />
              <span>Por que antes marcava mais de 1.000%?</span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Quando você criava uma O.S. com por exemplo <strong>4 horas orçadas</strong> e dava &ldquo;Iniciar Serviço&rdquo; e o cronômetro rodava apenas <strong>2 minutos (0,03 hora)</strong>, a divisão pura fazia:
            </p>
            <div className="p-2.5 rounded-lg bg-neutral-900 font-mono text-[11px] text-rose-300 border border-neutral-800 text-center">
              4,0h orçadas ÷ 0,03h executadas = 13.333% (Distorção por serviço não concluído)
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Como uma ordem em andamento <strong>ainda não foi concluída</strong>, creditar 4 horas inteiras em 2 minutos causava esse número gigante. 
            </p>
            <div className="text-xs text-emerald-300 font-medium pt-1">
              ✓ <strong>Como corrigimos agora:</strong> Enquanto o serviço está em andamento, ele pontua no ritmo proporcional padrão (100%). Se estourar o tempo, reduz a eficiência. E a eficiência real definitiva é consolidada assim que a O.S. é concluída!
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 flex justify-end bg-neutral-900">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition"
          >
            Entendi, fechar
          </button>
        </div>
      </div>
    </div>
  );
};
