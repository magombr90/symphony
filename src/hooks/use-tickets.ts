import { useState } from "react";
import { Ticket } from "@/types/ticket";
import { DateRange } from "react-day-picker";
import { useTicketQueries } from "./tickets/use-ticket-queries";
import { useTicketActions } from "./tickets/use-ticket-actions";

export function useTickets() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateRange>();
  const [selectedTicketDetails, setSelectedTicketDetails] = useState<Ticket | null>(null);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [showReasonDialog, setShowReasonDialog] = useState(false);
  const [reason, setReason] = useState("");
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const {
    tickets,
    clients,
    systemUsers,
    ticketHistory,
    refetch,
  } = useTicketQueries(searchTerm, statusFilter, dateFilter, selectedTicketDetails);

  const {
    handleFaturarTicket,
    updateTicketStatus,
    handleAssignTicket,
    handleMarkEquipmentAsDelivered,
    addProgressNote,
  } = useTicketActions(systemUsers, refetch);

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

  const handleReasonSubmit = async () => {
    if (!editingTicket) return;
    
    const success = await updateTicketStatus(editingTicket.id, editingTicket.status, reason);
    if (success) {
      setShowReasonDialog(false);
      setReason("");
      setEditingTicket(null);
    }
  };

  return {
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
    editingTicket,
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
    handleFaturarTicket,
    updateTicketStatus,
    handleReasonSubmit,
    handleMarkEquipmentAsDelivered,
    addProgressNote,
    refetch,
  };
}
