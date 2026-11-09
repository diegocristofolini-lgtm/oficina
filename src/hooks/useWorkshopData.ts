import { useState, useEffect, useMemo, useCallback } from 'react';
import { Mechanic, WorkOrder, OSStatus, MechanicProductivity, WorkshopMetrics, ServiceCategory } from '../types';
import { INITIAL_MECHANICS, INITIAL_WORK_ORDERS } from '../data/initialData';
import { calculateWorkingHoursBetween, getWorkScheduleStatus } from '../utils/workSchedule';

const STORAGE_KEY_MECHANICS = 'oficinapro_mechanics_v1';
const STORAGE_KEY_ORDERS = 'oficinapro_orders_v1';

/**
 * Synchronizes running orders against real-world wall-clock time,
 * strictly counting ONLY time that falls within the workshop's shift windows:
 * - 07:30 às 09:00
 * - 09:30 às 12:00
 * - 13:30 às 16:00
 * - 16:30 às 18:00
 * Outside these hours, the stopwatch remains paused.
 */
function syncRunningOrders(orders: WorkOrder[]): WorkOrder[] {
  const now = Date.now();
  let hasChange = false;

  const updated = orders.map(order => {
    if (order.isTimerRunning && order.status === 'in_progress' && order.timerStartedAt) {
      const workingHours = calculateWorkingHoursBetween(order.timerStartedAt, now);
      if (workingHours > 0) {
        hasChange = true;
        return {
          ...order,
          executedHours: Number((order.executedHours + workingHours).toFixed(4)),
          timerStartedAt: now,
        };
      } else {
        // Advance reference timestamp to now so we don't re-scan non-working intervals
        return {
          ...order,
          timerStartedAt: now,
        };
      }
    }
    return order;
  });

  return hasChange ? updated : orders;
}

