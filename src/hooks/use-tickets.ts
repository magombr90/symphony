
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

  const ticketActions = useTicketActions(tickets || [], refetch);

  const {
    handleFaturarTicket,
    handleStatusChange,
    handleAssignTicket,
    handleMarkEquipmentAsDelivered
  } = ticketActions;

  const handleReasonSubmit = async () => {
    if (!editingTicket) return;
    
    const success = await handleStatusChange(editingTicket.id, editingTicket.status, reason);
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
    handleReasonSubmit,
    refetch,
    handleFaturarTicket,
    handleMarkEquipmentAsDelivered
  };
}
