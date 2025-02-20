
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { TicketsTable } from "@/components/tickets/TicketsTable";
import { TicketStats } from "@/components/tickets/TicketStats";
import { useTickets } from "@/hooks/use-tickets";
import { Ticket } from "@/types/ticket";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateTicketForm } from "@/components/tickets/CreateTicketForm";

export default function Dashboard() {
  const { tickets, clients, systemUsers, refetch } = useTickets();
  const [filterUser, setFilterUser] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

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
      switch (ticket.status) {
        case 'PENDENTE':
          existingUser.pending += 1;
          break;
        case 'EM_ANDAMENTO':
          existingUser.inProgress += 1;
          break;
        case 'CONCLUIDO':
          existingUser.completed += 1;
          break;
        case 'CANCELADO':
          existingUser.canceled += 1;
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
        completed: ticket.status === 'CONCLUIDO' ? 1 : 0,
        canceled: ticket.status === 'CANCELADO' ? 1 : 0,
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Ticket
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Ticket</DialogTitle>
            </DialogHeader>
            <CreateTicketForm
              clients={clients || []}
              systemUsers={systemUsers || []}
              onSuccess={() => {
                setOpen(false);
                refetch();
              }}
            />
          </DialogContent>
        </Dialog>
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
