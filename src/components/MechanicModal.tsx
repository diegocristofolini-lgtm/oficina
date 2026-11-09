import React, { useState, useEffect } from 'react';
import { X, UserPlus, Wrench, Package, Briefcase, Headphones, ShieldCheck } from 'lucide-react';
import { Mechanic, Department } from '../types';

interface MechanicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  mechanicToEdit?: Mechanic | null;
}

export const DEPARTMENTS: { id: Department; label: string; icon: any; placeholderSpecialty: string; placeholderRole: string }[] = [
  {
    id: 'mecanica',
    label: 'Oficina / Mecânica',
    icon: Wrench,
    placeholderSpecialty: 'Ex: Motor, Câmbio, Suspensão, Diagnóstico Elétrico...',
    placeholderRole: 'Ex: Mecânico Sênior, Eletricista Automotivo, Alinhador...',
  },
  {
    id: 'pecas',
    label: 'Setor de Peças & Estoque',
    icon: Package,
    placeholderSpecialty: 'Ex: Gestão de Almoxarifado, Cotação de Fornecedores, Auto Peças...',
    placeholderRole: 'Ex: Balconista de Peças, Estoquista, Comprador...',
  },
  {
    id: 'administrativo',
    label: 'Administrativo & Financeiro',
    icon: Briefcase,
    placeholderSpecialty: 'Ex: Faturamento, Contas a Pagar/Receber, Emissão de NF-e...',
    placeholderRole: 'Ex: Analista Financeiro, Auxiliar Administrativo, Faturista...',
  },
  {
    id: 'atendimento',
    label: 'Atendimento & Recepção',
    icon: Headphones,
    placeholderSpecialty: 'Ex: Abertura de OS, Orçamentos, Contato com Clientes...',
    placeholderRole: 'Ex: Consultor Técnico, Recepcionista, Atendente...',
  },
  {
    id: 'gerencia',
    label: 'Gerência & Supervisão',
    icon: ShieldCheck,
    placeholderSpecialty: 'Ex: Gestão de Oficina, Metas de Produtividade, Qualidade...',
    placeholderRole: 'Ex: Gerente Geral, Chefe de Oficina, Supervisor...',
  },
];

const AVATAR_COLORS = [
  'bg-blue-600',
  'bg-amber-600',
  'bg-emerald-600',
  'bg-purple-600',
  'bg-rose-600',
  'bg-cyan-600',
  'bg-indigo-600',
  'bg-teal-600',
];

