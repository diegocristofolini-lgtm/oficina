import React from 'react';
import { AlertTriangle, Trash2, RotateCcw, X, Sparkles } from 'lucide-react';

interface ResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearAll: () => void;
  onRestoreDefaults: () => void;
  ordersCount: number;
}

export const ResetModal: React.FC<ResetModalProps> = ({
  isOpen,
  onClose,
  onClearAll,
  onRestoreDefaults,
  ordersCount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 text-neutral-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-neutral-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-100">
                Resetar Serviços / Ordens de Serviço
              </h3>
              <p className="text-xs text-neutral-400">
                Atualmente existem <strong className="text-neutral-200">{ordersCount} OS</strong> no sistema.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-neutral-300 leading-relaxed mb-5">
          Escolha como deseja resetar os dados de serviços de teste da oficina:
        </p>

        {/* Option 1: Limpar Tudo (Zerar completamente) */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => {
              onClearAll();
              onClose();
            }}
            className="w-full text-left p-4 rounded-xl bg-neutral-950 hover:bg-neutral-900 border border-rose-500/40 hover:border-rose-400 transition group"
          >
            <div className="flex items-center gap-2.5 text-rose-400 font-semibold text-sm mb-1">
              <Trash2 className="w-4 h-4" />
              <span>Limpar Todas as OS (Zerar Serviços)</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed group-hover:text-neutral-300">
              Remove <strong>todas as {ordersCount} ordens de serviço</strong> (ativas e concluídas) e zera os cronômetros e o Banco de Desempenho. Seus mecânicos cadastrados são mantidos. Ideal para começar a cadastrar os carros reais da oficina.
            </p>
          </button>

          {/* Option 2: Restaurar OS de Exemplo Padrão */}
          <button
            type="button"
            onClick={() => {
              onRestoreDefaults();
              onClose();
            }}
            className="w-full text-left p-4 rounded-xl bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 hover:border-amber-400/50 transition group"
          >
            <div className="flex items-center gap-2.5 text-amber-400 font-semibold text-sm mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Restaurar Serviços de Exemplo Iniciais</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed group-hover:text-neutral-300">
              Recarrega as 9 OS de teste originais (com exemplos de serviços em andamento, concluídos, alertas e horas no prazo) para demonstração.
            </p>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-neutral-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-neutral-200 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
