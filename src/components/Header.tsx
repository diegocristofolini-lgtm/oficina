import React from 'react';
import { Plus, Wrench, RotateCcw, Smartphone } from 'lucide-react';

export type NavTab = 'dashboard' | 'orders' | 'bank' | 'reports' | 'mechanics';

interface HeaderProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenNewOrderModal: () => void;
  onOpenResetModal: () => void;
  onOpenInstallApkModal?: () => void;
  activeAlertCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenNewOrderModal,
  onOpenResetModal,
  onOpenInstallApkModal,
  activeAlertCount,
}) => {
  return (
    <header className="no-print sticky top-0 z-40 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Brand title wordmark */}
        <div 
          onClick={() => onSelectTab('dashboard')} 
          className="flex items-center gap-2.5 cursor-pointer shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
            <Wrench className="w-4 h-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-neutral-100 whitespace-nowrap shrink-0">
            OficinaPro
          </span>
        </div>

        {/* Zone 2: 4-5 concise single-line navigation links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition whitespace-nowrap shrink-0 ${
              activeTab === 'dashboard'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
            }`}
          >
            Painel Geral
          </button>

          <button
            onClick={() => onSelectTab('orders')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
            }`}
          >
            <span>Ordens de Serviço</span>
            {activeAlertCount > 0 && (
              <span className="text-xs px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-400 font-mono">
                {activeAlertCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('bank')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition whitespace-nowrap shrink-0 ${
              activeTab === 'bank'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
            }`}
          >
            Banco de Desempenho
          </button>

          <button
            onClick={() => onSelectTab('reports')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition whitespace-nowrap shrink-0 ${
              activeTab === 'reports'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
            }`}
          >
            Relatórios & Exportação
          </button>

          <button
            onClick={() => onSelectTab('mechanics')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition whitespace-nowrap shrink-0 ${
              activeTab === 'mechanics'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
            }`}
          >
            Equipe
          </button>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {onOpenInstallApkModal && (
            <button
              onClick={onOpenInstallApkModal}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-500/30 rounded-lg transition shadow-sm cursor-pointer"
              title="Instalar no Celular ou Baixar APK"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Instalar / APK</span>
            </button>
          )}

          <button
            onClick={onOpenResetModal}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition cursor-pointer"
            title="Resetar serviços / Limpar dados de teste"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Resetar</span>
          </button>

          <button
            onClick={onOpenNewOrderModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nova OS</span>
          </button>
        </div>

      </div>

      {/* Mobile navigation row */}
      <div className="md:hidden flex items-center justify-around border-t border-neutral-800/80 px-2 py-2 overflow-x-auto text-xs">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`px-2.5 py-1.5 rounded font-medium whitespace-nowrap shrink-0 ${
            activeTab === 'dashboard' ? 'text-amber-400 bg-neutral-800' : 'text-neutral-400'
          }`}
        >
          Painel
        </button>
        <button
          onClick={() => onSelectTab('orders')}
          className={`px-2.5 py-1.5 rounded font-medium whitespace-nowrap shrink-0 ${
            activeTab === 'orders' ? 'text-amber-400 bg-neutral-800' : 'text-neutral-400'
          }`}
        >
          OS ({activeAlertCount > 0 ? `!${activeAlertCount}` : ''})
        </button>
        <button
          onClick={() => onSelectTab('bank')}
          className={`px-2.5 py-1.5 rounded font-medium whitespace-nowrap shrink-0 ${
            activeTab === 'bank' ? 'text-amber-400 bg-neutral-800' : 'text-neutral-400'
          }`}
        >
          Banco de Horas
        </button>
        <button
          onClick={() => onSelectTab('reports')}
          className={`px-2.5 py-1.5 rounded font-medium whitespace-nowrap shrink-0 ${
            activeTab === 'reports' ? 'text-amber-400 bg-neutral-800' : 'text-neutral-400'
          }`}
        >
          Relatórios
        </button>
        <button
          onClick={() => onSelectTab('mechanics')}
          className={`px-2.5 py-1.5 rounded font-medium whitespace-nowrap shrink-0 ${
            activeTab === 'mechanics' ? 'text-amber-400 bg-neutral-800' : 'text-neutral-400'
          }`}
        >
          Equipe
        </button>
      </div>
    </header>
  );
};