export const MechanicModal: React.FC<MechanicModalProps> = ({
  isOpen,
  onClose,
  onSave,
  mechanicToEdit,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    department: 'mecanica' as Department,
    role: '',
    specialty: 'Motor & Câmbio',
    phone: '',
    email: '',
    hourlyCost: 90,
    targetEfficiency: 100,
    avatarColor: 'bg-blue-600',
    admissionDate: new Date().toISOString().split('T')[0],
    active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mechanicToEdit) {
      setFormData({
        name: mechanicToEdit.name,
        department: mechanicToEdit.department || 'mecanica',
        role: mechanicToEdit.role || '',
        specialty: mechanicToEdit.specialty,
        phone: mechanicToEdit.phone || '',
        email: mechanicToEdit.email || '',
        hourlyCost: mechanicToEdit.hourlyCost,
        targetEfficiency: mechanicToEdit.targetEfficiency,
        avatarColor: mechanicToEdit.avatarColor,
        admissionDate: mechanicToEdit.admissionDate,
        active: mechanicToEdit.active,
      });
    } else {
      setFormData({
        name: '',
        department: 'mecanica',
        role: '',
        specialty: 'Motor & Câmbio',
        phone: '',
        email: '',
        hourlyCost: 90,
        targetEfficiency: 100,
        avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
        admissionDate: new Date().toISOString().split('T')[0],
        active: true,
      });
    }
    setErrors({});
  }, [mechanicToEdit, isOpen]);

  if (!isOpen) return null;

  const currentDeptConfig = DEPARTMENTS.find(d => d.id === formData.department) || DEPARTMENTS[0];

  const handleDepartmentChange = (dept: Department) => {
    let defaultSpecialty = formData.specialty;
    let defaultCost = dept === 'mecanica' ? (formData.hourlyCost || 90) : 0;

    if (!mechanicToEdit) {
      if (dept === 'pecas') {
        defaultSpecialty = 'Controle de Estoque & Balcão de Peças';
      } else if (dept === 'administrativo') {
        defaultSpecialty = 'Financeiro & Faturamento';
      } else if (dept === 'atendimento') {
        defaultSpecialty = 'Recepção Técnica & Atendimento ao Cliente';
      } else if (dept === 'gerencia') {
        defaultSpecialty = 'Gestão Geral de Operações';
      } else {
        defaultSpecialty = 'Motor & Mecânica Geral';
        defaultCost = 90;
      }
    }

    setFormData(prev => ({
      ...prev,
      department: dept,
      specialty: defaultSpecialty,
      hourlyCost: defaultCost,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrors({ name: 'Nome do colaborador é obrigatório' });
      return;
    }

    const isMechanic = formData.department === 'mecanica';
    const payload = {
      ...(mechanicToEdit || {}),
      ...formData,
      department: formData.department,
      role: formData.role.trim() || undefined,
      hourlyCost: isMechanic ? Number(formData.hourlyCost) : 0,
      targetEfficiency: isMechanic ? Number(formData.targetEfficiency) : 100,
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 text-neutral-100 max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3.5 border-b border-neutral-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-100">
                {mechanicToEdit ? `Editar Colaborador: ${mechanicToEdit.name}` : 'Cadastrar Novo Usuário / Colaborador'}
              </h2>
              <p className="text-xs text-neutral-400">
                Oficina mecânica, estoque de peças, setor administrativo ou atendimento
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Department Selection Tabs */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5 uppercase tracking-wider">
              Setor / Departamento *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DEPARTMENTS.map(dept => {
                const Icon = dept.icon;
                const isSelected = formData.department === dept.id;
                return (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => handleDepartmentChange(dept.id)}
                    className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                      isSelected
                        ? 'bg-amber-400/10 border-amber-400 text-amber-300 shadow-sm font-semibold'
                        : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-amber-400' : 'text-neutral-500'}`} />
                    <span className="text-xs leading-tight truncate">{dept.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nome Completo */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Nome Completo *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Carlos Silva ou Roberto Peças"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
            />
            {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name}</p>}
          </div>

          {/* Cargo & Especialidade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Cargo / Função
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                placeholder={currentDeptConfig.placeholderRole}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Especialidade / Responsabilidade
              </label>
              <input
                type="text"
                value={formData.specialty}
                onChange={e => setFormData({ ...formData, specialty: e.target.value })}
                placeholder={currentDeptConfig.placeholderSpecialty}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Custo Homem/Hora e Meta de Eficiência (Custo HH restrito exclusivamente a Oficina/Mecânica) */}
          {formData.department === 'mecanica' ? (
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-neutral-950/70 border border-amber-500/20">
              <div>
                <label className="block text-xs font-medium text-amber-300 mb-1">
                  Custo Homem/Hora (R$/h) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.hourlyCost}
                  onChange={e => setFormData({ ...formData, hourlyCost: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm font-mono text-neutral-100 focus:outline-none focus:border-amber-500"
                />
                <p className="text-[10px] text-neutral-400 mt-0.5">Base de cálculo do Banco de Horas da oficina</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Meta de Eficiência (%)
                </label>
                <input
                  type="number"
                  min="50"
                  max="200"
                  value={formData.targetEfficiency}
                  onChange={e => setFormData({ ...formData, targetEfficiency: parseFloat(e.target.value) || 100 })}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm font-mono text-neutral-100 focus:outline-none focus:border-amber-500"
                />
                <p className="text-[10px] text-neutral-400 mt-0.5">Padrão da oficina: 100%</p>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-neutral-950/40 border border-neutral-800 text-xs text-neutral-400 flex items-center justify-between">
              <div>
                <span className="font-semibold text-neutral-300 block mb-0.5">Setor de Suporte / Operacional</span>
                <span className="text-[11px] text-neutral-500">
                  Custo homem/hora e cronômetro de bancada são aplicados exclusivamente aos serviços da <strong>Oficina / Mecânica</strong>.
                </span>
              </div>
              <span className="text-emerald-400 font-mono text-[11px] px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 font-semibold shrink-0 ml-2">
                Sem Custo HH
              </span>
            </div>
          )}

          {/* Telefone e Data de Admissão */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Telefone / WhatsApp
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(11) 98888-7777"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Data de Admissão
              </label>
              <input
                type="date"
                value={formData.admissionDate}
                onChange={e => setFormData({ ...formData, admissionDate: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm font-mono text-neutral-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* E-mail */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              E-mail de Contato (opcional)
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              placeholder="colaborador@oficina.com.br"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
            />
          </div>

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
              {mechanicToEdit ? 'Atualizar Colaborador' : 'Cadastrar Colaborador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
