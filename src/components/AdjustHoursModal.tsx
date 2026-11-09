import React, { useState, useEffect } from 'react';
import { Clock, Plus, Minus, X, Check, FileText, Wrench } from 'lucide-react';
import { WorkOrder } from '../types';
import { formatHours } from '../utils/format';

interface AdjustHoursModalProps {
  isOpen: boolean;
  order: WorkOrder | null;
  onClose: () => void;
  onSaveBudgetedHours?: (orderId: string, newBudgetedHours: number) => void;
  onSaveExecutedHours?: (orderId: string, newExecutedHours: number, note?: string) => void;
}

export const AdjustHoursModal: React.FC<AdjustHoursModalProps> = ({
  isOpen,
  order,
  onClose,
  onSaveBudgetedHours,
  onSaveExecutedHours,
}) => {
  // Mode: 'budget' (Adicionar mais tempo na OS / Orçamento) vs 'executed' (Corrigir cronômetro)
  const [mode, setMode] = useState<'budget' | 'executed'>('budget');
  
  const [targetBudgeted, setTargetBudgeted] = useState<number>(0);
  const [targetExecuted, setTargetExecuted] = useState<number>(0);
  const [adjustmentNote, setAdjustmentNote] = useState<string>('');

  useEffect(() => {
    if (order) {
      setTargetBudgeted(order.budgetedHours);
      setTargetExecuted(order.executedHours);
      setAdjustmentNote('');
      setMode('budget'); // default to adding/adjusting OS time
    }
  }, [order, isOpen]);

  if (!isOpen || !order) return null;

  const currentBudgeted = order.budgetedHours;
  const currentExecuted = order.executedHours;

  const handleApplyPresetBudget = (delta: number) => {
    setTargetBudgeted(prev => Math.max(0.01, Number((prev + delta).toFixed(4))));
  };

  const handleApplyPresetExecuted = (delta: number) => {
    setTargetExecuted(prev => Math.max(0, Number((prev + delta).toFixed(4))));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'budget') {
      if (onSaveBudgetedHours) {
        onSaveBudgetedHours(order.id, Math.max(0.01, targetBudgeted));
      }
    } else {
      if (onSaveExecutedHours) {
        onSaveExecutedHours(order.id, Math.max(0, targetExecuted), adjustmentNote.trim() || undefined);
      }
    }
    onClose();
  };

  // Live forecast preview
  const previewBudgeted = mode === 'budget' ? targetBudgeted : currentBudgeted;
  const previewExecuted = mode === 'executed' ? targetExecuted : currentExecuted;
  const previewBalance = Number((previewBudgeted - previewExecuted).toFixed(2));
  const isSavedAhead = previewBalance >= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-6 text-neutral-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-neutral-100">Ajuste de Horas da OS</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Identifier */}
        <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-xs mb-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-neutral-300">{order.code}</span>
              <span className="font-medium text-neutral-200 truncate">{order.vehicleModel}</span>
              <span className="font-mono text-amber-400">{order.vehiclePlate}</span>
            </div>
            <p className="text-neutral-400 text-[11px] truncate mt-0.5">{order.serviceDescription}</p>
          </div>
          <div className="text-right shrink-0 ml-3 font-mono">
            <span className="text-[10px] text-neutral-500 block">Tempo Orçado</span>
            <span className="font-bold text-neutral-200">{formatHours(order.budgetedHours)}</span>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-neutral-950 rounded-lg border border-neutral-800 mb-4 text-xs font-medium">
          <button
            type="button"
            onClick={() => setMode('budget')}
            className={`py-2 px-3 rounded-md transition flex items-center justify-center gap-1.5 ${
              mode === 'budget'
                ? 'bg-amber-400 text-neutral-950 font-bold shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Incluir / Retirar Tempo da OS</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('executed')}
            className={`py-2 px-3 rounded-md transition flex items-center justify-center gap-1.5 ${
              mode === 'executed'
                ? 'bg-amber-400 text-neutral-950 font-bold shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Corrigir Cronômetro (Trabalhado)</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          
          {mode === 'budget' ? (
            /* Mode 1: Incluir mais tempo na OS (Prazo / Orçamento) */
            <>
              <div className="p-3.5 rounded-lg bg-neutral-950/70 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Tempo Orçado Atual:</span>
                  <span className="font-mono font-bold text-neutral-200">{formatHours(currentBudgeted)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-amber-400 font-semibold">Novo Tempo da OS:</span>
                  <span className="font-mono font-bold text-amber-300 text-base">{formatHours(targetBudgeted)}</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-neutral-800/80">
                  <span className="text-neutral-400">Novo Saldo Previsto:</span>
                  <span className={`font-mono font-bold ${isSavedAhead ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isSavedAhead ? `+${formatHours(previewBalance)} sobrando` : `${formatHours(Math.abs(previewBalance))} estouradas`}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Adicionar mais tempo ao serviço (Aumenta o prazo da OS):
                </label>
                <div className="grid grid-cols-4 gap-1.5 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => handleApplyPresetBudget(0.25)}
                    className="py-2 px-1 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 rounded-lg border border-emerald-500/30 flex items-center justify-center gap-1 transition"
                    title="Adicionar 15 minutos (+0.25h)"
                  >
                    <Plus className="w-3.5 h-3.5" /> 15 min
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPresetBudget(0.5)}
                    className="py-2 px-1 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 rounded-lg border border-emerald-500/30 flex items-center justify-center gap-1 transition"
                    title="Adicionar 30 minutos (+0.5h)"
                  >
                    <Plus className="w-3.5 h-3.5" /> 30 min
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPresetBudget(1.0)}
                    className="py-2 px-1 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 rounded-lg border border-emerald-500/30 flex items-center justify-center gap-1 transition"
                    title="Adicionar 1 hora (+1.0h)"
                  >
                    <Plus className="w-3.5 h-3.5" /> 1 hora
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPresetBudget(2.0)}
                    className="py-2 px-1 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 rounded-lg border border-emerald-500/30 flex items-center justify-center gap-1 transition"
                    title="Adicionar 2 horas (+2.0h)"
                  >
                    <Plus className="w-3.5 h-3.5" /> 2 horas
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Ou retirar tempo do serviço:
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => handleApplyPresetBudget(-0.25)}
                    className="py-2 px-1 bg-neutral-800 hover:bg-neutral-700 text-rose-300 rounded-lg border border-neutral-700 flex items-center justify-center gap-1 transition"
                    title="Subtrair 15 minutos (-0.25h)"
                  >
                    <Minus className="w-3.5 h-3.5" /> 15 min
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPresetBudget(-0.5)}
                    className="py-2 px-1 bg-neutral-800 hover:bg-neutral-700 text-rose-300 rounded-lg border border-neutral-700 flex items-center justify-center gap-1 transition"
                    title="Subtrair 30 minutos (-0.5h)"
                  >
                    <Minus className="w-3.5 h-3.5" /> 30 min
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPresetBudget(-1.0)}
                    className="py-2 px-1 bg-neutral-800 hover:bg-neutral-700 text-rose-300 rounded-lg border border-neutral-700 flex items-center justify-center gap-1 transition"
                    title="Subtrair 1 hora (-1.0h)"
                  >
                    <Minus className="w-3.5 h-3.5" /> 1 hora
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Ou digite o total exato de horas orçadas da OS
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={isNaN(targetBudgeted) ? '' : targetBudgeted}
                    onChange={e => {
                      const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                      setTargetBudgeted(isNaN(val) ? 0.01 : Math.max(0.01, val));
                    }}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm font-mono text-neutral-100 focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-xs font-mono font-semibold px-2.5 py-1.5 rounded-lg bg-neutral-800 text-amber-300 shrink-0 border border-neutral-700">
                    = {formatHours(targetBudgeted)}
                  </span>
                </div>
              </div>
            </>
          ) : (
            /* Mode 2: Corrigir Horas Já Trabalhadas (Apontamento) */
            <>
              <div className="p-3.5 rounded-lg bg-neutral-950/70 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Tempo Executado Atual:</span>
                  <span className="font-mono font-bold text-neutral-200">{formatHours(currentExecuted)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-amber-400 font-semibold">Novo Tempo Trabalhado:</span>
                  <span className="font-mono font-bold text-amber-300 text-base">{formatHours(targetExecuted)}</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-neutral-800/80">
                  <span className="text-neutral-400">Novo Saldo Previsto:</span>
                  <span className={`font-mono font-bold ${isSavedAhead ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isSavedAhead ? `+${formatHours(previewBalance)} sobrando` : `${formatHours(Math.abs(previewBalance))} estouradas`}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Adicionar horas ao trabalho realizado:
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => handleApplyPresetExecuted(0.25)}
                    className="py-2 px-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg border border-neutral-700 flex items-center justify-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> 15 min
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPresetExecuted(0.5)}
                    className="py-2 px-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg border border-neutral-700 flex items-center justify-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> 30 min
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPresetExecuted(1.0)}
                    className="py-2 px-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg border border-neutral-700 flex items-center justify-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> 1 hora
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Subtrair horas do trabalho realizado (devolve tempo):
                </label>
                <div className="grid grid-cols-4 gap-1.5 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => handleApplyPresetExecuted(-0.25)}
                    className="py-2 px-1 bg-neutral-800 hover:bg-neutral-700 text-emerald-400 rounded-lg border border-neutral-700 flex items-center justify-center gap-1 transition"
                  >
                    <Minus className="w-3.5 h-3.5" /> 15 min
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPresetExecuted(-0.5)}
                    className="py-2 px-1 bg-neutral-800 hover:bg-neutral-700 text-emerald-400 rounded-lg border border-neutral-700 flex items-center justify-center gap-1 transition"
                  >
                    <Minus className="w-3.5 h-3.5" /> 30 min
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPresetExecuted(-1.0)}
                    className="py-2 px-1 bg-neutral-800 hover:bg-neutral-700 text-emerald-400 rounded-lg border border-neutral-700 flex items-center justify-center gap-1 transition"
                  >
                    <Minus className="w-3.5 h-3.5" /> 1 hora
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetExecuted(0)}
                    className="py-2 px-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 rounded-lg border border-neutral-700 flex items-center justify-center transition"
                  >
                    Zerar
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Ou digite o total exato trabalhado
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={isNaN(targetExecuted) ? '' : targetExecuted}
                    onChange={e => {
                      const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                      setTargetExecuted(isNaN(val) ? 0 : Math.max(0, val));
                    }}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm font-mono text-neutral-100 focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-xs font-mono font-semibold px-2.5 py-1.5 rounded-lg bg-neutral-800 text-neutral-200 shrink-0 border border-neutral-700">
                    = {formatHours(targetExecuted)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Motivo da correção (opcional)
                </label>
                <input
                  type="text"
                  value={adjustmentNote}
                  onChange={e => setAdjustmentNote(e.target.value)}
                  placeholder="Ex: Esquecimento de pausar no almoço..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-neutral-200 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Alterações</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
