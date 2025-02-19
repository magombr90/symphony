
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { TicketsTable } from "@/components/tickets/TicketsTable";
import { TicketStats } from "@/components/tickets/TicketStats";
import { useTickets } from "@/hooks/use-tickets";
import { Ticket } from "@/types/ticket";

export default function Dashboard() {
  const { tickets } = useTickets();
  const [filterUser, setFilterUser] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  // Aplicar filtros aos tickets
  const filteredTickets = tickets?.filter(ticket => {
    let matchesFilter = true;
    
    if (filterUser) {
      matchesFilter = matchesFilter && ticket.assigned_to === filterUser;
    }
    
    if (filterStatus) {
      matchesFilter = matchesFilter && ticket.status === filterStatus;
    }
    
    return matchesFilter;
  }) || [];

  // Pegar os 5 tickets mais recentes dos filtrados
  const recentTickets = filteredTickets.slice(0, 5);

  // Calcular stats dos usuários
  const userStats = tickets?.reduce((acc: any[], ticket: Ticket) => {
    if (!ticket.assigned_to || !ticket.assigned_user) return acc;
    
    const existingUser = acc.find(u => u.user.id === ticket.assigned_to);
    if (existingUser) {
      existingUser.total += 1;
      if (ticket.status === 'EM_ANDAMENTO') {
        existingUser.inProgress += 1;
      }
    } else {
      acc.push({
        user: {
          id: ticket.assigned_to,
          name: ticket.assigned_user.name || 'Usuário',
        },
        total: 1,
        inProgress: ticket.status === 'EM_ANDAMENTO' ? 1 : 0,
      });
    }
    return acc;
  }, []) || [];

  // Calcular contagem de status
  const statusCounts = [
    { status: 'PENDENTE', label: 'Pendente', count: 0 },
    { status: 'EM_ANDAMENTO', label: 'Em Andamento', count: 0 },
    { status: 'CONCLUIDO', label: 'Concluído', count: 0 },
    { status: 'CANCELADO', label: 'Cancelado', count: 0 },
  ].map(statusItem => ({
    ...statusItem,
    count: tickets?.filter(t => t.status === statusItem.status).length || 0,
  }));

  return (
    <div className="fade-in space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      <div className="grid gap-4">
        <TicketStats 
          userStats={userStats}
          statusCounts={statusCounts}
          filterUser={filterUser}
          filterStatus={filterStatus}
          onFilterUserChange={setFilterUser}
          onFilterStatusChange={setFilterStatus}
        />
        
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              Tickets Recentes
              {(filterUser || filterStatus) && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  (Filtrados)
                </span>
              )}
            </h2>
            <TicketsTable 
              tickets={recentTickets} 
              onStatusChange={() => {}} 
              onViewDetails={() => {}}
              onAssign={() => {}}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
