import React, { useState } from 'react';
import { MechanicProductivity } from '../../types';
import { formatHours } from '../../utils/format';

interface HoursComparisonChartProps {
  data: MechanicProductivity[];
}

export const HoursComparisonChart: React.FC<HoursComparisonChartProps> = ({ data }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const maxHours = Math.max(
    ...data.flatMap(d => [d.totalBudgetedHours, d.totalExecutedHours]),
    10
  );

  return (
    <div className="bg-neutral-900/70 border border-neutral-800 rounded-xl p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h3 className="text-sm font-semibold text-neutral-100">
            Comparativo: Horas Orçadas vs. Executadas
          </h3>
          <p className="text-xs text-neutral-400">
            Acompanhamento de volume de trabalho por colaborador
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-neutral-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-blue-500/80 inline-block" />
            <span>Horas Orçadas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-amber-500/90 inline-block" />
            <span>Horas Executadas</span>
          </div>
        </div>
      </div>

      {/* Chart container */}
      <div className="space-y-4">
        {data.map((item, idx) => {
          const budgetedPct = Math.min(100, (item.totalBudgetedHours / maxHours) * 100);
          const executedPct = Math.min(100, (item.totalExecutedHours / maxHours) * 100);
          const isHovered = hoveredIndex === idx;
          const isExceeded = item.totalExecutedHours > item.totalBudgetedHours;

          return (
            <div
              key={item.mechanic.id}
              className={`p-3 rounded-lg transition border ${
                isHovered ? 'bg-neutral-800/60 border-neutral-700' : 'bg-transparent border-transparent'
              }`}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-neutral-200">
                  {item.mechanic.name}
                  <span className="text-neutral-500 font-normal ml-2">· {item.mechanic.specialty}</span>
                </span>
                <div className="flex items-center gap-3 text-neutral-300 font-mono tabular-nums text-xs">
                  <span className="text-blue-400 font-medium">Orçado: {formatHours(item.totalBudgetedHours)}</span>
                  <span className="text-neutral-600">|</span>
                  <span className={`font-medium ${isExceeded ? 'text-rose-400' : 'text-emerald-400'}`}>
                    Executado: {formatHours(item.totalExecutedHours)}
                  </span>
                </div>
              </div>

              {/* Dual bar rows */}
              <div className="space-y-1.5">
                {/* Budgeted bar */}
                <div className="w-full bg-neutral-950/60 h-3 rounded overflow-hidden flex">
                  <div
                    className="bg-blue-500/80 h-full rounded transition-all duration-500"
                    style={{ width: `${budgetedPct}%` }}
                    title={`Orçado: ${formatHours(item.totalBudgetedHours)}`}
                  />
                </div>

                {/* Executed bar */}
                <div className="w-full bg-neutral-950/60 h-3 rounded overflow-hidden flex">
                  <div
                    className={`h-full rounded transition-all duration-500 ${
                      isExceeded ? 'bg-rose-500/90' : 'bg-amber-500/90'
                    }`}
                    style={{ width: `${executedPct}%` }}
                    title={`Executado: ${formatHours(item.totalExecutedHours)}`}
                  />
                </div>
              </div>

              {/* Status footer line */}
              <div className="flex items-center justify-between text-[11px] text-neutral-500 mt-1 font-mono">
                <span>Eficiência: <strong className="text-neutral-300">{item.efficiency}%</strong></span>
                <span>
                  Saldo:{' '}
                  <strong className={item.balanceHours >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {item.balanceHours >= 0 ? `+${formatHours(item.balanceHours)} (Sobrando)` : `-${formatHours(Math.abs(item.balanceHours))} (Estourado)`}
                  </strong>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
