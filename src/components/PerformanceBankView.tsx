import React, { useState } from 'react';
import { 
  Scale, 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  Award, 
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { MechanicProductivity, WorkOrder } from '../types';
import { formatHours, formatHoursWithSign } from '../utils/format';

interface PerformanceBankViewProps {
  productivity: MechanicProductivity[];
  workOrders: WorkOrder[];
}

export const PerformanceBankView: React.FC<PerformanceBankViewProps> = ({
  productivity,
  workOrders,
}) => {
  const [selectedMechanicId, setSelectedMechanicId] = useState<string>('all');

  // Totals
  const totalSavedHours = productivity
    .filter(p => p.balanceHours > 0)
    .reduce((acc, p) => acc + p.balanceHours, 0);

  const totalExceededHours = productivity
    .filter(p => p.balanceHours < 0)
    .reduce((acc, p) => acc + Math.abs(p.balanceHours), 0);

  const netBalanceHours = Number((totalSavedHours - totalExceededHours).toFixed(1));

  const totalFinancialImpact = productivity.reduce((acc, p) => acc + p.financialBalance, 0);

  // Filtered orders for detailed bank ledger
  const relevantOrders = workOrders
    .filter(o => o.executedHours > 0)
    .filter(o => selectedMechanicId === 'all' || o.mechanicId === selectedMechanicId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
          <Scale className="w-5 h-5 text-amber-400" />
          <span>Banco de Desempenho & Horas</span>
        </h2>
        <p className="text-xs text-neutral-400">
          Controle de crédito e débito de mão de obra: horas sobrando (ganho de eficiência) vs. horas faltando (estouro de orçamento)
        </p>
      </div>

      {/* Main Bank Scoreboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Horas Sobrando */}
        <div className="p-5 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Horas Sobrando (Crédito)</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold font-mono text-emerald-300 tabular-nums">
              +{formatHours(totalSavedHours)}
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-2">
            Tempo adiantado antes do orçamento. Margem e lucratividade direta para a oficina.
          </p>
        </div>

        {/* Horas Faltando */}
        <div className="p-5 rounded-xl bg-rose-950/20 border border-rose-500/30">
          <div className="flex items-center justify-between text-rose-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Horas Faltando (Débito)</span>
            <ArrowDownRight className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold font-mono text-rose-300 tabular-nums">
              -{formatHours(totalExceededHours)}
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-2">
            Tempo gasto além do orçado. Exige ajuste no padrão de orçamentos ou suporte técnico.
          </p>
        </div>

        {/* Saldo Líquido */}
        <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Saldo Líquido</span>
            <Scale className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-3xl font-bold font-mono tabular-nums ${
                netBalanceHours >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatHoursWithSign(netBalanceHours)}
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-2">
            Balanço consolidado entre horas poupadas e horas estouradas na oficina.
          </p>
        </div>

        {/* Impacto Financeiro */}
        <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Impacto em R$</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums ${
                totalFinancialImpact >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {totalFinancialImpact >= 0
                ? `+R$ ${totalFinancialImpact.toFixed(2)}`
                : `-R$ ${Math.abs(totalFinancialImpact).toFixed(2)}`}
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-2">
            Valorização pelo custo homem/hora de cada colaborador da equipe.
          </p>
        </div>

      </div>

      {/* Collaborator Performance Bank Ranking Table */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-neutral-100">
              Quadro de Produtividade & Saldo por Mecânico
            </h3>
            <p className="text-xs text-neutral-400">
              Classificação por assertividade, saldo de horas e eficiência técnica
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <span>Meta da oficina:</span>
            <strong className="text-neutral-200">100% de Eficiência</strong>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950/70 text-neutral-400 border-b border-neutral-800 font-medium">
              <tr>
                <th className="py-3 px-4">Colaborador</th>
                <th className="py-3 px-3 text-right">Horas Orçadas</th>
                <th className="py-3 px-3 text-right">Horas Executadas</th>
                <th className="py-3 px-3 text-right">Saldo de Horas</th>
                <th className="py-3 px-3 text-right">Eficiência</th>
                <th className="py-3 px-3 text-right">OS no Prazo</th>
                <th className="py-3 px-4 text-right">Balanço em R$</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-mono">
              {productivity.map(prod => {
                const isPositive = prod.balanceHours >= 0;
                return (
                  <tr key={prod.mechanic.id} className="hover:bg-neutral-800/40 transition">
                    <td className="py-3.5 px-4 font-sans">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-neutral-100">{prod.mechanic.name}</span>
                        {prod.mechanic.department && prod.mechanic.department !== 'mecanica' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-amber-300 font-mono">
                            {prod.mechanic.department === 'pecas' ? 'Peças' : prod.mechanic.department === 'administrativo' ? 'Adm' : prod.mechanic.department}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        {prod.mechanic.role || prod.mechanic.specialty}
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-right tabular-nums text-neutral-300">
                      {formatHours(prod.totalBudgetedHours)}
                    </td>

                    <td className="py-3.5 px-3 text-right tabular-nums text-neutral-300">
                      {formatHours(prod.totalExecutedHours)}
                    </td>

                    <td className="py-3.5 px-3 text-right tabular-nums">
                      <span
                        className={`font-bold ${
                          isPositive ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {formatHoursWithSign(prod.balanceHours)}
                      </span>
                      <div className="text-[10px] text-neutral-500 font-sans">
                        {isPositive ? 'Sobrando' : 'Estourado'}
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-right tabular-nums">
                      <span
                        className={`font-bold ${
                          prod.efficiency >= 100
                            ? 'text-emerald-400'
                            : prod.efficiency >= 85
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {prod.efficiency}%
                      </span>
                      {prod.completedCount > 0 && (
                        <div className="text-[10px] text-neutral-500 font-sans">
                          {prod.completedEfficiency}% em concl.
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-right tabular-nums text-neutral-300">
                      {prod.onTimeRate}%{' '}
                      <span className="text-neutral-500 text-[10px] font-sans">
                        ({prod.onTimeCount}/{prod.completedCount})
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right tabular-nums font-semibold">
                      <span className={prod.financialBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {prod.financialBalance >= 0
                          ? `+R$ ${prod.financialBalance.toFixed(2)}`
                          : `-R$ ${Math.abs(prod.financialBalance).toFixed(2)}`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Itemized Bank Ledger (Extrato de Lançamentos de Horas) */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-neutral-100">
              Extrato Detalhado de Horas por Serviço
            </h3>
            <p className="text-xs text-neutral-400">
              Histórico de cada OS com seu crédito (+) ou débito (-) de horas
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">Filtrar Colaborador:</span>
            <select
              value={selectedMechanicId}
              onChange={e => setSelectedMechanicId(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
            >
              <option value="all">Todos os Colaboradores</option>
              {productivity.map(p => (
                <option key={p.mechanic.id} value={p.mechanic.id}>
                  {p.mechanic.name} {p.mechanic.department && p.mechanic.department !== 'mecanica' ? `(${p.mechanic.department})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="divide-y divide-neutral-800/80">
          {relevantOrders.map(order => {
            const delta = Number((order.budgetedHours - order.executedHours).toFixed(2));
            const isSaved = delta >= 0;
            const mechanic = productivity.find(p => p.mechanic.id === order.mechanicId)?.mechanic;

            return (
              <div key={order.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-neutral-400 font-medium">{order.code}</span>
                    <span className="text-xs font-semibold text-neutral-200">{order.vehicleModel}</span>
                    <span className="font-mono text-xs text-neutral-400">{order.vehiclePlate}</span>
                  </div>
                  <div className="text-xs text-neutral-400 truncate max-w-md mt-0.5">
                    {order.serviceDescription} · <span className="text-neutral-300">{mechanic?.name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono tabular-nums sm:self-center">
                  <div className="text-right">
                    <span className="text-neutral-400 block text-[11px]">Orçado / Executado</span>
                    <span className="text-neutral-200">
                      {formatHours(order.budgetedHours)} / {formatHours(order.executedHours)}
                    </span>
                  </div>

                  <div className="min-w-28 text-right">
                    <span
                      className={`font-bold text-sm ${
                        isSaved ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isSaved ? `+${formatHours(delta)} Sobrando` : `-${formatHours(Math.abs(delta))} Estouradas`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
