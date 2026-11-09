import React, { useState } from 'react';
import { 
  UserPlus, 
  Edit, 
  Trash2, 
  Wrench, 
  Package, 
  Briefcase, 
  Headphones, 
  ShieldCheck, 
  Users, 
  Filter,
  CheckCircle2
} from 'lucide-react';
import { Mechanic, MechanicProductivity, Department } from '../types';
import { formatHours, formatHoursWithSign } from '../utils/format';
import { MechanicModal, DEPARTMENTS } from './MechanicModal';

interface MechanicsViewProps {
  mechanics: Mechanic[];
  productivity: MechanicProductivity[];
  onAddMechanic: (data: any) => void;
  onUpdateMechanic: (mech: Mechanic) => void;
  onDeleteMechanic: (id: string) => void;
  onViewCollaboratorReport: (mechanicId: string) => void;
}

const DEPARTMENT_BADGES: Record<Department, { label: string; icon: any; color: string; bg: string }> = {
  mecanica: {
    label: 'Mecânica / Oficina',
    icon: Wrench,
    color: 'text-amber-400 border-amber-500/30',
    bg: 'bg-amber-500/10',
  },
  pecas: {
    label: 'Peças & Estoque',
    icon: Package,
    color: 'text-cyan-400 border-cyan-500/30',
    bg: 'bg-cyan-500/10',
  },
  administrativo: {
    label: 'Administrativo & Financeiro',
    icon: Briefcase,
    color: 'text-indigo-400 border-indigo-500/30',
    bg: 'bg-indigo-500/10',
  },
  atendimento: {
    label: 'Atendimento & Recepção',
    icon: Headphones,
    color: 'text-emerald-400 border-emerald-500/30',
    bg: 'bg-emerald-500/10',
  },
  gerencia: {
    label: 'Gerência & Supervisão',
    icon: ShieldCheck,
    color: 'text-purple-400 border-purple-500/30',
    bg: 'bg-purple-500/10',
  },
};

