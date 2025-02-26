
import { Ticket } from "@/types/ticket";
import { startOfDay, endOfDay, parseISO } from "date-fns";

export interface UserStat {
  user: {
    id: string;
    name: string;
  };
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  canceled: number;
}

export function calculateUserStats(tickets: Ticket[] | undefined): UserStat[] {
  const today = new Date();
  const dayStart = startOfDay(today);
  const dayEnd = endOfDay(today);

  return tickets?.reduce((acc: UserStat[], ticket: Ticket) => {
    if (!ticket.assigned_to || !ticket.assigned_user) return acc;
    
    const ticketDate = parseISO(ticket.created_at);
    const isToday = ticketDate >= dayStart && ticketDate <= dayEnd;
    
    // Ignorar tickets faturados que não são de hoje
    if (ticket.status === 'FATURADO' && !isToday) {
      return acc;
    }

    const existingUser = acc.find(u => u.user.id === ticket.assigned_to);
    if (existingUser) {
      existingUser.total += 1;
      switch (ticket.status) {
        case 'PENDENTE':
          existingUser.pending += 1;
          break;
        case 'EM_ANDAMENTO':
          existingUser.inProgress += 1;
          break;
        case 'CONCLUIDO':
          if (isToday) existingUser.completed += 1;
          break;
        case 'CANCELADO':
          if (isToday) existingUser.canceled += 1;
          break;
      }
    } else {
      acc.push({
        user: {
          id: ticket.assigned_to,
          name: ticket.assigned_user.name || 'Usuário',
        },
        total: 1,
        pending: ticket.status === 'PENDENTE' ? 1 : 0,
        inProgress: ticket.status === 'EM_ANDAMENTO' ? 1 : 0,
        completed: ticket.status === 'CONCLUIDO' && isToday ? 1 : 0,
        canceled: ticket.status === 'CANCELADO' && isToday ? 1 : 0,
      });
    }
    return acc;
  }, []) || [];
}

export function calculateStatusCounts(tickets: Ticket[] | undefined) {
  const today = new Date();
  const dayStart = startOfDay(today);
  const dayEnd = endOfDay(today);
  
  // Inicializar contagens
  const statusCounts = {
    PENDENTE: 0,
    EM_ANDAMENTO: 0,
    CONCLUIDO: 0,
    CANCELADO: 0,
  };
  
  if (!tickets || tickets.length === 0) {
    return statusCounts;
  }
  
  return tickets.reduce((counts, ticket) => {
    const ticketDate = parseISO(ticket.created_at);
    const isToday = ticketDate >= dayStart && ticketDate <= dayEnd;
    
    // Para tickets CONCLUIDO e CANCELADO, contar apenas os de hoje
    if ((ticket.status === 'CONCLUIDO' || ticket.status === 'CANCELADO') && !isToday) {
      return counts;
    }
    
    if (ticket.status in counts) {
      counts[ticket.status as keyof typeof counts] += 1;
    }
    
    return counts;
  }, statusCounts);
}
