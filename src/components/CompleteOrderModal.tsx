import React from 'react';
import { CheckCircle2, X, Clock, AlertTriangle, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { WorkOrder, Mechanic } from '../types';
import { formatHours } from '../utils/format';

interface CompleteOrderModalProps {
  isOpen: boolean;
  order: WorkOrder | null;
  mechanic?: Mechanic;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

export const CompleteOrderModal: React.FC<CompleteOrderModalProps> = ({
  isOpen,
  order,
  mechanic,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !order) return null;

  const percentage = Math.round((order.executedHours / order.budgetedHours) * 100);
  const deltaHours = Number((order.budgetedHours - order.executedHours).toFixed(2));
  const isExceeded = deltaHours < 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-6 text-neutral-100 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-start gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0 border border-emerald-500/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-neutral-100">Concluir Ordem de Serviço</h3>
            <p className="text-xs text-neutral-400 mt-1">
              Deseja confirmar a finalização desta OS? Ela será arquivada no histórico de concluídas.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Details Card */}
        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3 mb-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs bg-neutral-900 text-neutral-300 px-2 py-0.5 rounded border border-neutral-800">
                {order.code}
              </span>
              <span className="font-mono text-xs font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                {order.vehiclePlate}
              </span>
            </div>
            <span className="text-xs text-neutral-400 font-medium">
              Mecânico: <strong className="text-neutral-200">{mechanic?.name || 'Não atribuído'}</strong>
            </span>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-neutral-100">{order.vehicleModel}</h4>
            <p className="text-xs text-neutral-400 mt-0.5">Cliente: <span className="text-neutral-200">{order.clientName}</span></p>
          </div>

          <div className="text-xs text-neutral-300 bg-neutral-900/60 p-2.5 rounded-lg border border-neutral-800/80">
            <span className="text-neutral-500 block text-[11px] mb-0.5 font-medium">Serviço executado:</span>
            {order.serviceDescription}
          </div>
        </div>

        {/* Comparison Hours & Balance */}
        <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-3 mb-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400 flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-neutral-500" />
              Consolidação de Horas:
            </span>
            <span className="text-neutral-400 text-[11px]">
              Eficiência: <strong className={isExceeded ? 'text-rose-400' : 'text-emerald-400'}>{percentage}%</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800">
              <span className="text-[11px] text-neutral-400 block">Tempo Orçado</span>
              <span className="text-sm font-mono font-bold text-neutral-200">
                {formatHours(order.budgetedHours)}
              </span>
            </div>

            <div className={`p-2.5 rounded-lg border ${
              isExceeded ? 'bg-rose-950/30 border-rose-500/30' : 'bg-neutral-900 border-neutral-800'
            }`}>
              <span className="text-[11px] text-neutral-400 block">Tempo Executado</span>
              <span className={`text-sm font-mono font-bold ${isExceeded ? 'text-rose-400' : 'text-neutral-200'}`}>
                {formatHours(order.executedHours)}
              </span>
            </div>
          </div>

          {/* Balance result banner */}
          <div className={`p-2.5 rounded-lg text-xs flex items-center justify-between ${
            !isExceeded
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
          }`}>
            <div className="flex items-center gap-2">
              {!isExceeded ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-rose-400" />}
              <span className="font-medium">
                {!isExceeded ? 'Saldo Positivo de Horas:' : 'Saldo Negativo (Estouro):'}
              </span>
            </div>
            <span className="font-mono font-bold text-sm">
              {!isExceeded ? `+${formatHours(deltaHours)} sobrando` : `-${formatHours(Math.abs(deltaHours))} estouradas`}
            </span>
          </div>

          {order.isTimerRunning && (
            <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>O cronômetro ativo será finalizado e o tempo atual de expediente computado.</span>
            </div>
          )}
        </div>

        {/* Move Destination Notice */}
        <div className="p-3 rounded-lg bg-neutral-900/80 border border-neutral-800 text-xs text-neutral-300 flex items-center gap-2.5 mb-5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span>
            Ao confirmar, esta OS <strong>sairá da lista ativa</strong> e será movida para a aba <strong>Concluídas</strong>.
          </span>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={() => {
              onConfirm(order.id);
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition shadow-md shadow-emerald-950/40"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirmar Conclusão</span>
          </button>
        </div>

      </div>
    </div>
  );
};