export const MechanicsView: React.FC<MechanicsViewProps> = ({
  mechanics,
  productivity,
  onAddMechanic,
  onUpdateMechanic,
  onDeleteMechanic,
  onViewCollaboratorReport,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMechanic, setEditingMechanic] = useState<Mechanic | null>(null);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleOpenAdd = () => {
    setEditingMechanic(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (mech: Mechanic) => {
    setEditingMechanic(mech);
    setIsModalOpen(true);
  };

  // Filtered staff
  const filteredStaff = mechanics.filter(m => {
    const dept = m.department || 'mecanica';
    if (selectedDeptFilter !== 'all' && dept !== selectedDeptFilter) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = m.name.toLowerCase().includes(term);
      const matchSpec = m.specialty.toLowerCase().includes(term);
      const matchRole = (m.role || '').toLowerCase().includes(term);
      return matchName || matchSpec || matchRole;
    }
    return true;
  });

  // Department counts
  const deptCounts = mechanics.reduce((acc, m) => {
    const dept = m.department || 'mecanica';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <span>Equipe & Colaboradores</span>
          </h2>
          <p className="text-xs text-neutral-400">
            Cadastro de colaboradores da oficina mecânica, setor de peças, administrativo e recepção
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Cadastrar Colaborador</span>
        </button>
      </div>

      {/* Sector / Department Filter Pills & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-medium">
          <button
            onClick={() => setSelectedDeptFilter('all')}
            className={`px-3 py-1.5 rounded-lg border transition whitespace-nowrap shrink-0 ${
              selectedDeptFilter === 'all'
                ? 'bg-neutral-800 text-white border-neutral-600 font-semibold'
                : 'bg-neutral-950/60 text-neutral-400 border-neutral-800 hover:text-neutral-200'
            }`}
          >
            Todos os Setores ({mechanics.length})
          </button>

          {DEPARTMENTS.map(dept => {
            const count = deptCounts[dept.id] || 0;
            const isSelected = selectedDeptFilter === dept.id;
            const Icon = dept.icon;
            return (
              <button
                key={dept.id}
                onClick={() => setSelectedDeptFilter(dept.id)}
                className={`px-3 py-1.5 rounded-lg border transition whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-neutral-800 text-white border-neutral-600 font-semibold'
                    : 'bg-neutral-950/60 text-neutral-400 border-neutral-800 hover:text-neutral-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{dept.label}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-800 text-neutral-400 font-mono">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative shrink-0">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, função ou especialidade..."
            className="w-full md:w-64 bg-neutral-950 border border-neutral-800 rounded-lg pl-3 pr-8 py-1.5 text-xs text-neutral-100 focus:outline-none focus:border-amber-500 placeholder-neutral-500"
          />
        </div>
      </div>

      {/* Grid of Team Members */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {filteredStaff.map(mech => {
          const dept = mech.department || 'mecanica';
          const badge = DEPARTMENT_BADGES[dept] || DEPARTMENT_BADGES.mecanica;
          const BadgeIcon = badge.icon;
          const isMechanicDept = dept === 'mecanica';

          const prod = productivity.find(p => p.mechanic.id === mech.id);
          const hasWorkOrders = (prod?.totalBudgetedHours || 0) > 0 || (prod?.totalExecutedHours || 0) > 0;
          const isAhead = (prod?.balanceHours || 0) >= 0;

          return (
            <div
              key={mech.id}
              className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between hover:border-neutral-700 transition"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl ${mech.avatarColor} text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0`}
                    >
                      {mech.name.split(' ').map(n => n[0]).join('')}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-neutral-100">{mech.name}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${badge.bg} ${badge.color}`}>
                          <BadgeIcon className="w-3 h-3" />
                          <span>{badge.label}</span>
                        </span>
                      </div>

                      {mech.role && (
                        <p className="text-xs text-amber-300 font-medium mt-0.5">{mech.role}</p>
                      )}
                      <p className="text-xs text-neutral-300 mt-0.5">{mech.specialty}</p>

                      <p className="text-[11px] text-neutral-500 mt-1">
                        {mech.phone || 'Sem telefone'} {mech.email ? `· ${mech.email}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(mech)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition"
                      title="Editar colaborador"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Deseja remover o colaborador ${mech.name}?`)) {
                          onDeleteMechanic(mech.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition"
                      title="Remover colaborador"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* KPI mini-cards (Orçado vs Executado for Mechanics or Hours summary) */}
                {isMechanicDept || hasWorkOrders ? (
                  <div className="grid grid-cols-3 gap-2 p-3 bg-neutral-950/70 rounded-lg border border-neutral-800/80 text-xs font-mono mb-4">
                    <div>
                      <span className="text-[10px] text-neutral-500 block font-sans">Orçado / Exec.</span>
                      <span className="text-neutral-200 font-semibold tabular-nums">
                        {formatHours(prod?.totalBudgetedHours || 0)} / {formatHours(prod?.totalExecutedHours || 0)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-neutral-500 block font-sans">Banco de Horas</span>
                      <span className={`font-bold tabular-nums ${isAhead ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {formatHoursWithSign(prod?.balanceHours || 0)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-neutral-500 block font-sans">Eficiência</span>
                      <span className={`font-bold tabular-nums ${(prod?.efficiency || 0) >= 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {prod?.efficiency}%
                      </span>
                      {(prod?.completedCount || 0) > 0 && (
                        <span className="text-[9px] text-neutral-500 block font-sans">
                          {prod?.completedEfficiency}% concl.
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-neutral-950/40 rounded-lg border border-neutral-800/80 text-xs mb-4 flex items-center justify-between text-neutral-400">
                    <span className="text-[11px]">Setor de apoio e suporte operacional</span>
                    <span className="text-emerald-400 font-medium text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Ativo
                    </span>
                  </div>
                )}

                {/* Additional Info */}
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  {isMechanicDept ? (
                    <>
                      <span>Custo HH: <strong className="text-neutral-200 font-mono">R$ {mech.hourlyCost}/h</strong></span>
                      <span>Meta: <strong className="text-neutral-200 font-mono">{mech.targetEfficiency}%</strong></span>
                    </>
                  ) : (
                    <span>Setor: <strong className="text-neutral-200">{badge.label}</strong></span>
                  )}
                  <span>Admissão: <strong className="text-neutral-200 font-mono">{new Date(mech.admissionDate).toLocaleDateString('pt-BR')}</strong></span>
                </div>
              </div>

              {/* Action: Open Report if has work orders or is mechanic */}
              {(isMechanicDept || hasWorkOrders) && (
                <div className="mt-4 pt-3 border-t border-neutral-800/80 flex justify-end">
                  <button
                    onClick={() => onViewCollaboratorReport(mech.id)}
                    className="text-xs text-amber-400 hover:text-amber-300 font-medium transition cursor-pointer"
                  >
                    Ver Relatório Completo deste Colaborador →
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {filteredStaff.length === 0 && (
          <div className="col-span-full py-12 text-center bg-neutral-900/40 border border-neutral-800 rounded-xl text-neutral-400">
            <Users className="w-8 h-8 mx-auto mb-2 text-neutral-500" />
            <p className="text-sm font-medium">Nenhum colaborador encontrado com os filtros atuais.</p>
            <button
              onClick={() => { setSelectedDeptFilter('all'); setSearchTerm(''); }}
              className="mt-2 text-xs text-amber-400 hover:underline"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      <MechanicModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={data => {
          if (editingMechanic) {
            onUpdateMechanic(data);
          } else {
            onAddMechanic(data);
          }
        }}
        mechanicToEdit={editingMechanic}
      />

    </div>
  );
};
