import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { WorkOrder } from '../types';

interface DeleteOrderModalProps {
  isOpen: boolean;
  order: WorkOrder | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

export const DeleteOrderModal: React.FC<DeleteOrderModalProps> = ({
  isOpen,
  order,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-6 text-neutral-100">
        
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2.5 rounded-lg bg-rose-500/20 text-rose-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-neutral-100">Excluir Ordem de Serviço</h3>
            <p className="text-xs text-neutral-400 mt-1">
              Tem certeza que deseja excluir esta OS? Essa ação não pode ser desfeita.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order summary box */}
        <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-xs space-y-1 mb-5">
          <div className="flex items-center justify-between">
            <span className="font-mono font-bold text-neutral-300">{order.code}</span>
            <span className="font-mono text-amber-400 font-medium">{order.vehiclePlate}</span>
          </div>
          <div className="text-neutral-200 font-medium truncate">{order.vehicleModel}</div>
          <div className="text-neutral-400 truncate">Cliente: {order.clientName}</div>
          <div className="text-neutral-500 truncate">{order.serviceDescription}</div>
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
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
            <span>Sim, Excluir OS</span>
          </button>
        </div>

      </div>
    </div>
  );
};
