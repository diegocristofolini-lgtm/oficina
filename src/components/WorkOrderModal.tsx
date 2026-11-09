import React, { useState, useEffect } from 'react';
import { X, Clock, Car, User, FileText, Wrench } from 'lucide-react';
import { WorkOrder, Mechanic, ServiceCategory, OSStatus, Priority } from '../types';
import { formatHours } from '../utils/format';

interface WorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  orderToEdit?: WorkOrder | null;
  mechanics: Mechanic[];
}

const CATEGORIES: ServiceCategory[] = [
  'Motor',
  'Câmbio & Transmissão',
  'Freios & ABS',
  'Suspensão & Direção',
  'Injeção Eletrônica',
  'Elétrica & Bateria',
  'Ar Condicionado',
  'Revisão Preventiva',
];

export const WorkOrderModal: React.FC<WorkOrderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  orderToEdit,
  mechanics,
}) => {
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    vehicleModel: '',
    vehiclePlate: '',
    vehicleYear: '',
    serviceDescription: '',
    category: 'Motor' as ServiceCategory,
    mechanicId: mechanics[0]?.id || '',
    budgetedHours: 3.0,
    executedHours: 0.0,
    status: 'in_progress' as OSStatus,
    priority: 'normal' as Priority,
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (orderToEdit) {
      setFormData({
        clientName: orderToEdit.clientName,
        clientPhone: orderToEdit.clientPhone,
        vehicleModel: orderToEdit.vehicleModel,
        vehiclePlate: orderToEdit.vehiclePlate,
        vehicleYear: orderToEdit.vehicleYear || '',
        serviceDescription: orderToEdit.serviceDescription,
        category: orderToEdit.category,
        mechanicId: orderToEdit.mechanicId,
        budgetedHours: orderToEdit.budgetedHours,
        executedHours: orderToEdit.executedHours,
        status: orderToEdit.status,
        priority: orderToEdit.priority,
        notes: orderToEdit.notes || '',
      });
    } else {
      setFormData({
        clientName: '',
        clientPhone: '',
        vehicleModel: '',
        vehiclePlate: '',
        vehicleYear: new Date().getFullYear().toString(),
        serviceDescription: '',
        category: 'Motor',
        mechanicId: mechanics[0]?.id || '',
        budgetedHours: 3.0,
        executedHours: 0.0,
        status: 'in_progress',
        priority: 'normal',
        notes: '',
      });
    }
    setErrors({});
  }, [orderToEdit, isOpen, mechanics]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.clientName.trim()) newErrors.clientName = 'Nome do cliente é obrigatório';
    if (!formData.vehicleModel.trim()) newErrors.vehicleModel = 'Modelo do veículo é obrigatório';
    if (!formData.vehiclePlate.trim()) newErrors.vehiclePlate = 'Placa é obrigatória';
    if (!formData.serviceDescription.trim()) newErrors.serviceDescription = 'Descrição do serviço é obrigatória';
    if (!formData.mechanicId) newErrors.mechanicId = 'Selecione o mecânico responsável';
    if (isNaN(formData.budgetedHours) || formData.budgetedHours < 0.01) {
      newErrors.budgetedHours = 'Horas orçadas devem ser de no mínimo 0.01 horas (aprox. 36 segundos)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (orderToEdit) {
      onSave({
        ...orderToEdit,
        ...formData,
        budgetedHours: Number(formData.budgetedHours),
        executedHours: Number(formData.executedHours),
      });
    } else {
      onSave({
        ...formData,
        budgetedHours: Number(formData.budgetedHours),
        executedHours: Number(formData.executedHours),
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-6 text-neutral-100 my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-5">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-semibold">
              {orderToEdit ? `Editar Ordem de Serviço ${orderToEdit.code}` : 'Nova Ordem de Serviço (OS)'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Section: Cliente & Veículo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Nome do Cliente *
              </label>
              <input
                type="text"
                value={formData.clientName}
                onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                placeholder="Ex: Carlos Drummond"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
              />
              {errors.clientName && <p className="text-xs text-rose-400 mt-1">{errors.clientName}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Telefone / WhatsApp
              </label>
              <input
                type="text"
                value={formData.clientPhone}
                onChange={e => setFormData({ ...formData, clientPhone: e.target.value })}
                placeholder="(11) 99999-8888"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Veículo (Marca / Modelo) *
              </label>
              <input
                type="text"
                value={formData.vehicleModel}
                onChange={e => setFormData({ ...formData, vehicleModel: e.target.value })}
                placeholder="Ex: Toyota Corolla 2.0 XEi"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
              />
              {errors.vehicleModel && <p className="text-xs text-rose-400 mt-1">{errors.vehicleModel}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Placa do Veículo *
              </label>
              <input
                type="text"
                value={formData.vehiclePlate}
                onChange={e => setFormData({ ...formData, vehiclePlate: e.target.value.toUpperCase() })}
                placeholder="ABC-1D23"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 font-mono focus:outline-none focus:border-amber-500"
              />
              {errors.vehiclePlate && <p className="text-xs text-rose-400 mt-1">{errors.vehiclePlate}</p>}
            </div>
          </div>

          {/* Section: Serviço & Categoria */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Descrição do Serviço Solicitado *
            </label>
            <textarea
              rows={2}
              value={formData.serviceDescription}
              onChange={e => setFormData({ ...formData, serviceDescription: e.target.value })}
              placeholder="Ex: Troca de correia dentada, bomba d'água e tensor de correia..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
            />
            {errors.serviceDescription && (
              <p className="text-xs text-rose-400 mt-1">{errors.serviceDescription}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Categoria do Serviço
              </label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as ServiceCategory })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Responsável Técnico pela OS *
              </label>
              <select
                value={formData.mechanicId}
                onChange={e => setFormData({ ...formData, mechanicId: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
              >
                {mechanics.map(mech => {
                  const deptLabel = mech.department === 'pecas' ? 'Peças' 
                    : mech.department === 'administrativo' ? 'Adm' 
                    : mech.department === 'atendimento' ? 'Atendimento'
                    : mech.department === 'gerencia' ? 'Gerência'
                    : 'Mecânica';
                  return (
                    <option key={mech.id} value={mech.id}>
                      {mech.name} · [{deptLabel}] {mech.role ? `(${mech.role})` : `(${mech.specialty})`}
                    </option>
                  );
                })}
              </select>
              {errors.mechanicId && <p className="text-xs text-rose-400 mt-1">{errors.mechanicId}</p>}
            </div>
          </div>

          {/* Section: Controle de Horas (O Ponto Central) */}
          <div className="p-3.5 rounded-lg bg-neutral-950/60 border border-amber-500/20">
            <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Controle de Tempo: Orçado vs. Executado
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Horas Orçadas (Mínimo 0.01h / 0:01) *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.budgetedHours === 0 ? '' : formData.budgetedHours}
                    onChange={e => {
                      const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                      setFormData({ ...formData, budgetedHours: isNaN(val) ? 0 : val });
                    }}
                    placeholder="0.01"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm font-mono text-neutral-100 focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-xs font-mono font-semibold px-2.5 py-1.5 rounded-lg bg-neutral-800 text-amber-300 shrink-0 border border-neutral-700">
                    = {formatHours(formData.budgetedHours)}
                  </span>
                </div>
                {errors.budgetedHours && (
                  <p className="text-xs text-rose-400 mt-1">{errors.budgetedHours}</p>
                )}
                <p className="text-[11px] text-neutral-500 mt-1">
                  Mínimo aceito: 0.01h (~36 seg). Exemplos: 0:15 (0.25), 0:30 (0.5), 1:30 (1.5).
                </p>
                {/* Quick hour selector buttons */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[0.01, 0.25, 0.5, 1.0, 2.0, 3.0, 4.5].map(h => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setFormData({ ...formData, budgetedHours: h })}
                      className={`px-2 py-1 text-[11px] font-mono rounded border transition ${
                        formData.budgetedHours === h
                          ? 'bg-amber-400 text-neutral-950 border-amber-400 font-bold'
                          : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
                      }`}
                    >
                      {formatHours(h)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Horas Já Executadas (Apontamento)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.executedHours === 0 ? '' : formData.executedHours}
                    onChange={e => {
                      const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                      setFormData({ ...formData, executedHours: isNaN(val) ? 0 : val });
                    }}
                    placeholder="0.00"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm font-mono text-neutral-100 focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-xs font-mono font-semibold px-2.5 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 shrink-0 border border-neutral-700">
                    = {formatHours(formData.executedHours)}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Pode ser atualizado via cronômetro de bancada ou manualmente.
                </p>
              </div>
            </div>

            {/* Live forecast calculation */}
            {formData.budgetedHours > 0 && (
              <div className="mt-3 pt-2.5 border-t border-neutral-800 flex items-center justify-between text-xs">
                <span className="text-neutral-400">Saldo Previsto do Banco de Horas:</span>
                <span
                  className={`font-mono font-semibold ${
                    formData.budgetedHours - formData.executedHours >= 0
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  }`}
                >
                  {formatHours(Math.abs(formData.budgetedHours - formData.executedHours))}{' '}
                  {formData.budgetedHours - formData.executedHours >= 0 ? '(Sobrando)' : '(Estourado)'}
                </span>
              </div>
            )}
          </div>

          {/* Section: Status e Prioridade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Status da OS
              </label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as OSStatus })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
              >
                <option value="not_started">Não Iniciado</option>
                <option value="in_progress">Em Andamento</option>
                <option value="paused">Pausado (Aguardando peça)</option>
                <option value="completed">Concluído</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Prioridade
              </label>
              <select
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value as Priority })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
              >
                <option value="normal">Normal</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Observações Técnicas / Diagnóstico Adicional
            </label>
            <input
              type="text"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Ex: Peça encomendada na concessionária, previsão de entrega amanhã..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-neutral-200 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition"
            >
              {orderToEdit ? 'Salvar Alterações' : 'Criar Ordem de Serviço'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
