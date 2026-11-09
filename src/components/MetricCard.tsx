import React from 'react';
import { LucideIcon, HelpCircle } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  icon?: LucideIcon;
  trend?: 'positive' | 'negative' | 'neutral';
  trendValue?: string;
  highlight?: boolean;
  onInfoClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  subtext,
  icon: Icon,
  trend,
  trendValue,
  highlight = false,
  onInfoClick,
}) => {
  return (
    <div
      className={`rounded-xl p-5 border transition-all ${
        highlight
          ? 'bg-neutral-900/90 border-amber-500/40 shadow-sm'
          : 'bg-neutral-900/70 border-neutral-800'
      }`}
    >
      <div className="flex items-center justify-between text-neutral-400 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium tracking-wide uppercase">{label}</span>
          {onInfoClick && (
            <button
              type="button"
              onClick={onInfoClick}
              className="text-neutral-500 hover:text-amber-400 p-0.5 rounded transition cursor-pointer"
              title="Entenda como funciona esse cálculo"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {Icon && (
          <div className="p-1.5 rounded-lg bg-neutral-800/80 text-neutral-300">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-neutral-100">
          {value}
        </span>
        {unit && <span className="text-sm font-medium text-neutral-400">{unit}</span>}
      </div>

      {(subtext || trendValue) && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-neutral-400">
          {trendValue && (
            <span
              className={`font-mono font-medium ${
                trend === 'positive'
                  ? 'text-emerald-400'
                  : trend === 'negative'
                  ? 'text-rose-400'
                  : 'text-neutral-300'
              }`}
            >
              {trendValue}
            </span>
          )}
          {trendValue && subtext && <span aria-hidden="true" className="text-neutral-600">·</span>}
          {subtext && <span className="truncate">{subtext}</span>}
        </div>
      )}
    </div>
  );
};
