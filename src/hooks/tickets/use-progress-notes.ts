
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUserId } from "./use-auth-utils";

export function useProgressNotes(onSuccess: () => void) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleAddProgressNote = async (ticketId: string, progressNote: string, currentStatus: string): Promise<boolean> => {
    try {
      console.log("Adding progress note to ticket:", ticketId);
      
      // Get current user ID with fallback
      const userId = await getCurrentUserId();
      
      // No user ID, show an error
      if (!userId) {
        console.error("User ID is missing for ticket history - not authenticated");
        toast({
          variant: "destructive",
          title: "Erro na autenticação",
          description: "Não foi possível identificar o usuário atual. Por favor, faça login novamente.",
        });
        return false;
      }

      console.log("Progress note will be added by user:", userId);

      // Create progress note history record
      const { error: historyError } = await supabase
        .from("ticket_history")
        .insert({
          ticket_id: ticketId,
          status: currentStatus,
          reason: progressNote,
          created_by: userId,
          action_type: "PROGRESS_NOTE"
        });

      if (historyError) {
        console.error("Error adding progress note:", historyError);
        throw historyError;
      }

      toast({
        title: "Andamento registrado",
        description: "O andamento do ticket foi registrado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      onSuccess();
      return true;
    } catch (error) {
      console.error("Erro ao adicionar andamento:", error);
      toast({
        variant: "destructive",
        title: "Erro ao registrar andamento",
        description: "Não foi possível registrar o andamento deste ticket.",
      });
      return false;
    }
  };

  return {
    handleAddProgressNote
  };
}
