import React from 'react';
import { Target } from 'lucide-react';
import { formatHours, formatHoursWithSign } from '../../utils/format';

interface CategoryStat {
  category: string;
  budgeted: number;
  executed: number;
  balance: number;
  efficiency: number;
  count: number;
}

interface CategoryEfficiencyChartProps {
  data: CategoryStat[];
}

export const CategoryEfficiencyChart: React.FC<CategoryEfficiencyChartProps> = ({ data }) => {
  return (
    <div className="bg-neutral-900/70 border border-neutral-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-400" />
            <span>Assertividade de Orçamento por Categoria</span>
          </h3>
          <p className="text-xs text-neutral-400">
            Identifique quais tipos de serviços costumam exceder ou sobrar horas
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {data.map(item => {
          const isEfficient = item.balance >= 0;
          return (
            <div key={item.category} className="p-2.5 rounded-lg bg-neutral-950/40 border border-neutral-800/80">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-neutral-200">
                  {item.category}
                  <span className="text-neutral-500 font-normal ml-1.5">({item.count} OS)</span>
                </span>
                <div className="flex items-center gap-2 font-mono tabular-nums">
                  <span className="text-neutral-400">Orç: {formatHours(item.budgeted)} / Exec: {formatHours(item.executed)}</span>
                  <span className="text-neutral-600">·</span>
                  <span className={`font-semibold ${isEfficient ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatHoursWithSign(item.balance)}
                  </span>
                </div>
              </div>

              {/* Progress bar comparison */}
              <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden flex">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    item.efficiency >= 100 ? 'bg-emerald-500' : item.efficiency >= 85 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, item.efficiency)}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[10px] text-neutral-500 mt-1 font-mono">
                <span>Eficiência média: <strong className="text-neutral-300">{item.efficiency}%</strong></span>
                <span>
                  {item.balance >= 0 ? 'Dentro do orçamento' : 'Risco: Estouro frequente'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
