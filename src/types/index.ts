export type OSStatus = 'not_started' | 'in_progress' | 'paused' | 'completed' | 'cancelled';

export type ServiceCategory = 
  | 'Motor' 
  | 'Câmbio & Transmissão' 
  | 'Freios & ABS' 
  | 'Suspensão & Direção' 
  | 'Injeção Eletrônica' 
  | 'Elétrica & Bateria' 
  | 'Ar Condicionado' 
  | 'Revisão Preventiva';

export type Priority = 'normal' | 'alta' | 'urgente';

export interface TimeLog {
  id: string;
  startedAt: string;
  endedAt?: string;
  durationHours: number;
  notes?: string;
}

export interface WorkOrder {
  id: string;
  code: string; // e.g. "OS-2026-081"
  clientName: string;
  clientPhone: string;
  vehicleModel: string;
  vehiclePlate: string;
  vehicleYear?: string;
  serviceDescription: string;
  category: ServiceCategory;
  mechanicId: string;
  budgetedHours: number; // Horas orçadas (ex: 4.5h)
  executedHours: number; // Horas realmente gastas até o momento
  status: OSStatus;
  priority: Priority;
  createdAt: string;
  completedAt?: string;
  notes?: string;
  isTimerRunning?: boolean;
  timerStartedAt?: number; // timestamp in milliseconds
  timeLogs: TimeLog[];
}

export type Department = 'mecanica' | 'pecas' | 'administrativo' | 'atendimento' | 'gerencia';

export interface Mechanic {
  id: string;
  name: string;
  department?: Department; // 'mecanica' (default) | 'pecas' | 'administrativo' | 'atendimento' | 'gerencia'
  role?: string; // Cargo específico, ex: "Estoquista", "Assistente Financeiro", "Mecânico Sênior"
  specialty: string;
  email?: string;
  phone?: string;
  hourlyCost: number; // R$/hora
  targetEfficiency: number; // Meta % (ex: 100%)
  avatarColor: string;
  admissionDate: string;
  active: boolean;
}

export interface MechanicProductivity {
  mechanic: Mechanic;
  totalBudgetedHours: number;
  totalExecutedHours: number;
  balanceHours: number; // budgeted - executed. Positive = saved/ahead, Negative = overrun/behind
  efficiency: number; // Eficiência ponderada (%)
  completedEfficiency: number; // Eficiência apenas dos serviços concluídos (%)
  completedCount: number;
  inProgressCount: number;
  exceededCount: number;
  onTimeCount: number;
  onTimeRate: number; // %
  financialBalance: number; // balanceHours * hourlyCost
  workOrders: WorkOrder[];
}

export interface WorkshopMetrics {
  totalBudgetedHours: number;
  totalExecutedHours: number;
  totalBalanceHours: number;
  workshopEfficiency: number; // Eficiência ponderada global (%)
  completedEfficiency: number; // Eficiência dos serviços concluídos (%)
  totalOrders: number;
  completedOrders: number;
  inProgressOrders: number;
  exceededOrdersCount: number;
  activeExceededOrders: WorkOrder[];
  financialGainLoss: number;
}
