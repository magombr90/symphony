
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Ticket } from "@/types/ticket";
import { getCurrentUserId } from "./use-auth-utils";

export function useTicketStatus(tickets: Ticket[], onSuccess: () => void) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleStatusChange = async (ticketId: string, newStatus: string, reason?: string) => {
    try {
      // Get current user ID
      const userId = await getCurrentUserId();
      if (!userId) {
        console.error("User ID is missing for ticket history");
        toast({
          variant: "destructive",
          title: "Erro na autenticação",
          description: "Não foi possível identificar o usuário atual. Por favor, faça login novamente.",
        });
        return false;
      }
      
      // Get the ticket information to pass the old status
      const ticket = tickets.find(t => t.id === ticketId);
      if (!ticket) throw new Error("Ticket não encontrado");
      
      const oldStatus = ticket.status;

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
          created_by: userId,
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

  const handleReasonSubmit = async (ticketId: string, newStatus: string, oldStatus: string, reason: string): Promise<boolean> => {
    const success = await handleStatusChange(ticketId, newStatus, reason);
    if (success) {
      toast({
        title: "Motivo adicionado",
        description: "O motivo foi adicionado ao histórico do ticket.",
      });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      onSuccess();
      return true;
    } else {
      toast({
        variant: "destructive",
        title: "Erro ao adicionar motivo",
        description: "Não foi possível adicionar o motivo ao ticket.",
      });
      return false;
    }
  };

  return {
    handleStatusChange,
    handleReasonSubmit
  };
}
