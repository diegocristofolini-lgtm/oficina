import React, { useState } from 'react';
import { 
  Search, 
  Play, 
  Pause, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  Check,
  SlidersHorizontal,
  Coffee,
  SunMedium,
  RotateCcw,
  ArrowRight,
  X,
  Layers,
  Filter
} from 'lucide-react';
import { WorkOrder, Mechanic, OSStatus } from '../types';
import { formatHours } from '../utils/format';
import { getWorkScheduleStatus } from '../utils/workSchedule';
import { DeleteOrderModal } from './DeleteOrderModal';
import { AdjustHoursModal } from './AdjustHoursModal';
import { CompleteOrderModal } from './CompleteOrderModal';

interface WorkOrdersViewProps {
  workOrders: WorkOrder[];
  mechanics: Mechanic[];
  onToggleTimer: (id: string) => void;
  onAdjustBudgetedHours: (id: string, delta: number) => void;
  onSetExactBudgetedHours: (id: string, newTotal: number) => void;
  onAdjustExecutedHours: (id: string, delta: number) => void;
  onSetExactExecutedHours: (id: string, newTotal: number, note?: string) => void;
  onUpdateStatus: (id: string, status: OSStatus) => void;
  onOpenOrderModal: (order?: WorkOrder) => void;
  onDeleteOrder: (id: string) => void;
  onOpenResetModal?: () => void;
}

