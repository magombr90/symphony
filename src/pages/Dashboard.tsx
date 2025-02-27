
import { useState } from "react";
import { useTickets } from "@/hooks/use-tickets";
import { Ticket } from "@/types/ticket";
import { AssignDialog } from "@/components/tickets/AssignDialog";
import { TicketDetails } from "@/components/tickets/TicketDetails";
import { TicketStats } from "@/components/tickets/TicketStats";
import { CreateTicketDialog } from "@/components/dashboard/CreateTicketDialog";
import { RecentTickets } from "@/components/dashboard/RecentTickets";
import { calculateUserStats, calculateStatusCounts } from "@/components/dashboard/UserStatsCalculator";
import { ReasonDialog } from "@/components/tickets/ReasonDialog";

export default function Dashboard() {
  const { 
    tickets, 
    clients, 
    systemUsers,
    ticketHistory,
    refetch,
    showAssignDialog,
    setShowAssignDialog,
    selectedUser,
    setSelectedUser,
    handleAssignTicket,
    handleStatusChange,
    showReasonDialog,
    setShowReasonDialog,
    reason,
    setReason,
    editingTicket,
    handleReasonSubmit
  } = useTickets();

  const [filterUser, setFilterUser] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [ticketToAssign, setTicketToAssign] = useState<Ticket | null>(null);
  const [selectedTicketDetails, setSelectedTicketDetails] = useState<Ticket | null>(null);

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

  // Calcular stats dos usuários usando a função utilitária
  const userStats = calculateUserStats(tickets);
  
  // Calcular contagens de status
  const statusCounts = calculateStatusCounts(tickets);

  const handleAssignSubmit = async () => {
    if (!ticketToAssign || !selectedUser) return;
    const success = await handleAssignTicket(ticketToAssign.id, selectedUser, ticketToAssign.assigned_to);
    if (success) {
      setShowAssignDialog(false);
      setTicketToAssign(null);
      setSelectedUser(null);
    }
  };

  return (
    <div className="fade-in space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <CreateTicketDialog
          open={open}
          onOpenChange={setOpen}
          clients={clients || []}
          systemUsers={systemUsers || []}
          onSuccess={refetch}
        />
      </div>

      <div className="grid gap-4">
        <TicketStats 
          userStats={userStats}
          statusCounts={[
            { status: 'PENDENTE', label: 'Pendente', count: statusCounts.PENDENTE },
            { status: 'EM_ANDAMENTO', label: 'Em Andamento', count: statusCounts.EM_ANDAMENTO },
            { status: 'CONCLUIDO', label: 'Concluído', count: statusCounts.CONCLUIDO },
            { status: 'CANCELADO', label: 'Cancelado', count: statusCounts.CANCELADO },
          ]}
          filterUser={filterUser}
          filterStatus={filterStatus}
          onFilterUserChange={setFilterUser}
          onFilterStatusChange={setFilterStatus}
        />
        
        <RecentTickets 
          tickets={recentTickets}
          onViewDetails={setSelectedTicketDetails}
          onAssign={(ticket: Ticket) => {
            setTicketToAssign(ticket);
            setShowAssignDialog(true);
          }}
          onStatusChange={handleStatusChange}
        />
      </div>

      <AssignDialog
        open={showAssignDialog}
        onOpenChange={setShowAssignDialog}
        ticket={ticketToAssign}
        users={systemUsers || []}
        selectedUser={selectedUser}
        onUserChange={setSelectedUser}
        onSubmit={handleAssignSubmit}
      />

      <TicketDetails
        ticket={selectedTicketDetails}
        history={ticketHistory || []}
        onClose={() => setSelectedTicketDetails(null)}
      />

      <ReasonDialog
        open={showReasonDialog}
        onOpenChange={setShowReasonDialog}
        reason={reason}
        onReasonChange={setReason}
        onSubmit={handleReasonSubmit}
        status={editingTicket?.status}
      />
    </div>
  );
}
