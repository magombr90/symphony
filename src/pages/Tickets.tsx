
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTickets } from "@/hooks/use-tickets";
import { TicketsTable } from "@/components/tickets/TicketsTable";
import { TicketDetails } from "@/components/tickets/TicketDetails";
import { CreateTicketForm } from "@/components/tickets/CreateTicketForm";
import { TicketSearch } from "@/components/tickets/TicketSearch";
import { ReasonDialog } from "@/components/tickets/ReasonDialog";
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
  const {
    tickets,
    clients,
    systemUsers,
    ticketHistory,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    selectedTicketDetails,
    setSelectedTicketDetails,
    editingTicket,
    showReasonDialog,
    setShowReasonDialog,
    reason,
    setReason,
    handleFaturarTicket,
    handleStatusChange,
    updateTicketStatus,
    refetch,
  } = useTickets();

  const handleReasonSubmit = async () => {
    if (!editingTicket) return;
    await updateTicketStatus(editingTicket.id, editingTicket.status, reason);
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
          onSearch={refetch}
        />
      </div>

      <TicketsTable
        tickets={tickets || []}
        onStatusChange={handleStatusChange}
        onViewDetails={(ticket: Ticket) => setSelectedTicketDetails(ticket)}
      />

      <ReasonDialog
        open={showReasonDialog}
        onOpenChange={setShowReasonDialog}
        editingTicket={editingTicket}
        reason={reason}
        onReasonChange={setReason}
        onSubmit={handleReasonSubmit}
      />

      <TicketDetails
        ticket={selectedTicketDetails}
        history={ticketHistory || []}
        onClose={() => setSelectedTicketDetails(null)}
      />
    </div>
  );
}
