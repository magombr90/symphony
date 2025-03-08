
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUserId } from "./use-auth-utils";

export function useTicketBilling(onSuccess: () => void) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFaturarTicket = async (ticketId: string) => {
    try {
      // Get current user ID
      const userId = await getCurrentUserId();
      if (!userId) {
        toast({
          variant: "destructive",
          title: "Erro na autenticação",
          description: "Não foi possível identificar o usuário atual. Por favor, faça login novamente.",
        });
        return false;
      }
      
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
          created_by: userId,
          action_type: "STATUS_CHANGE"
        });

      if (historyError) throw historyError;

      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      onSuccess();
      return true;
    } catch (error) {
      console.error("Erro ao faturar ticket:", error);
      toast({
        variant: "destructive",
        title: "Erro ao faturar ticket",
        description: "Não foi possível faturar este ticket.",
      });
      return false;
    }
  };

  return {
    handleFaturarTicket
  };
}