export function useWorkshopData() {
  const [mechanics, setMechanics] = useState<Mechanic[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MECHANICS);
      if (saved) {
        const parsed: Mechanic[] = JSON.parse(saved);
        // Ensure default department 'mecanica' if missing on older records
        return parsed.map(m => ({
          ...m,
          department: m.department || 'mecanica',
        }));
      }
    } catch (e) {
      console.error('Error loading mechanics from localStorage', e);
    }
    return INITIAL_MECHANICS;
  });

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ORDERS);
      if (saved) {
        const parsed: WorkOrder[] = JSON.parse(saved);
        // Automatically sync all elapsed hours that accumulated while app was closed!
        return syncRunningOrders(parsed);
      }
    } catch (e) {
      console.error('Error loading orders from localStorage', e);
    }
    return syncRunningOrders(INITIAL_WORK_ORDERS);
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MECHANICS, JSON.stringify(mechanics));
    } catch (e) {
      console.error('Failed to save mechanics', e);
    }
  }, [mechanics]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(workOrders));
    } catch (e) {
      console.error('Failed to save orders', e);
    }
  }, [workOrders]);

  // Real-time ticking and synchronization for running timers
  useEffect(() => {
    // 1. Immediately synchronize on mount
    setWorkOrders(prev => syncRunningOrders(prev));

    // 2. Synchronize when the user returns to tab, unlocks device, or reopens window
    const handleSync = () => {
      setWorkOrders(prev => syncRunningOrders(prev));
    };

    document.addEventListener('visibilitychange', handleSync);
    window.addEventListener('focus', handleSync);
    window.addEventListener('pageshow', handleSync);

    // 3. Ticking interval while app is open for fluid 1-second visual countdown
    const interval = setInterval(() => {
      setWorkOrders(prev => {
        const hasRunning = prev.some(o => o.isTimerRunning && o.status === 'in_progress');
        if (!hasRunning) return prev;
        return syncRunningOrders(prev);
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleSync);
      window.removeEventListener('focus', handleSync);
      window.removeEventListener('pageshow', handleSync);
    };
  }, []);

  // Actions for Work Orders
  const addWorkOrder = useCallback((data: Omit<WorkOrder, 'id' | 'code' | 'createdAt' | 'timeLogs'>) => {
    const newId = `os-${Date.now()}`;
    const codeNum = 100 + workOrders.length + 1;
    const newOrder: WorkOrder = {
      ...data,
      id: newId,
      code: `OS-2026-${codeNum}`,
      createdAt: new Date().toISOString(),
      timeLogs: data.executedHours > 0 ? [
        {
          id: `log-${Date.now()}`,
          startedAt: new Date().toISOString(),
          durationHours: data.executedHours,
          notes: 'Horas iniciais registradas no cadastro',
        }
      ] : [],
    };
    setWorkOrders(prev => [newOrder, ...prev]);
    return newOrder;
  }, [workOrders.length]);

  const updateWorkOrder = useCallback((updated: WorkOrder) => {
    setWorkOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
  }, []);

  const deleteWorkOrder = useCallback((id: string) => {
    setWorkOrders(prev => prev.filter(o => o.id !== id));
  }, []);

  const toggleTimer = useCallback((id: string) => {
    setWorkOrders(prev =>
      prev.map(order => {
        if (order.id !== id) return order;

        if (order.isTimerRunning) {
          // Stop timer: capture exact working shift hours elapsed
          const now = Date.now();
          const elapsedWorkingHours = order.timerStartedAt 
            ? calculateWorkingHoursBetween(order.timerStartedAt, now)
            : 0;

          const updatedExecuted = Number((order.executedHours + elapsedWorkingHours).toFixed(4));
          const newLog = {
            id: `log-${Date.now()}`,
            startedAt: new Date(order.timerStartedAt || now).toISOString(),
            endedAt: new Date(now).toISOString(),
            durationHours: Number(elapsedWorkingHours.toFixed(4)),
            notes: 'Apontamento via cronômetro de bancada',
          };

          return {
            ...order,
            isTimerRunning: false,
            timerStartedAt: undefined,
            executedHours: updatedExecuted,
            timeLogs: [...(order.timeLogs || []), newLog],
          };
        } else {
          // Start timer: anchor wall-clock timestamp right now
          return {
            ...order,
            status: 'in_progress',
            isTimerRunning: true,
            timerStartedAt: Date.now(),
          };
        }
      })
    );
  }, []);

  const adjustBudgetedHours = useCallback((id: string, delta: number) => {
    setWorkOrders(prev =>
      prev.map(order => {
        if (order.id !== id) return order;
        const newBudgeted = Math.max(0.01, Number((order.budgetedHours + delta).toFixed(4)));
        return {
          ...order,
          budgetedHours: newBudgeted,
        };
      })
    );
  }, []);

  const setExactBudgetedHours = useCallback((id: string, newBudgetedHours: number) => {
    setWorkOrders(prev =>
      prev.map(order => {
        if (order.id !== id) return order;
        return {
          ...order,
          budgetedHours: Math.max(0.01, Number(newBudgetedHours.toFixed(4))),
        };
      })
    );
  }, []);

  const adjustExecutedHours = useCallback((id: string, delta: number) => {
    setWorkOrders(prev =>
      prev.map(order => {
        if (order.id !== id) return order;
        const now = Date.now();
        const runningWorkingHours = order.isTimerRunning && order.timerStartedAt
          ? calculateWorkingHoursBetween(order.timerStartedAt, now)
          : 0;
        const newExecuted = Math.max(0, Number((order.executedHours + runningWorkingHours + delta).toFixed(4)));

        return {
          ...order,
          executedHours: newExecuted,
          timerStartedAt: order.isTimerRunning ? now : undefined,
        };
      })
    );
  }, []);

  const setExactExecutedHours = useCallback((id: string, newTotalExecutedHours: number, note?: string) => {
    setWorkOrders(prev =>
      prev.map(order => {
        if (order.id !== id) return order;
        const now = Date.now();
        const delta = newTotalExecutedHours - order.executedHours;
        const updatedLogs = note ? [
          ...(order.timeLogs || []),
          {
            id: `log-${Date.now()}`,
            startedAt: new Date(now).toISOString(),
            endedAt: new Date(now).toISOString(),
            durationHours: Number(delta.toFixed(4)),
            notes: `Ajuste manual: ${note}`,
          }
        ] : order.timeLogs;

        return {
          ...order,
          executedHours: Number(newTotalExecutedHours.toFixed(4)),
          timerStartedAt: order.isTimerRunning ? now : undefined,
          timeLogs: updatedLogs,
        };
      })
    );
  }, []);

  const updateOrderStatus = useCallback((id: string, status: OSStatus) => {
    setWorkOrders(prev =>
      prev.map(order => {
        if (order.id !== id) return order;
        const isCompleting = status === 'completed';
        const now = Date.now();
        let finalExecuted = order.executedHours;
        let newLogs = order.timeLogs || [];

        if (isCompleting && order.isTimerRunning && order.timerStartedAt) {
          const elapsed = calculateWorkingHoursBetween(order.timerStartedAt, now);
          finalExecuted = Number((order.executedHours + elapsed).toFixed(4));
          newLogs = [
            ...newLogs,
            {
              id: `log-${Date.now()}`,
              startedAt: new Date(order.timerStartedAt).toISOString(),
              endedAt: new Date(now).toISOString(),
              durationHours: Number(elapsed.toFixed(4)),
              notes: 'Finalização da OS',
            }
          ];
        }

        return {
          ...order,
          status,
          isTimerRunning: isCompleting ? false : order.isTimerRunning,
          timerStartedAt: isCompleting ? undefined : order.timerStartedAt,
          executedHours: finalExecuted,
          timeLogs: newLogs,
          completedAt: isCompleting ? new Date().toISOString() : order.completedAt,
        };
      })
    );
  }, []);

  // Mechanics Actions
  const addMechanic = useCallback((data: Omit<Mechanic, 'id'>) => {
    const newMech: Mechanic = {
      ...data,
      id: `mech-${Date.now()}`,
    };
    setMechanics(prev => [...prev, newMech]);
  }, []);

  const updateMechanic = useCallback((updated: Mechanic) => {
    setMechanics(prev => prev.map(m => m.id === updated.id ? updated : m));
  }, []);

  const deleteMechanic = useCallback((id: string) => {
    setMechanics(prev => prev.filter(m => m.id !== id));
  }, []);

  const clearAllWorkOrders = useCallback(() => {
    setWorkOrders([]);
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify([]));
  }, []);

  const resetToDemoData = useCallback(() => {
    setMechanics(INITIAL_MECHANICS);
    setWorkOrders(INITIAL_WORK_ORDERS);
    localStorage.removeItem(STORAGE_KEY_MECHANICS);
    localStorage.removeItem(STORAGE_KEY_ORDERS);
  }, []);

  // Metrics and Performance Bank Calculations
  const mechanicsProductivity = useMemo<MechanicProductivity[]>(() => {
    return mechanics.map(mechanic => {
      const mechOrders = workOrders.filter(o => o.mechanicId === mechanic.id);
      
      const totalBudgeted = mechOrders.reduce((acc, curr) => acc + curr.budgetedHours, 0);
      const totalExecuted = mechOrders.reduce((acc, curr) => acc + curr.executedHours, 0);
      
      // Saldo de Horas: Orçadas - Executadas
      // > 0 = Horas Sobrando (Economizou tempo, lucro de produtividade)
      // < 0 = Horas Faltando / Estouradas (Excedeu o orçamento)
      const balanceHours = Number((totalBudgeted - totalExecuted).toFixed(2));
      
      const completedOrders = mechOrders.filter(o => o.status === 'completed');
      const inProgressOrders = mechOrders.filter(o => o.status === 'in_progress');

      // Eficiência em ordens concluídas (resultado final do serviço entregue)
      const completedBudgeted = completedOrders.reduce((acc, curr) => acc + curr.budgetedHours, 0);
      const completedExecuted = completedOrders.reduce((acc, curr) => acc + curr.executedHours, 0);
      const completedEfficiency = completedExecuted > 0 
        ? Math.round((completedBudgeted / completedExecuted) * 100) 
        : 100;

      // Eficiência Ponderada (Evita distorção de 1000%+ em ordens recém-iniciadas):
      // - Em ordens concluídas: considera o orçado total vs executado total.
      // - Em ordens em andamento: enquanto dentro do prazo (executado <= orçado), ritmo é 100% (min(orçado, executado)).
      //   Se a ordem em andamento estourar (executado > orçado), o crédito fica travado no orçado, penalizando a eficiência.
      const inProgressEarned = inProgressOrders.reduce(
        (acc, curr) => acc + Math.min(curr.budgetedHours, curr.executedHours),
        0
      );
      const totalEarned = completedBudgeted + inProgressEarned;

      const efficiency = totalExecuted > 0 
        ? Math.round((totalEarned / totalExecuted) * 100) 
        : 100;
      
      // Ordens que estouraram o tempo orçado
      const exceededOrders = mechOrders.filter(o => o.executedHours > o.budgetedHours);
      
      // Ordens concluídas dentro do orçamento
      const onTimeOrders = completedOrders.filter(o => o.executedHours <= o.budgetedHours);
      const onTimeRate = completedOrders.length > 0 
        ? Math.round((onTimeOrders.length / completedOrders.length) * 100) 
        : 100;

      const financialBalance = Number((balanceHours * mechanic.hourlyCost).toFixed(2));

      return {
        mechanic,
        totalBudgetedHours: Number(totalBudgeted.toFixed(2)),
        totalExecutedHours: Number(totalExecuted.toFixed(2)),
        balanceHours,
        efficiency,
        completedEfficiency,
        completedCount: completedOrders.length,
        inProgressCount: inProgressOrders.length,
        exceededCount: exceededOrders.length,
        onTimeCount: onTimeOrders.length,
        onTimeRate,
        financialBalance,
        workOrders: mechOrders,
      };
    });
  }, [mechanics, workOrders]);

  const workshopMetrics = useMemo<WorkshopMetrics>(() => {
    const totalBudgeted = workOrders.reduce((acc, o) => acc + o.budgetedHours, 0);
    const totalExecuted = workOrders.reduce((acc, o) => acc + o.executedHours, 0);
    const totalBalance = Number((totalBudgeted - totalExecuted).toFixed(2));

    const completedOrdersList = workOrders.filter(o => o.status === 'completed');
    const inProgressOrdersList = workOrders.filter(o => o.status === 'in_progress');

    // Eficiência nas ordens concluídas (número definitivo dos serviços fechados)
    const completedBudgeted = completedOrdersList.reduce((acc, o) => acc + o.budgetedHours, 0);
    const completedExecuted = completedOrdersList.reduce((acc, o) => acc + o.executedHours, 0);
    const completedEfficiency = completedExecuted > 0
      ? Math.round((completedBudgeted / completedExecuted) * 100)
      : 100;

    // Eficiência Ponderada Geral (Concluídas + Em Andamento sem distorção inicial)
    const inProgressEarned = inProgressOrdersList.reduce(
      (acc, o) => acc + Math.min(o.budgetedHours, o.executedHours),
      0
    );
    const totalEarned = completedBudgeted + inProgressEarned;

    const efficiency = totalExecuted > 0 
      ? Math.round((totalEarned / totalExecuted) * 100) 
      : 100;

    const completed = completedOrdersList.length;
    const inProgress = inProgressOrdersList.length;
    const exceededCount = workOrders.filter(o => o.executedHours > o.budgetedHours).length;

    // Active orders currently in progress that exceeded budgeted hours
    const activeExceeded = workOrders.filter(
      o => o.status === 'in_progress' && o.executedHours > o.budgetedHours
    );

    // Financial balance calculation across all mechanics
    const financialGainLoss = mechanicsProductivity.reduce((acc, m) => acc + m.financialBalance, 0);

    return {
      totalBudgetedHours: Number(totalBudgeted.toFixed(2)),
      totalExecutedHours: Number(totalExecuted.toFixed(2)),
      totalBalanceHours: totalBalance,
      workshopEfficiency: efficiency,
      completedEfficiency,
      totalOrders: workOrders.length,
      completedOrders: completed,
      inProgressOrders: inProgress,
      exceededOrdersCount: exceededCount,
      activeExceededOrders: activeExceeded,
      financialGainLoss,
    };
  }, [workOrders, mechanicsProductivity]);

  // Breakdown by service category
  const categoryStats = useMemo(() => {
    const categories: ServiceCategory[] = [
      'Motor',
      'Câmbio & Transmissão',
      'Freios & ABS',
      'Suspensão & Direção',
      'Injeção Eletrônica',
      'Elétrica & Bateria',
      'Ar Condicionado',
      'Revisão Preventiva',
    ];

    return categories.map(category => {
      const orders = workOrders.filter(o => o.category === category);
      const budgeted = orders.reduce((acc, o) => acc + o.budgetedHours, 0);
      const executed = orders.reduce((acc, o) => acc + o.executedHours, 0);
      const balance = Number((budgeted - executed).toFixed(2));

      const completedInCat = orders.filter(o => o.status === 'completed');
      const inProgInCat = orders.filter(o => o.status === 'in_progress');
      const earned = completedInCat.reduce((acc, o) => acc + o.budgetedHours, 0) +
        inProgInCat.reduce((acc, o) => acc + Math.min(o.budgetedHours, o.executedHours), 0);
      const efficiency = executed > 0 ? Math.round((earned / executed) * 100) : 100;

      return {
        category,
        budgeted: Number(budgeted.toFixed(1)),
        executed: Number(executed.toFixed(1)),
        balance,
        efficiency,
        count: orders.length,
      };
    }).filter(cat => cat.count > 0);
  }, [workOrders]);

  return {
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
  };
}
