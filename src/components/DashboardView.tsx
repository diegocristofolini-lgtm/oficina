import React, { useState } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Play, 
  Pause, 
  ArrowRight,
  Plus,
  Scale,
  Sparkles
} from 'lucide-react';
import { MetricCard } from './MetricCard';
import { ExceededAlertBanner } from './ExceededAlertBanner';
import { HoursComparisonChart } from './Charts/HoursComparisonChart';
import { BalanceBankChart } from './Charts/BalanceBankChart';
import { CategoryEfficiencyChart } from './Charts/CategoryEfficiencyChart';
import { EfficiencyExplainerModal } from './EfficiencyExplainerModal';
import { WorkOrder, Mechanic, MechanicProductivity, WorkshopMetrics } from '../types';
import { formatHours, formatHoursWithSign } from '../utils/format';
import { getWorkScheduleStatus } from '../utils/workSchedule';
import { Coffee, SunMedium } from 'lucide-react';

interface DashboardViewProps {
  metrics: WorkshopMetrics;
  productivity: MechanicProductivity[];
  workOrders: WorkOrder[];
  mechanics: Mechanic[];
  categoryStats: any[];
  onToggleTimer: (id: string) => void;
  onOpenOrderModal: (order?: WorkOrder) => void;
  onNavigateToTab: (tab: any) => void;
  onOpenResetModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  productivity,
  workOrders,
  mechanics,
  categoryStats,
  onToggleTimer,
  onOpenOrderModal,
  onNavigateToTab,
  onOpenResetModal,
}) => {
  const [showEfficiencyExplainer, setShowEfficiencyExplainer] = useState(false);
  const activeOrders = workOrders.filter(
    o => o.status === 'in_progress' || o.status === 'paused' || o.status === 'not_started'
  );

  return (
    <div className="space-y-6">
      
      {/* Real-time Alert Banner for over-budget orders */}
      <ExceededAlertBanner
        orders={metrics.activeExceededOrders}
        mechanics={mechanics}
        onSelectOrder={order => onOpenOrderModal(order)}
      />

      {/* Workshop Schedule Shift Status */}
      {(() => {
        const schedule = getWorkScheduleStatus();
        return (
          <div className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs ${
            schedule.isWorking 
              ? 'bg-neutral-900/80 border-emerald-500/30 text-neutral-300' 
              : 'bg-amber-950/20 border-amber-500/30 text-amber-200'
          }`}>
            <div className="flex items-center gap-2">
              <div className={`p-1 rounded-md ${schedule.isWorking ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                {schedule.isWorking ? <SunMedium className="w-3.5 h-3.5" /> : <Coffee className="w-3.5 h-3.5" />}
              </div>
              <span className="font-semibold">{schedule.statusText}</span>
            </div>
            <span className="text-neutral-400 text-[11px] font-mono">
              Turnos: 07:30–09:00 · 09:30–12:00 · 13:30–16:00 · 16:30–18:00
            </span>
          </div>
        );
      })()}

      {/* Top 5 KPI Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          label="Horas Orçadas"
          value={formatHours(metrics.totalBudgetedHours)}
          subtext="Volume total orçado em OS"
          icon={Clock}
        />

        <MetricCard
          label="Horas Executadas"
          value={formatHours(metrics.totalExecutedHours)}
          subtext="Tempo real apontado"
          icon={Clock}
          highlight={metrics.totalExecutedHours > metrics.totalBudgetedHours}
        />

        <MetricCard
          label="Banco de Desempenho"
          value={formatHoursWithSign(metrics.totalBalanceHours)}
          subtext={metrics.totalBalanceHours >= 0 ? 'Horas Sobrando (Economizadas)' : 'Horas Faltando (Estouro)'}
          trend={metrics.totalBalanceHours >= 0 ? 'positive' : 'negative'}
          trendValue={metrics.totalBalanceHours >= 0 ? 'Positivo' : 'Déficit'}
          icon={Scale}
        />

        <MetricCard
          label="Eficiência Geral"
          value={metrics.workshopEfficiency}
          unit="%"
          subtext={`Concluídas: ${metrics.completedEfficiency}% · Clique (?)`}
          trend={metrics.workshopEfficiency >= 100 ? 'positive' : 'negative'}
          trendValue={metrics.workshopEfficiency >= 100 ? 'No ritmo/Acima' : 'Abaixo da meta'}
          icon={TrendingUp}
          onInfoClick={() => setShowEfficiencyExplainer(true)}
        />

        <MetricCard
          label="Ordens com Alerta"
          value={metrics.exceededOrdersCount}
          unit="OS"
          subtext={`${metrics.activeExceededOrders.length} em andamento agora`}
          trend={metrics.exceededOrdersCount > 0 ? 'negative' : 'positive'}
          trendValue={metrics.exceededOrdersCount > 0 ? 'Atenção' : 'Todas no prazo'}
          icon={AlertTriangle}
          highlight={metrics.exceededOrdersCount > 0}
        />
      </div>

      {/* Primary Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HoursComparisonChart data={productivity} />
        <BalanceBankChart
          data={productivity}
          totalBalanceHours={metrics.totalBalanceHours}
          totalGainLoss={metrics.financialGainLoss}
        />
      </div>

      {/* Secondary Row: Service Category Accuracy & Active Floor Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Service Category Accuracy */}
        <div className="lg:col-span-1">
          <CategoryEfficiencyChart data={categoryStats} />
        </div>

        {/* Right 2 columns: Active Services on Floor with Live Timers */}
        <div className="lg:col-span-2 bg-neutral-900/70 border border-neutral-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-neutral-100">
                Pátio & Serviços em Andamento
              </h3>
              <p className="text-xs text-neutral-400">
                Controle em tempo real do tempo orçado vs. executado no chão de oficina
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('orders')}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
            >
              Ver todas ({workOrders.length}) <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {activeOrders.slice(0, 4).map(order => {
              const mechanic = mechanics.find(m => m.id === order.mechanicId);
              const percentage = Math.round((order.executedHours / order.budgetedHours) * 100);
              const isExceeded = order.executedHours > order.budgetedHours;
              const isWarning = !isExceeded && percentage >= 80;

              return (
                <div
                  key={order.id}
                  className={`p-3.5 rounded-lg border transition ${
                    isExceeded
                      ? 'bg-rose-950/20 border-rose-500/30'
                      : isWarning
                      ? 'bg-amber-950/20 border-amber-500/30'
                      : 'bg-neutral-950/40 border-neutral-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-neutral-400 font-semibold">{order.code}</span>
                      <span className="text-sm font-medium text-neutral-200">
                        {order.vehicleModel} · <span className="font-mono text-neutral-300">{order.vehiclePlate}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs font-mono tabular-nums text-neutral-300 block">
                          <strong className={isExceeded ? 'text-rose-400' : 'text-neutral-200'}>
                            {formatHours(order.executedHours)}
                          </strong>{' '}
                          / {formatHours(order.budgetedHours)} orçadas
                        </span>
                      </div>

                      {/* Timer Play/Pause Button */}
                      <button
                        onClick={() => onToggleTimer(order.id)}
                        className={`p-2 rounded-lg border flex items-center gap-1.5 text-xs font-medium transition ${
                          order.isTimerRunning
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                            : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
                        }`}
                        title={order.isTimerRunning ? 'Pausar serviço' : 'Iniciar serviço (continua contando no expediente)'}
                      >
                        {order.isTimerRunning ? (
                          <>
                            <Pause className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Pausar</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Iniciar Serviço</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-neutral-400 mb-2 truncate">
                    {order.serviceDescription} · <span className="text-neutral-300">Mecânico: {mechanic?.name}</span>
                  </div>

                  {/* Progress towards budgeted time */}
                  <div className="space-y-1">
                    <div className="w-full bg-neutral-900 h-2.5 rounded-full overflow-hidden flex">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isExceeded
                            ? 'bg-rose-500'
                            : isWarning
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, percentage)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className={isExceeded ? 'text-rose-400 font-bold' : isWarning ? 'text-amber-400' : 'text-neutral-400'}>
                        {percentage}% do tempo orçado utilizado
                      </span>
                      <span className={isExceeded ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                        {isExceeded 
                          ? `Estourado em +${formatHours(order.executedHours - order.budgetedHours)}`
                          : `Restam ${formatHours(order.budgetedHours - order.executedHours)}`
                        }
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {activeOrders.length === 0 && (
              <div className="text-center py-8 text-neutral-500 text-xs">
                Nenhum serviço em andamento no momento.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer helper for resetting or adding demo data */}
      <div className="pt-4 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-500">
        <span>OficinaPro · Sistema de Gestão de Horas & Produtividade da Oficina</span>
        <button
          onClick={onOpenResetModal}
          className="text-amber-400 hover:text-amber-300 underline font-medium cursor-pointer"
        >
          Resetar / Limpar serviços de teste
        </button>
      </div>

      {/* Efficiency Explainer Modal */}
      <EfficiencyExplainerModal
        isOpen={showEfficiencyExplainer}
        onClose={() => setShowEfficiencyExplainer(false)}
        currentEfficiency={metrics.workshopEfficiency}
        completedEfficiency={metrics.completedEfficiency}
      />

    </div>
  );
};
