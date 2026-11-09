import React, { useState } from 'react';
import { Header, NavTab } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { WorkOrdersView } from './components/WorkOrdersView';
import { PerformanceBankView } from './components/PerformanceBankView';
import { ReportsView } from './components/ReportsView';
import { MechanicsView } from './components/MechanicsView';
import { WorkOrderModal } from './components/WorkOrderModal';
import { ResetModal } from './components/ResetModal';
import { InstallApkModal } from './components/InstallApkModal';
import { useWorkshopData } from './hooks/useWorkshopData';
import { WorkOrder } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<WorkOrder | null>(null);

  const {
    mechanics,
    workOrders,
    mechanicsProductivity,
    workshopMetrics,
    categoryStats,
    addWorkOrder,
    updateWorkOrder,
    deleteWorkOrder,
    toggleTimer,
    adjustBudgetedHours,
    setExactBudgetedHours,
    adjustExecutedHours,
    setExactExecutedHours,
    updateOrderStatus,
    addMechanic,
    updateMechanic,
    deleteMechanic,
    clearAllWorkOrders,
    resetToDemoData,
  } = useWorkshopData();

  const handleOpenOrderModal = (order?: WorkOrder) => {
    setOrderToEdit(order || null);
    setIsOrderModalOpen(true);
  };

  const handleSaveOrder = (data: any) => {
    if (orderToEdit) {
      updateWorkOrder(data);
    } else {
      addWorkOrder(data);
    }
  };

  const handleViewCollaboratorReport = (mechanicId: string) => {
    setActiveTab('reports');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-amber-400 selection:text-neutral-950">
      
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenNewOrderModal={() => handleOpenOrderModal()}
        onOpenResetModal={() => setIsResetModalOpen(true)}
        onOpenInstallApkModal={() => setIsInstallModalOpen(true)}
        activeAlertCount={workshopMetrics.activeExceededOrders.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {activeTab === 'dashboard' && (
          <DashboardView
            metrics={workshopMetrics}
            productivity={mechanicsProductivity}
            workOrders={workOrders}
            mechanics={mechanics}
            categoryStats={categoryStats}
            onToggleTimer={toggleTimer}
            onOpenOrderModal={handleOpenOrderModal}
            onNavigateToTab={setActiveTab}
            onOpenResetModal={() => setIsResetModalOpen(true)}
          />
        )}

        {activeTab === 'orders' && (
          <WorkOrdersView
            workOrders={workOrders}
            mechanics={mechanics}
            onToggleTimer={toggleTimer}
            onAdjustBudgetedHours={adjustBudgetedHours}
            onSetExactBudgetedHours={setExactBudgetedHours}
            onAdjustExecutedHours={adjustExecutedHours}
            onSetExactExecutedHours={setExactExecutedHours}
            onUpdateStatus={updateOrderStatus}
            onOpenOrderModal={handleOpenOrderModal}
            onDeleteOrder={deleteWorkOrder}
            onOpenResetModal={() => setIsResetModalOpen(true)}
          />
        )}

        {activeTab === 'bank' && (
          <PerformanceBankView
            productivity={mechanicsProductivity}
            workOrders={workOrders}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            productivity={mechanicsProductivity}
            workOrders={workOrders}
            mechanics={mechanics}
          />
        )}

        {activeTab === 'mechanics' && (
          <MechanicsView
            mechanics={mechanics}
            productivity={mechanicsProductivity}
            onAddMechanic={addMechanic}
            onUpdateMechanic={updateMechanic}
            onDeleteMechanic={deleteMechanic}
            onViewCollaboratorReport={handleViewCollaboratorReport}
          />
        )}

      </main>

      {/* Global Work Order Modal */}
      <WorkOrderModal
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setOrderToEdit(null);
        }}
        onSave={handleSaveOrder}
        orderToEdit={orderToEdit}
        mechanics={mechanics}
      />

      {/* Global Reset Services Modal */}
      <ResetModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onClearAll={clearAllWorkOrders}
        onRestoreDefaults={resetToDemoData}
        ordersCount={workOrders.length}
      />

      {/* Global Install App & Generate APK Guide Modal */}
      <InstallApkModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

    </div>
  );
}
