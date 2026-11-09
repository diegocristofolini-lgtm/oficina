import React from 'react';
import { AlertTriangle, Clock, ChevronRight, CheckCircle2 } from 'lucide-react';
import { WorkOrder, Mechanic } from '../types';
import { formatHours } from '../utils/format';

interface ExceededAlertBannerProps {
  orders: WorkOrder[];
  mechanics: Mechanic[];
  onSelectOrder: (order: WorkOrder) => void;
}

export const ExceededAlertBanner: React.FC<ExceededAlertBannerProps> = ({
  orders,
  mechanics,
  onSelectOrder,
}) => {
  if (orders.length === 0) return null;

  return (
    <div className="bg-rose-950/40 border border-rose-500/30 rounded-xl p-4 mb-6 backdrop-blur-sm shadow-lg shadow-rose-950/20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-rose-200">
              Alerta de Tempo Esgotado ({orders.length} {orders.length === 1 ? 'serviço estourou' : 'serviços estouraram'} o orçado)
            </h3>
            <p className="text-xs text-rose-300/80">
              Serviços em andamento ultrapassaram a estimativa de horas orçadas. Ação recomendada para evitar perda de margem.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {orders.map(order => {
          const mechanic = mechanics.find(m => m.id === order.mechanicId);
          const diff = Number((order.executedHours - order.budgetedHours).toFixed(2));
          const pct = Math.round((order.executedHours / order.budgetedHours) * 100);

          return (
            <div
              key={order.id}
              onClick={() => onSelectOrder(order)}
              className="bg-neutral-900/90 border border-rose-500/30 rounded-lg p-3 hover:border-rose-400 transition cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono text-neutral-400">{order.code}</span>
                  <span className="font-medium text-rose-400 tabular-nums">+{formatHours(diff)} acima ({pct}%)</span>
                </div>
                <div className="text-sm font-medium text-neutral-100 truncate mb-1">
                  {order.vehicleModel} · <span className="font-mono text-neutral-300">{order.vehiclePlate}</span>
                </div>
                <div className="text-xs text-neutral-400 line-clamp-1 mb-2">
                  {order.serviceDescription}
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                <span className="truncate">Resp: <strong className="text-neutral-200">{mechanic?.name || 'Mecânico'}</strong></span>
                <span className="flex items-center gap-1 text-rose-400 group-hover:text-rose-300 font-medium">
                  Ver OS <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
