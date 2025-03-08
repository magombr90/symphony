
import { useToast } from "@/hooks/use-toast";
import { Ticket } from "@/types/ticket";
import { useAuth } from "../use-auth";
import { useTicketStatus } from "./use-ticket-status";
import { useTicketAssignment } from "./use-ticket-assignment";
import { useTicketBilling } from "./use-ticket-billing";
import { useEquipmentActions } from "./use-equipment-actions";
import { useProgressNotes } from "./use-progress-notes";

export function useTicketActions(tickets: Ticket[], onSuccess: () => void) {
  const { currentUser } = useAuth();
  
  // Use the refactored hooks for specific ticket actions
  const { handleStatusChange, handleReasonSubmit } = useTicketStatus(tickets, onSuccess);
  const { handleAssignTicket } = useTicketAssignment(onSuccess);
  const { handleFaturarTicket } = useTicketBilling(onSuccess);
  const { handleMarkEquipmentAsDelivered } = useEquipmentActions(onSuccess);
  const { handleAddProgressNote } = useProgressNotes(onSuccess);

  return {
    handleStatusChange,
    handleAssignTicket,
    handleReasonSubmit,
    handleFaturarTicket,
    handleMarkEquipmentAsDelivered,
    handleAddProgressNote
  };
}
