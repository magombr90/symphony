
import { useState } from "react";
import { useTicketQueries } from "./tickets/use-ticket-queries";
import { useTicketActions } from "./tickets/use-ticket-actions";
import { Ticket } from "@/types/ticket";
import { DateRange } from "react-day-picker";
import { useAuth } from "./use-auth";

export const useTickets = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateRange | undefined>(undefined);
  const [selectedTicketDetails, setSelectedTicketDetails] = useState<Ticket | null>(null);
  const [showReasonDialog, setShowReasonDialog] = useState(false);
  const [reason, setReason] = useState("");
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const { currentUser } = useAuth();

  console.log("Is admin:", currentUser?.role === "admin", "User role:", currentUser?.role);

  const { tickets, clients, systemUsers, ticketHistory, refetch } = useTicketQueries(
    searchTerm,
    statusFilter,
    dateFilter,
    selectedTicketDetails
  );

  const {
    handleStatusChange: handleStatusChangeAction,
    handleAssignTicket,
    handleReasonSubmit: handleReasonSubmitAction,
    handleFaturarTicket,
    handleMarkEquipmentAsDelivered,
  } = useTicketActions(tickets || [], refetch);

  // Wrap handleStatusChange to ensure updates trigger refetch
  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    const success = await handleStatusChangeAction(ticketId, newStatus);
    if (success) {
      // Explicitly call refetch after successful status change
      await refetch();
      return true;
    }
    return false;
  };

  const handleReasonSubmit = async () => {
    if (!editingTicket) return;
    
    // Explicitly store the boolean result from handleReasonSubmitAction
    const success = await handleReasonSubmitAction(
      editingTicket.id,
      editingTicket.status,
      editingTicket.status,
      reason
    );
    
    // Check the boolean result
    if (success === true) {
      setShowReasonDialog(false);
      setReason("");
      setEditingTicket(null);
      // Explicitly refetch data after successful submission
      await refetch();
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
    showReasonDialog,
    setShowReasonDialog,
    reason,
    setReason,
    showAssignDialog,
    setShowAssignDialog,
    selectedUser,
    setSelectedUser,
    editingTicket,
    setEditingTicket,
    handleStatusChange,
    handleAssignTicket,
    handleReasonSubmit,
    refetch,
  };
};
