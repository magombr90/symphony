import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Ticket } from "@/types/ticket";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../use-auth";

export function useTicketActions(tickets: Ticket[], onSuccess: () => void) {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  const handleStatusChange = async (ticketId: string, newStatus: string, oldStatus: string, reason?: string) => {
    try {
      // Update ticket status
      const { error: ticketError } = await supabase
        .from("tickets")
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", ticketId);

      if (ticketError) throw ticketError;

      // Create status change history record
      const { error: historyError } = await supabase
        .from("ticket_history")
        .insert({
          ticket_id: ticketId,
          status: newStatus,
          previous_status: oldStatus,
          reason,
          created_by: currentUser?.id || "",
          action_type: "STATUS_CHANGE"
        });

      if (historyError) throw historyError;

      toast({
        title: "Status do ticket atualizado",
        description: `O status do ticket foi alterado para ${newStatus}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      onSuccess();
      return true;
    } catch (error) {
      console.error("Erro ao atualizar status do ticket:", error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar status do ticket",
        description: "Não foi possível atualizar o status deste ticket.",
      });
      return false;
    }
  };

  const handleAssignTicket = async (ticketId: string, userId: string, previousUserId: string | null) => {
    try {
      // Update ticket assignment
      const { error: ticketError } = await supabase
        .from("tickets")
        .update({ assigned_to: userId })
        .eq("id", ticketId);

      if (ticketError) throw ticketError;

      // Create assignment history record
      const { error: historyError } = await supabase
        .from("ticket_history")
        .insert({
          ticket_id: ticketId,
          created_by: currentUser?.id || "",
          action_type: "USER_ASSIGNMENT",
          previous_assigned_to: previousUserId,
          new_assigned_to: userId,
          status: "EM_ANDAMENTO"
        });

      if (historyError) throw historyError;

      toast({
        title: "Ticket atribuído",
        description: `O ticket foi atribuído ao usuário.`,
      });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      onSuccess();
      return true;
    } catch (error) {
      console.error("Erro ao atribuir ticket:", error);
      toast({
        variant: "destructive",
        title: "Erro ao atribuir ticket",
        description: "Não foi possível atribuir este ticket.",
      });
      return false;
    }
  };

  const handleReasonSubmit = async (ticketId: string, newStatus: string, oldStatus: string, reason: string) => {
    const success = await handleStatusChange(ticketId, newStatus, oldStatus, reason);
    if (success) {
      toast({
        title: "Motivo adicionado",
        description: "O motivo foi adicionado ao histórico do ticket.",
      });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      onSuccess();
    } else {
      toast({
        variant: "destructive",
        title: "Erro ao adicionar motivo",
        description: "Não foi possível adicionar o motivo ao ticket.",
      });
    }
  };

  const handleFaturarTicket = async (ticketId: string) => {
    try {
      // Update ticket to faturado
      const { data, error } = await supabase
        .from("tickets")
        .update({ 
          faturado: true,
          faturado_at: new Date().toISOString()
        })
        .eq("id", ticketId)
        .select()

      if (error) throw error;

      // Optionally, create a history record for faturamento
      const { error: historyError } = await supabase
        .from("ticket_history")
        .insert({
          ticket_id: ticketId,
          status: data[0].status,
          reason: "Ticket faturado",
          created_by: currentUser?.id || "",
          action_type: "STATUS_CHANGE"
        });

      if (historyError) throw historyError;

      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      onSuccess();
    } catch (error) {
      console.error("Erro ao faturar ticket:", error);
      toast({
        variant: "destructive",
        title: "Erro ao faturar ticket",
        description: "Não foi possível faturar este ticket.",
      });
    }
  };

  const handleMarkEquipmentAsDelivered = async (equipmentId: string, equipmentCode: string, ticketId: string, ticketStatus: string) => {
    try {
      // Update equipment status to "ENTREGUE"
      const { error: equipmentError } = await supabase
        .from("equipamentos")
        .update({ 
          status: "ENTREGUE",
          entregue_at: new Date().toISOString()
        })
        .eq("id", equipmentId);
  
      if (equipmentError) throw equipmentError;
  
      // Create history record for equipment delivery
      const { error: historyError } = await supabase
        .from("ticket_history")
        .insert({
          ticket_id: ticketId,
          status: ticketStatus,
          reason: `Equipamento ${equipmentCode} marcado como entregue`,
          created_by: currentUser?.id || "",
          action_type: "EQUIPMENT_STATUS",
          equipment_id: equipmentId,
          equipment_codigo: equipmentCode,
          equipment_status: "ENTREGUE"
        });
  
      if (historyError) throw historyError;
  
      toast({
        title: "Equipamento marcado como entregue",
        description: `O equipamento ${equipmentCode} foi marcado como entregue.`,
      });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      onSuccess();
    } catch (error) {
      console.error("Erro ao marcar equipamento como entregue:", error);
      toast({
        variant: "destructive",
        title: "Erro ao marcar equipamento como entregue",
        description: "Não foi possível marcar este equipamento como entregue.",
      });
    }
  };

  return {
    handleStatusChange,
    handleAssignTicket,
    handleReasonSubmit,
    handleFaturarTicket,
    handleMarkEquipmentAsDelivered
  };
}
