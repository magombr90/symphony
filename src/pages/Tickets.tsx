
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TicketsTable } from "@/components/tickets/TicketsTable";
import { TicketDetails } from "@/components/tickets/TicketDetails";
import { CreateTicketForm } from "@/components/tickets/CreateTicketForm";
import { TicketSearch } from "@/components/tickets/TicketSearch";
import { TicketReasonDialog } from "@/components/tickets/TicketReasonDialog";
import { ticketService } from "@/services/ticketService";
import { useTickets } from "@/hooks/useTickets";
import { useClients } from "@/hooks/useClients";
import { useSystemUsers } from "@/hooks/useSystemUsers";
import { useTicketHistory } from "@/hooks/useTicketHistory";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Ticket = {
  id: string;
  codigo: string;
  status: string;
  description: string;
  client_id: string;
  scheduled_for: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  client: {
    razao_social: string;
  };
  assigned_to: string | null;
  assigned_user?: {
    name: string | null;
  } | null;
  faturado: boolean;
  faturado_at: string | null;
};

export default function Tickets() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedTicketDetails, setSelectedTicketDetails] = useState<Ticket | null>(null);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [showReasonDialog, setShowReasonDialog] = useState(false);
  const [reason, setReason] = useState("");
  const { toast } = useToast();

  const { data: tickets, refetch } = useTickets(searchTerm, statusFilter);
  const { data: clients } = useClients();
  const { data: systemUsers } = useSystemUsers();
  const { data: ticketHistory } = useTicketHistory(selectedTicketDetails?.id);

  const handleFaturarTicket = async (ticketId: string) => {
    try {
      await ticketService.faturarTicket(ticketId);
      toast({ title: "Ticket faturado com sucesso!" });
      refetch();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao faturar ticket",
        description: error.message,
      });
    }
  };

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    if (newStatus === "CANCELADO" || newStatus === "CONCLUIDO") {
      setEditingTicket({
        ...(tickets?.find((t) => t.id === ticketId) as Ticket),
        status: newStatus,
      });
      setShowReasonDialog(true);
      return;
    }

    await updateTicketStatus(ticketId, newStatus);
  };

  const updateTicketStatus = async (ticketId: string, newStatus: string, reasonText?: string) => {
    try {
      await ticketService.updateStatus(ticketId, newStatus);
      
      if (reasonText) {
        await ticketService.addHistoryEntry(
          ticketId,
          newStatus,
          reasonText,
          systemUsers?.[0]?.id as string
        );
      }

      toast({ title: "Status atualizado com sucesso!" });
      refetch();
      setShowReasonDialog(false);
      setReason("");
      setEditingTicket(null);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar status",
        description: error.message,
      });
    }
  };

  const handleReasonSubmit = async () => {
    if (!editingTicket) return;
    await updateTicketStatus(editingTicket.id, editingTicket.status, reason);
  };

  const renderFaturarButton = (ticket: Ticket) => {
    if (ticket.status === "CONCLUIDO" && !ticket.faturado) {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleFaturarTicket(ticket.id)}
          className={`${ticket.faturado ? 'text-green-600' : 'text-black hover:text-black'}`}
        >
          <DollarSign className="h-4 w-4" />
        </Button>
      );
    }
    return null;
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
        renderActions={(ticket: Ticket) => renderFaturarButton(ticket)}
      />

      <TicketReasonDialog
        open={showReasonDialog}
        onOpenChange={setShowReasonDialog}
        status={editingTicket?.status || ""}
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
