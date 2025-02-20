
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTickets } from "@/hooks/use-tickets";
import { TicketsTable } from "@/components/tickets/TicketsTable";
import { TicketDetails } from "@/components/tickets/TicketDetails";
import { CreateTicketForm } from "@/components/tickets/CreateTicketForm";
import { TicketSearch } from "@/components/tickets/TicketSearch";
import { ReasonDialog } from "@/components/tickets/ReasonDialog";
import { AssignDialog } from "@/components/tickets/AssignDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Ticket } from "@/types/ticket";

export default function Tickets() {
  const [open, setOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  
  const {
    tickets,
    clients,
    systemUsers,
    ticketHistory,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    selectedTicketDetails,
    setSelectedTicketDetails,
    showReasonDialog,
    setShowReasonDialog,
    reason,
    setReason,
    showAssignDialog,
    setShowAssignDialog,
    selectedUser,
    setSelectedUser,
    handleStatusChange,
    handleAssignTicket,
    updateTicketStatus,
    refetch,
  } = useTickets();

  const handleReasonSubmit = async () => {
    if (!editingTicket) return;
    await updateTicketStatus(editingTicket.id, editingTicket.status, reason);
    setShowReasonDialog(false);
    setReason("");
    setEditingTicket(null);
    refetch();
  };

  const handleAssignSubmit = async () => {
    if (!editingTicket || !selectedUser) return;
    await handleAssignTicket(editingTicket.id, selectedUser, editingTicket.assigned_to);
    setShowAssignDialog(false);
    setSelectedUser(null);
    setEditingTicket(null);
    refetch();
  };

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Tickets</h1>
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

      <div className="mb-6">
        <TicketSearch
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          dateFilter={dateFilter}
          onDateFilterChange={setDateFilter}
          onSearch={refetch}
        />
      </div>

      <TicketsTable
        tickets={tickets || []}
        onStatusChange={handleStatusChange}
        onViewDetails={(ticket: Ticket) => setSelectedTicketDetails(ticket)}
        onAssign={(ticket: Ticket) => {
          setEditingTicket(ticket);
          setShowAssignDialog(true);
        }}
      />

      <ReasonDialog
        open={showReasonDialog}
        onOpenChange={setShowReasonDialog}
        editingTicket={editingTicket}
        reason={reason}
        onReasonChange={setReason}
        onSubmit={handleReasonSubmit}
      />

      <AssignDialog
        open={showAssignDialog}
        onOpenChange={setShowAssignDialog}
        ticket={editingTicket}
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
    </div>
  );
}
