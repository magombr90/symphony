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
    handleStatusChange,
    handleAssignTicket,
    handleReasonSubmit: handleReasonSubmitAction,
    handleFaturarTicket,
    handleMarkEquipmentAsDelivered,
  } = useTicketActions(tickets || [], refetch);

  const handleReasonSubmit = async () => {
    if (!editingTicket) return;
    
    const success = await handleReasonSubmitAction(
      editingTicket.id,
      editingTicket.status,
      editingTicket.status,
      reason
    );
    
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
