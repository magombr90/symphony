
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUserId } from "./use-auth-utils";

export function useTicketAssignment(onSuccess: () => void) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleAssignTicket = async (ticketId: string, userId: string, previousUserId: string | null) => {
    try {
      // Get current user ID
      const currentUserId = await getCurrentUserId();
      if (!currentUserId) {
        toast({
          variant: "destructive",
          title: "Erro na autenticação",
          description: "Não foi possível identificar o usuário atual. Por favor, faça login novamente.",
        });
        return false;
      }
      
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
          created_by: currentUserId,
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

  return {
    handleAssignTicket
  };
}