export const WorkOrdersView: React.FC<WorkOrdersViewProps> = ({
  workOrders,
  mechanics,
  onToggleTimer,
  onAdjustBudgetedHours,
  onSetExactBudgetedHours,
  onAdjustExecutedHours,
  onSetExactExecutedHours,
  onUpdateStatus,
  onOpenOrderModal,
  onDeleteOrder,
  onOpenResetModal,
}) => {
  // Main view tab: 'active' (default) | 'completed' | 'all'
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'all'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMechanic, setSelectedMechanic] = useState<string>('all');
  const [onlyExceeded, setOnlyExceeded] = useState<boolean>(false);
  
  // Notification toast when an order is completed
  const [recentlyCompleted, setRecentlyCompleted] = useState<{ id: string; code: string; vehicle: string } | null>(null);

  // Modals state
  const [orderToDelete, setOrderToDelete] = useState<WorkOrder | null>(null);
  const [orderToAdjust, setOrderToAdjust] = useState<WorkOrder | null>(null);
  const [orderToComplete, setOrderToComplete] = useState<WorkOrder | null>(null);

  const scheduleStatus = getWorkScheduleStatus();

  // Counts for tabs
  const activeOrdersCount = workOrders.filter(o => o.status !== 'completed').length;
  const completedOrdersCount = workOrders.filter(o => o.status === 'completed').length;
  const exceededCount = workOrders.filter(o => o.executedHours > o.budgetedHours).length;

  const filteredOrders = workOrders.filter(order => {
    // 1. Tab filter
    if (activeTab === 'active' && order.status === 'completed') {
      return false;
    }
    if (activeTab === 'completed' && order.status !== 'completed') {
      return false;
    }

    // 2. Search filter
    const matchesSearch = 
      order.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.vehicleModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.serviceDescription.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // 3. Mechanic filter
    if (selectedMechanic !== 'all' && order.mechanicId !== selectedMechanic) {
      return false;
    }

    // 4. Exceeded toggle
    if (onlyExceeded && order.executedHours <= order.budgetedHours) {
      return false;
    }

    return true;
  });

  const handleConfirmCompletion = (id: string) => {
    const targetOrder = workOrders.find(o => o.id === id);
    onUpdateStatus(id, 'completed');
    if (targetOrder) {
      setRecentlyCompleted({
        id: targetOrder.id,
        code: targetOrder.code,
        vehicle: targetOrder.vehicleModel,
      });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Workshop Shift Schedule Notice */}
      <div className={`p-3.5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs ${
        scheduleStatus.isWorking 
          ? 'bg-neutral-900/90 border-emerald-500/30 text-neutral-300' 
          : 'bg-amber-950/20 border-amber-500/30 text-amber-200'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-lg ${scheduleStatus.isWorking ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
            {scheduleStatus.isWorking ? <SunMedium className="w-4 h-4" /> : <Coffee className="w-4 h-4" />}
          </div>
          <div>
            <span className="font-semibold block text-neutral-100">{scheduleStatus.statusText}</span>
            <span className="text-neutral-400 text-[11px]">
              Expediente: 07:30 às 09:00 · 09:30 às 12:00 · 13:30 às 16:00 · 16:30 às 18:00 (Fora desses turnos o cronômetro não conta)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto text-[11px] text-neutral-400 font-mono">
          <span className="w-2 h-2 rounded-full inline-block bg-emerald-400 animate-pulse" />
          <span>Regra de 8h/dia ativada</span>
        </div>
      </div>

      {/* Header and New OS Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-100">Ordens de Serviço (OS)</h2>
          <p className="text-xs text-neutral-400">
            Acompanhamento em tempo real de horas orçadas vs. executadas por veículo e mecânico
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {onOpenResetModal && (
            <button
              onClick={onOpenResetModal}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-lg transition"
              title="Resetar todos os serviços ou carregar dados de teste"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Resetar Serviços</span>
            </button>
          )}

          <button
            onClick={() => onOpenOrderModal()}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition shadow-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Ordem de Serviço</span>
          </button>
        </div>
      </div>

      {/* Notification Toast when an OS was completed and moved */}
      {recentlyCompleted && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between gap-3 text-xs text-emerald-200 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>{recentlyCompleted.code} ({recentlyCompleted.vehicle})</strong> foi concluída com sucesso e movida para a aba de <strong>Concluídas</strong>.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {activeTab !== 'completed' && (
              <button
                onClick={() => {
                  setActiveTab('completed');
                  setRecentlyCompleted(null);
                }}
                className="px-2.5 py-1 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-medium text-xs flex items-center gap-1 transition"
              >
                <span>Ver Concluídas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => setRecentlyCompleted(null)}
              className="p-1 text-emerald-400 hover:text-emerald-200 rounded transition"
              title="Fechar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Primary Tab Navigation: Ativas (default) vs Concluídas vs Todas */}
      <div className="flex border-b border-neutral-800 gap-2 sm:gap-4">
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-3 px-3 sm:px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition relative ${
            activeTab === 'active'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <span>Em Aberto / No Pátio</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${
            activeTab === 'active'
              ? 'bg-amber-400/20 text-amber-300'
              : 'bg-neutral-800 text-neutral-400'
          }`}>
            {activeOrdersCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`pb-3 px-3 sm:px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition relative ${
            activeTab === 'completed'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Concluídas</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${
            activeTab === 'completed'
              ? 'bg-emerald-500/20 text-emerald-300'
              : 'bg-neutral-800 text-neutral-400'
          }`}>
            {completedOrdersCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 px-3 sm:px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition relative ${
            activeTab === 'all'
              ? 'border-neutral-200 text-neutral-200'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <span>Todas as OS</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-neutral-800 text-neutral-400">
            {workOrders.length}
          </span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-neutral-900/70 border border-neutral-800 rounded-xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={
              activeTab === 'completed'
                ? "Buscar em concluídas por placa, veículo, cliente ou código..."
                : "Buscar em andamento por placa, veículo, cliente ou código..."
            }
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-500 placeholder:text-neutral-500"
          />
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Exceeded Only Toggle */}
          <button
            onClick={() => setOnlyExceeded(!onlyExceeded)}
            className={`px-3 py-2 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition ${
              onlyExceeded
                ? 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Apenas Estouradas</span>
          </button>

          {/* Collaborator / Mechanic Selector */}
          <select
            value={selectedMechanic}
            onChange={e => setSelectedMechanic(e.target.value)}
            className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
          >
            <option value="all">Todos os Colaboradores</option>
            {mechanics.map(m => (
              <option key={m.id} value={m.id}>
                {m.name} {m.department && m.department !== 'mecanica' ? `(${m.department === 'pecas' ? 'Peças' : m.department === 'administrativo' ? 'Adm' : m.department})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders List / Cards */}
      <div className="space-y-3">
        {filteredOrders.map(order => {
          const mechanic = mechanics.find(m => m.id === order.mechanicId);
          const percentage = Math.round((order.executedHours / order.budgetedHours) * 100);
          const isExceeded = order.executedHours > order.budgetedHours;
          const isWarning = !isExceeded && percentage >= 80;
          const deltaHours = Number((order.budgetedHours - order.executedHours).toFixed(2));
          const isCompleted = order.status === 'completed';

          return (
            <div
              key={order.id}
              className={`rounded-xl border p-4 sm:p-5 transition ${
                isCompleted
                  ? 'bg-neutral-900/60 border-neutral-800/90'
                  : isExceeded
                  ? 'border-rose-500/40 bg-rose-950/10'
                  : isWarning
                  ? 'border-amber-500/40 bg-amber-950/10'
                  : 'border-neutral-800 bg-neutral-900/80'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                {/* Left block: OS info, Vehicle, Service */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-neutral-300 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                      {order.code}
                    </span>
                    <span className="font-semibold text-neutral-100 text-sm sm:text-base">
                      {order.vehicleModel}
                    </span>
                    <span className="font-mono text-xs font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                      {order.vehiclePlate}
                    </span>
                    <span className="text-xs text-neutral-400">· {order.category}</span>
                    {isCompleted && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Concluída</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-neutral-300 font-medium line-clamp-2">
                    {order.serviceDescription}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-400 pt-1">
                    <span>Cliente: <strong className="text-neutral-200">{order.clientName}</strong></span>
                    <span aria-hidden="true" className="text-neutral-700">·</span>
                    <span>Mecânico: <strong className="text-neutral-200">{mechanic?.name || 'Não atribuído'}</strong></span>
                    {order.completedAt && (
                      <>
                        <span aria-hidden="true" className="text-neutral-700">·</span>
                        <span className="text-neutral-400">
                          Finalizada em: <strong className="text-neutral-300">{new Date(order.completedAt).toLocaleDateString('pt-BR')}</strong>
                        </span>
                      </>
                    )}
                    {order.notes && (
                      <>
                        <span aria-hidden="true" className="text-neutral-700">·</span>
                        <span className="text-neutral-400 italic truncate max-w-xs">{order.notes}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Center block: Hours Comparison & Live Progress */}
                <div className="w-full lg:w-72 shrink-0 bg-neutral-950/70 p-3 rounded-lg border border-neutral-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-neutral-400">Orçado: <strong className="text-neutral-200">{formatHours(order.budgetedHours)}</strong></span>
                    <span className={isExceeded ? 'text-rose-400 font-bold' : 'text-neutral-200'}>
                      Executado: <strong className="font-bold">{formatHours(order.executedHours)}</strong>
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isExceeded ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    />
                  </div>

                  {/* Saldo de Horas Badge */}
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-neutral-400">Balanço:</span>
                    <span
                      className={`font-semibold ${
                        deltaHours >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {deltaHours >= 0 ? `+${formatHours(deltaHours)} sobrando` : `${formatHours(Math.abs(deltaHours))} estouradas`}
                    </span>
                  </div>
                </div>

                {/* Right block: Real-time Controls & Actions */}
                <div className="flex flex-wrap items-center gap-2 lg:self-center shrink-0">
                  
                  {/* Timer Start/Pause button (Only for active orders) */}
                  {!isCompleted && (
                    <button
                      onClick={() => onToggleTimer(order.id)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition ${
                        order.isTimerRunning
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse'
                          : 'bg-neutral-800 text-neutral-200 border-neutral-700 hover:bg-neutral-700'
                      }`}
                      title={order.isTimerRunning ? 'Pausar serviço' : 'Iniciar serviço (iniciar cronômetro de bancada)'}
                    >
                      {order.isTimerRunning ? (
                        <>
                          <Pause className="w-3.5 h-3.5" />
                          <span>Pausar</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          <span>Iniciar Serviço</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Ajustar Horas Button (Dedicated Modal) */}
                  <button
                    onClick={() => setOrderToAdjust(order)}
                    className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-neutral-700 rounded-lg text-xs font-medium flex items-center gap-1 transition"
                    title="Ajustar tempo executado ou orçado"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Ajustar</span>
                  </button>

                  {/* Quick inline +/- 15 min and 30 min buttons (Only for active orders) */}
                  {!isCompleted && (
                    <div className="hidden sm:flex items-center border border-neutral-800 rounded-lg overflow-hidden bg-neutral-950 text-xs">
                      <button
                        onClick={() => onAdjustBudgetedHours(order.id, 0.25)}
                        className="px-2 py-1.5 hover:bg-neutral-800 text-emerald-400 font-mono transition"
                        title="Adicionar +15 minutos ao tempo orçado da OS (+0.25h)"
                      >
                        +15m
                      </button>
                      <button
                        onClick={() => onAdjustBudgetedHours(order.id, 0.5)}
                        className="px-2 py-1.5 hover:bg-neutral-800 text-emerald-400 font-mono transition border-l border-neutral-800"
                        title="Adicionar +30 minutos ao tempo orçado da OS (+0.5h)"
                      >
                        +30m
                      </button>
                      <button
                        onClick={() => onAdjustBudgetedHours(order.id, -0.25)}
                        className="px-2 py-1.5 hover:bg-neutral-800 text-rose-400 font-mono transition border-l border-neutral-800"
                        title="Retirar 15 minutos do tempo orçado da OS (-0.25h)"
                      >
                        -15m
                      </button>
                    </div>
                  )}

                  {/* Concluir (with confirmation modal) OR Reabrir button */}
                  {isCompleted ? (
                    <button
                      onClick={() => onUpdateStatus(order.id, 'in_progress')}
                      className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-neutral-700 text-xs font-medium flex items-center gap-1.5 transition"
                      title="Reabrir esta OS e movê-la de volta para a lista de ordens ativas"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reabrir OS</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setOrderToComplete(order)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium flex items-center gap-1.5 hover:bg-emerald-600/30 transition shadow-xs"
                      title="Solicitar confirmação e finalizar OS"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Concluir</span>
                    </button>
                  )}

                  {/* Edit button */}
                  <button
                    onClick={() => onOpenOrderModal(order)}
                    className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition"
                    title="Editar OS"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  {/* Delete button (Opens in-app Delete Confirmation Modal) */}
                  <button
                    onClick={() => setOrderToDelete(order)}
                    className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-rose-400 hover:bg-rose-950/40 transition"
                    title="Excluir OS"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                </div>

              </div>
            </div>
          );
        })}

        {filteredOrders.length === 0 && (
          <div className="text-center py-12 bg-neutral-900/50 border border-neutral-800 rounded-xl text-neutral-400">
            <Clock className="w-8 h-8 mx-auto mb-2 text-neutral-500" />
            <p className="text-sm font-medium">
              {activeTab === 'completed'
                ? "Nenhuma Ordem de Serviço concluída encontrada com os filtros selecionados."
                : activeTab === 'active'
                ? "Nenhuma Ordem de Serviço ativa no momento. Todas as OS foram concluídas!"
                : "Nenhuma Ordem de Serviço encontrada com os filtros selecionados."}
            </p>
            <div className="flex items-center justify-center gap-3 mt-3">
              {activeTab === 'active' && completedOrdersCount > 0 && (
                <button
                  onClick={() => setActiveTab('completed')}
                  className="px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:underline"
                >
                  Ver aba de Concluídas ({completedOrdersCount})
                </button>
              )}
              <button
                onClick={() => { setSearchTerm(''); setOnlyExceeded(false); setSelectedMechanic('all'); }}
                className="px-3 py-1.5 text-xs text-amber-400 hover:underline"
              >
                Limpar filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* In-app Complete Confirmation Modal (Requirement: Pedir confirmação e mover para Concluídas) */}
      <CompleteOrderModal
        isOpen={!!orderToComplete}
        order={orderToComplete}
        mechanic={mechanics.find(m => m.id === orderToComplete?.mechanicId)}
        onClose={() => setOrderToComplete(null)}
        onConfirm={id => {
          handleConfirmCompletion(id);
          setOrderToComplete(null);
        }}
      />

      {/* In-app Delete Confirmation Modal (Solves the iframe window.confirm issue) */}
      <DeleteOrderModal
        isOpen={!!orderToDelete}
        order={orderToDelete}
        onClose={() => setOrderToDelete(null)}
        onConfirm={id => {
          onDeleteOrder(id);
          setOrderToDelete(null);
        }}
      />

      {/* In-app Adjust Hours Modal (Solves adjusting more or less time clearly) */}
      <AdjustHoursModal
        isOpen={!!orderToAdjust}
        order={orderToAdjust}
        onClose={() => setOrderToAdjust(null)}
        onSaveBudgetedHours={(id, newBudgetedHours) => {
          onSetExactBudgetedHours(id, newBudgetedHours);
          setOrderToAdjust(null);
        }}
        onSaveExecutedHours={(id, newExecutedHours, note) => {
          onSetExactExecutedHours(id, newExecutedHours, note);
          setOrderToAdjust(null);
        }}
      />

    </div>
  );
};
