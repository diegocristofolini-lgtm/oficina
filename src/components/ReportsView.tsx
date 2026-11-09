import React, { useState } from 'react';
import { 
  Printer, 
  Download, 
  FileSpreadsheet, 
  User, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  Scale,
  Award
} from 'lucide-react';
import { MechanicProductivity, WorkOrder, Mechanic } from '../types';
import { formatHours, formatHoursWithSign } from '../utils/format';

interface ReportsViewProps {
  productivity: MechanicProductivity[];
  workOrders: WorkOrder[];
  mechanics: Mechanic[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  productivity,
  workOrders,
  mechanics,
}) => {
  const [selectedMechanicId, setSelectedMechanicId] = useState<string>(
    productivity[0]?.mechanic.id || 'all'
  );

  const [dateFilter, setDateFilter] = useState<'all' | 'month' | 'week'>('all');

  const selectedProductivity = productivity.find(
    p => p.mechanic.id === selectedMechanicId
  );

  // Filter orders according to selection
  const reportOrders = workOrders.filter(o => {
    if (selectedMechanicId !== 'all' && o.mechanicId !== selectedMechanicId) {
      return false;
    }
    // Date filter logic (simplified for realistic sample periods)
    return true;
  });

  // Calculate totals for report scope
  const totalBudgeted = reportOrders.reduce((acc, o) => acc + o.budgetedHours, 0);
  const totalExecuted = reportOrders.reduce((acc, o) => acc + o.executedHours, 0);
  const netBalance = Number((totalBudgeted - totalExecuted).toFixed(1));

  const completedInReport = reportOrders.filter(o => o.status === 'completed');
  const inProgInReport = reportOrders.filter(o => o.status === 'in_progress');
  const earnedHours = completedInReport.reduce((acc, o) => acc + o.budgetedHours, 0) +
    inProgInReport.reduce((acc, o) => acc + Math.min(o.budgetedHours, o.executedHours), 0);
  const efficiency = totalExecuted > 0 ? Math.round((earnedHours / totalExecuted) * 100) : 100;

  // Handle Export to CSV
  const handleExportCSV = () => {
    const collaboratorName = selectedProductivity?.mechanic.name || 'Todos_Colaboradores';
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `relatorio_produtividade_${collaboratorName.toLowerCase().replace(/\s+/g, '_')}_${dateStr}.csv`;

    const headers = [
      'Código OS',
      'Data',
      'Cliente',
      'Veículo',
      'Placa',
      'Serviço',
      'Categoria',
      'Mecânico',
      'Horas Orçadas',
      'Horas Executadas',
      'Saldo (Horas Sobrando/Faltando)',
      'Status Orçamento',
      'Status OS',
    ];

    const rows = reportOrders.map(order => {
      const mech = mechanics.find(m => m.id === order.mechanicId);
      const delta = Number((order.budgetedHours - order.executedHours).toFixed(2));
      const deltaStatus = delta >= 0 ? `+${formatHours(delta)} Sobrando` : `${formatHours(Math.abs(delta))} Estourada`;

      return [
        `"${order.code}"`,
        `"${new Date(order.createdAt).toLocaleDateString('pt-BR')}"`,
        `"${order.clientName.replace(/"/g, '""')}"`,
        `"${order.vehicleModel.replace(/"/g, '""')}"`,
        `"${order.vehiclePlate}"`,
        `"${order.serviceDescription.replace(/"/g, '""')}"`,
        `"${order.category}"`,
        `"${mech?.name || ''}"`,
        `"${formatHours(order.budgetedHours)}"`,
        `"${formatHours(order.executedHours)}"`,
        `"${deltaStatus}"`,
        delta >= 0 ? '"Dentro do Prazo"' : '"Tempo Esgotado"',
        `"${order.status === 'completed' ? 'Concluída' : 'Em Andamento'}"`,
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Print / PDF
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Interactive Controls (Hidden during print) */}
      <div className="no-print bg-neutral-900/70 border border-neutral-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-100">Relatórios de Produtividade</h2>
          <p className="text-xs text-neutral-400">
            Gere relatórios detalhados individuais para cada mecânico ou consolidados da oficina
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Collaborator Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">Colaborador:</span>
            <select
              value={selectedMechanicId}
              onChange={e => setSelectedMechanicId(e.target.value)}
              className="bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-500 font-medium"
            >
              <option value="all">Equipe Completa (Consolidado)</option>
              {productivity.map(p => (
                <option key={p.mechanic.id} value={p.mechanic.id}>
                  {p.mechanic.name} {p.mechanic.department && p.mechanic.department !== 'mecanica' ? `[${p.mechanic.department === 'pecas' ? 'Peças' : p.mechanic.department === 'administrativo' ? 'Adm' : p.mechanic.department}]` : ''} · {p.mechanic.role || p.mechanic.specialty}
                </option>
              ))}
            </select>
          </div>

          {/* Export Buttons */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition"
            title="Baixar planilha compatível com Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 transition shadow-sm"
            title="Imprimir ou Salvar como PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Salvar PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Canvas */}
      <div className="print-bg-white bg-neutral-900 border border-neutral-800 rounded-xl p-6 sm:p-8 space-y-6">
        
        {/* Report Header for Print & Screen */}
        <div className="border-b border-neutral-800 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-bold tracking-tight text-neutral-100">
                OFICINAPRO · GESTÃO AUTOMOTIVA
              </span>
            </div>
            <h1 className="text-xl font-bold text-amber-400">
              Relatório de Produtividade & Banco de Horas
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Comparativo de Horas Orçadas vs. Horas Executadas por Colaborador
            </p>
          </div>

          <div className="text-xs text-neutral-400 font-mono text-left sm:text-right space-y-0.5">
            <div>Data de Emissão: <strong className="text-neutral-200">{new Date().toLocaleDateString('pt-BR')}</strong></div>
            <div>Hora: <strong className="text-neutral-200">{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</strong></div>
            <div>Escopo: <strong className="text-amber-400">{selectedProductivity ? selectedProductivity.mechanic.name : 'Equipe Completa'}</strong></div>
          </div>
        </div>

        {/* Selected Collaborator Dossier Card */}
        {selectedProductivity && (
          <div className="p-4 rounded-lg bg-neutral-950/60 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${selectedProductivity.mechanic.avatarColor} text-white flex items-center justify-center font-bold text-sm shrink-0`}>
                {selectedProductivity.mechanic.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-100">{selectedProductivity.mechanic.name}</h3>
                <p className="text-neutral-400">{selectedProductivity.mechanic.specialty} · Admissão: {new Date(selectedProductivity.mechanic.admissionDate).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono tabular-nums">
              <div>
                <span className="text-neutral-500 block text-[10px]">Custo Homem/Hora</span>
                <span className="text-neutral-200 font-bold">R$ {selectedProductivity.mechanic.hourlyCost}/h</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px]">Meta de Eficiência</span>
                <span className="text-amber-400 font-bold">{selectedProductivity.mechanic.targetEfficiency}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Executive KPI Summary for Report */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800">
            <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block mb-1">
              Horas Orçadas
            </span>
            <div className="text-2xl font-bold font-mono text-neutral-100 tabular-nums">
              {formatHours(totalBudgeted)}
            </div>
            <span className="text-[10px] text-neutral-500">Total previsto</span>
          </div>

          <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800">
            <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block mb-1">
              Horas Executadas
            </span>
            <div className="text-2xl font-bold font-mono text-neutral-100 tabular-nums">
              {formatHours(totalExecuted)}
            </div>
            <span className="text-[10px] text-neutral-500">Tempo real gasto</span>
          </div>

          <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800">
            <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block mb-1">
              Banco de Desempenho
            </span>
            <div
              className={`text-2xl font-bold font-mono tabular-nums ${
                netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatHoursWithSign(netBalance)}
            </div>
            <span className="text-[10px] text-neutral-500">
              {netBalance >= 0 ? 'Horas Sobrando (Economia)' : 'Horas Faltando (Estouro)'}
            </span>
          </div>

          <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800">
            <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block mb-1">
              Índice de Eficiência
            </span>
            <div
              className={`text-2xl font-bold font-mono tabular-nums ${
                efficiency >= 100 ? 'text-emerald-400' : efficiency >= 85 ? 'text-amber-400' : 'text-rose-400'
              }`}
            >
              {efficiency}%
            </div>
            <span className="text-[10px] text-neutral-500">
              {efficiency >= 100 ? 'Meta atingida' : 'Abaixo da meta'}
            </span>
          </div>

        </div>

        {/* Detailed Itemized Service Table */}
        <div>
          <h3 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider mb-3">
            Detalhamento das Ordens de Serviço Executadas
          </h3>

          <div className="overflow-x-auto border border-neutral-800 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950 text-neutral-400 border-b border-neutral-800 font-medium">
                <tr>
                  <th className="py-2.5 px-3">OS</th>
                  <th className="py-2.5 px-3">Veículo / Placa</th>
                  <th className="py-2.5 px-3">Serviço Realizado</th>
                  {selectedMechanicId === 'all' && <th className="py-2.5 px-3">Mecânico</th>}
                  <th className="py-2.5 px-3 text-right">Orçado</th>
                  <th className="py-2.5 px-3 text-right">Executado</th>
                  <th className="py-2.5 px-3 text-right">Saldo</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/80 font-mono">
                {reportOrders.map(order => {
                  const mech = mechanics.find(m => m.id === order.mechanicId);
                  const delta = Number((order.budgetedHours - order.executedHours).toFixed(1));
                  const isSaved = delta >= 0;

                  return (
                    <tr key={order.id} className="hover:bg-neutral-800/30 transition print-break-inside-avoid">
                      <td className="py-2.5 px-3 font-semibold text-neutral-200">
                        {order.code}
                      </td>

                      <td className="py-2.5 px-3 font-sans">
                        <div className="font-medium text-neutral-200">{order.vehicleModel}</div>
                        <div className="text-[11px] font-mono text-neutral-400">{order.vehiclePlate}</div>
                      </td>

                      <td className="py-2.5 px-3 font-sans text-neutral-300 max-w-xs truncate">
                        {order.serviceDescription}
                      </td>

                      {selectedMechanicId === 'all' && (
                        <td className="py-2.5 px-3 font-sans text-neutral-300">
                          {mech?.name || '-'}
                        </td>
                      )}

                      <td className="py-2.5 px-3 text-right tabular-nums text-neutral-300">
                        {formatHours(order.budgetedHours)}
                      </td>

                      <td className="py-2.5 px-3 text-right tabular-nums text-neutral-300 font-bold">
                        {formatHours(order.executedHours)}
                      </td>

                      <td className="py-2.5 px-3 text-right tabular-nums">
                        <span className={`font-bold ${isSaved ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isSaved ? `+${formatHours(delta)}` : `-${formatHours(Math.abs(delta))}`}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-center font-sans text-[11px]">
                        {isSaved ? (
                          <span className="text-emerald-400 font-medium">No Prazo</span>
                        ) : (
                          <span className="text-rose-400 font-medium">Estourado</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Signature & Audit section for Print */}
        <div className="pt-8 border-t border-neutral-800 grid grid-cols-2 gap-8 text-xs text-neutral-400">
          <div className="border-t border-neutral-700 pt-2 text-center">
            <p className="font-semibold text-neutral-200">
              {selectedProductivity ? selectedProductivity.mechanic.name : 'Colaborador Responsável'}
            </p>
            <p className="text-[11px] text-neutral-500">Mecânico Automotivo</p>
          </div>

          <div className="border-t border-neutral-700 pt-2 text-center">
            <p className="font-semibold text-neutral-200">Gerência / Responsável Técnico</p>
            <p className="text-[11px] text-neutral-500">OficinaPro Gestão Operacional</p>
          </div>
        </div>

      </div>

    </div>
  );
};
