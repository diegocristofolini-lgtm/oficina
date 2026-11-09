import React from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Scale } from 'lucide-react';
import { MechanicProductivity } from '../../types';
import { formatHours } from '../../utils/format';

interface BalanceBankChartProps {
  data: MechanicProductivity[];
  totalBalanceHours: number;
  totalGainLoss: number;
}

export const BalanceBankChart: React.FC<BalanceBankChartProps> = ({
  data,
  totalBalanceHours,
  totalGainLoss,
}) => {
  const maxAbsBalance = Math.max(...data.map(d => Math.abs(d.balanceHours)), 3);

  const totalSavedHours = data
    .filter(d => d.balanceHours > 0)
    .reduce((acc, curr) => acc + curr.balanceHours, 0);

  const totalExceededHours = data
    .filter(d => d.balanceHours < 0)
    .reduce((acc, curr) => acc + Math.abs(curr.balanceHours), 0);

  return (
    <div className="bg-neutral-900/70 border border-neutral-800 rounded-xl p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div>
          <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
            <Scale className="w-4 h-4 text-amber-400" />
            <span>Banco de Horas & Balanço de Produtividade</span>
          </h3>
          <p className="text-xs text-neutral-400">
            Horas poupadas (sobrando) vs. horas excedidas (faltando) em relação ao orçado
          </p>
        </div>

        {/* Quick balance summary */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] text-neutral-400 block">Saldo Líquido</span>
            <span
              className={`text-sm font-bold font-mono tabular-nums ${
                totalBalanceHours >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {totalBalanceHours >= 0 ? `+${formatHours(totalBalanceHours)}` : `-${formatHours(Math.abs(totalBalanceHours))}`}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Stat strip */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20">
          <div className="flex items-center justify-between text-xs text-emerald-400 mb-1">
            <span className="flex items-center gap-1 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              Horas Sobrando
            </span>
            <span className="font-mono tabular-nums font-bold">+{formatHours(totalSavedHours)}</span>
          </div>
          <p className="text-[11px] text-neutral-400">
            Tempo economizado antes do limite orçado (ganho de margem)
          </p>
        </div>

        <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/20">
          <div className="flex items-center justify-between text-xs text-rose-400 mb-1">
            <span className="flex items-center gap-1 font-medium">
              <ArrowDownRight className="w-3.5 h-3.5" />
              Horas Faltando (Estouro)
            </span>
            <span className="font-mono tabular-nums font-bold">-{formatHours(totalExceededHours)}</span>
          </div>
          <p className="text-[11px] text-neutral-400">
            Tempo gasto além da estimativa faturada para o cliente
          </p>
        </div>
      </div>

      {/* Diverging balance bar chart per collaborator */}
      <div className="space-y-3">
        {data.map(item => {
          const isPositive = item.balanceHours >= 0;
          const absVal = Math.abs(item.balanceHours);
          const barWidth = Math.min(100, (absVal / maxAbsBalance) * 100);

          return (
            <div key={item.mechanic.id} className="text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-neutral-200">{item.mechanic.name}</span>
                <div className="flex items-center gap-2 font-mono tabular-nums">
                  <span
                    className={`font-semibold ${
                      isPositive ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isPositive ? `+${formatHours(item.balanceHours)}` : `-${formatHours(Math.abs(item.balanceHours))}`}
                  </span>
                  <span className="text-neutral-500 text-[11px]">
                    ({item.financialBalance >= 0 ? `+R$ ${item.financialBalance}` : `-R$ ${Math.abs(item.financialBalance)}`})
                  </span>
                </div>
              </div>

              {/* Diverging center-aligned bar */}
              <div className="grid grid-cols-2 gap-1 bg-neutral-950/50 p-1 rounded-md h-6 items-center">
                {/* Left side: Negative / Estouradas */}
                <div className="flex justify-end h-3">
                  {!isPositive && (
                    <div
                      className="bg-rose-500/80 rounded-l h-full transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  )}
                </div>

                {/* Right side: Positive / Sobrando */}
                <div className="flex justify-start h-3">
                  {isPositive && (
                    <div
                      className="bg-emerald-500/80 rounded-r h-full transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
        <span>Impacto financeiro aproximado no mês:</span>
        <span
          className={`font-mono font-bold tabular-nums ${
            totalGainLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {totalGainLoss >= 0 ? `+ R$ ${totalGainLoss.toFixed(2)}` : `- R$ ${Math.abs(totalGainLoss).toFixed(2)}`}
        </span>
      </div>
    </div>
  );
};
