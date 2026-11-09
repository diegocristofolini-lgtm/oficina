/**
 * OficinaPro - Regras de Jornada de Trabalho da Oficina Mecânica
 * 
 * Horários de expediente permitidos:
 * - 07:30 às 09:00 (1h30min)
 * - 09:30 às 12:00 (2h30min)
 * - 13:30 às 16:00 (2h30min)
 * - 16:30 às 18:00 (1h30min)
 * 
 * Total diário: 8h de trabalho.
 * Fora desses intervalos (intervalo da manhã, almoço, intervalo da tarde, noite/madrugada),
 * o cronômetro NÃO acumula horas de trabalho.
 */

export interface WorkShift {
  name: string;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
}

export const WORK_SHIFTS: WorkShift[] = [
  { name: '1º Turno Manhã', startHour: 7, startMinute: 30, endHour: 9, endMinute: 0 },
  { name: '2º Turno Manhã', startHour: 9, startMinute: 30, endHour: 12, endMinute: 0 },
  { name: '1º Turno Tarde', startHour: 13, startMinute: 30, endHour: 16, endMinute: 0 },
  { name: '2º Turno Tarde', startHour: 16, startMinute: 30, endHour: 18, endMinute: 0 },
];

/**
 * Checks if a specific date/time is within official workshop shift hours.
 */
export function getWorkScheduleStatus(date: Date = new Date()): {
  isWorking: boolean;
  currentShift?: string;
  statusText: string;
} {
  const dayOfWeek = date.getDay(); // 0 = Domingo, 6 = Sábado
  
  // Se for domingo, oficina fechada
  if (dayOfWeek === 0) {
    return {
      isWorking: false,
      statusText: 'Oficina fechada (Domingo). Cronômetro pausado.',
    };
  }

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const timeInMinutes = hours * 60 + minutes;

  for (const shift of WORK_SHIFTS) {
    const shiftStart = shift.startHour * 60 + shift.startMinute;
    const shiftEnd = shift.endHour * 60 + shift.endMinute;

    if (timeInMinutes >= shiftStart && timeInMinutes < shiftEnd) {
      return {
        isWorking: true,
        currentShift: shift.name,
        statusText: `Expediente ativo (${shift.name}: ${formatTime(shift.startHour, shift.startMinute)} às ${formatTime(shift.endHour, shift.endMinute)})`,
      };
    }
  }

  // Se não estiver em turno, identificar a pausa específica
  if (timeInMinutes < 7 * 60 + 30) {
    return {
      isWorking: false,
      statusText: 'Fora do expediente (Início às 07:30). Cronômetro em espera.',
    };
  } else if (timeInMinutes >= 9 * 60 && timeInMinutes < 9 * 60 + 30) {
    return {
      isWorking: false,
      statusText: 'Intervalo da manhã (09:00 às 09:30). Cronômetro pausado automaticamente.',
    };
  } else if (timeInMinutes >= 12 * 60 && timeInMinutes < 13 * 60 + 30) {
    return {
      isWorking: false,
      statusText: 'Horário de Almoço (12:00 às 13:30). Cronômetro pausado automaticamente.',
    };
  } else if (timeInMinutes >= 16 * 60 && timeInMinutes < 16 * 60 + 30) {
    return {
      isWorking: false,
      statusText: 'Intervalo da tarde (16:00 às 16:30). Cronômetro pausado automaticamente.',
    };
  } else {
    return {
      isWorking: false,
      statusText: 'Fim de expediente (Após as 18:00). Cronômetro em espera até 07:30.',
    };
  }
}

function formatTime(hour: number, minute: number): string {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

/**
 * Calculates the exact working hours between two timestamps,
 * counting ONLY time that falls within the official work shifts.
 */
export function calculateWorkingHoursBetween(startMs: number, endMs: number): number {
  if (startMs >= endMs) return 0;

  let totalWorkingMs = 0;

  const startDate = new Date(startMs);
  const endDate = new Date(endMs);

  // Iterate day by day from startDate to endDate
  const currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const finalDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

  while (currentDate <= finalDate) {
    const dayOfWeek = currentDate.getDay();

    // Skip Sundays
    if (dayOfWeek !== 0) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const date = currentDate.getDate();

      for (const shift of WORK_SHIFTS) {
        const shiftStartMs = new Date(year, month, date, shift.startHour, shift.startMinute, 0, 0).getTime();
        const shiftEndMs = new Date(year, month, date, shift.endHour, shift.endMinute, 0, 0).getTime();

        // Overlap between [startMs, endMs] and [shiftStartMs, shiftEndMs]
        const overlapStart = Math.max(startMs, shiftStartMs);
        const overlapEnd = Math.min(endMs, shiftEndMs);

        if (overlapEnd > overlapStart) {
          totalWorkingMs += (overlapEnd - overlapStart);
        }
      }
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Convert milliseconds to fractional hours
  return totalWorkingMs / 3600000;
}
