
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Ticket } from "@/types/ticket";
import { getCurrentUserId } from "./use-auth-utils";

export function useEquipmentActions(onSuccess: () => void) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleMarkEquipmentAsDelivered = async (equipmentId: string, equipmentCode: string, ticketId: string, ticketStatus: string) => {
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
          created_by: userId,
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
      return true;
    } catch (error) {
      console.error("Erro ao marcar equipamento como entregue:", error);
      toast({
        variant: "destructive",
        title: "Erro ao marcar equipamento como entregue",
        description: "Não foi possível marcar este equipamento como entregue.",
      });
      return false;
    }
  };

  return {
    handleMarkEquipmentAsDelivered
  };
}
