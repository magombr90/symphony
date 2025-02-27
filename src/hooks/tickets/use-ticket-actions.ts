
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SystemUser } from "@/types/ticket";
import { useAuth } from "@/hooks/use-auth";

export function useTicketActions(systemUsers: SystemUser[] | undefined, refetch: () => void) {
  const { toast } = useToast();
  const { isAdmin, currentUser } = useAuth();

  const handleFaturarTicket = async (ticketId: string) => {
    const { error } = await supabase
      .from("tickets")
      .update({
        faturado: true,
        status: "FATURADO",
        faturado_at: new Date().toISOString(),
      })
      .eq("id", ticketId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao faturar ticket",
        description: error.message,
      });
      return;
    }

    toast({
      title: "Ticket faturado com sucesso!",
    });
    refetch();
  };

  const updateTicketStatus = async (ticketId: string, newStatus: string, reasonText?: string) => {
    try {
      console.log("Atualizando ticket:", { ticketId, newStatus, reasonText });

      // Verifica se o usuário já moveu o ticket (exceto para admins)
      if (!isAdmin && currentUser?.id) {
        const { data: canMove } = await supabase
          .rpc('can_move_ticket', { 
            ticket_id: ticketId, 
            user_id: currentUser.id 
          });

        if (!canMove) {
          toast({
            variant: "destructive",
            title: "Não é possível mover o ticket",
            description: "Você já moveu este ticket anteriormente.",
          });
          return false;
        }
      }

      // Primeiro atualiza o status do ticket
      const { error: updateError } = await supabase
        .from("tickets")
        .update({ status: newStatus })
        .eq("id", ticketId);

      if (updateError) {
        console.error("Erro ao atualizar status:", updateError);
        toast({
          variant: "destructive",
          title: "Erro ao atualizar status",
          description: updateError.message,
        });
        return false;
      }

      // Registrar o histórico independentemente do motivo
      if (currentUser?.id) {
        console.log("Registrando histórico com motivo:", { reasonText });

        const historyData = {
          ticket_id: ticketId,
          status: newStatus,
          reason: reasonText || null,
          created_by: currentUser.id,
          action_type: 'STATUS_CHANGE'
        };

        const { data: historyResult, error: historyError } = await supabase
          .from("ticket_history")
          .insert([historyData])
          .select();

        console.log("Resultado do registro do histórico:", { historyResult, historyError });

        if (historyError) {
          console.error("Erro ao registrar histórico:", historyError);
          toast({
            variant: "destructive",
            title: "Erro ao registrar histórico",
            description: historyError.message,
          });
          return false;
        }
      }

      toast({
        title: "Status atualizado com sucesso!",
      });
      refetch();
      return true;
    } catch (error) {
      console.error("Erro ao atualizar ticket:", error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar ticket",
        description: "Ocorreu um erro ao atualizar o ticket. Tente novamente.",
      });
      return false;
    }
  };

  const handleAssignTicket = async (ticketId: string, newUserId: string, currentAssignedTo: string | null = null) => {
    try {
      const { data: ticket } = await supabase
        .from("tickets")
        .select("status")
        .eq("id", ticketId)
        .single();

      const { error: updateError } = await supabase
        .from("tickets")
        .update({ assigned_to: newUserId })
        .eq("id", ticketId);

      if (updateError) throw updateError;

      if (currentUser?.id) {
        const historyData = {
          ticket_id: ticketId,
          action_type: 'USER_ASSIGNMENT',
          status: ticket?.status,
          previous_assigned_to: currentAssignedTo,
          new_assigned_to: newUserId,
          created_by: currentUser.id,
        };

        const { error: historyError } = await supabase
          .from("ticket_history")
          .insert([historyData]);

        if (historyError) throw historyError;
      }

      toast({
        title: "Ticket reatribuído com sucesso!",
      });
      refetch();
      return true;
    } catch (error) {
      console.error("Erro ao reatribuir ticket:", error);
      toast({
        variant: "destructive",
        title: "Erro ao reatribuir ticket",
        description: "Ocorreu um erro ao reatribuir o ticket. Tente novamente.",
      });
      return false;
    }
  };

  const handleMarkEquipmentAsDelivered = async (equipmentId: string, equipmentCode: string, ticketId: string, ticketStatus: string) => {
    try {
      console.log("Marcando equipamento como entregue:", { equipmentId, equipmentCode, ticketId });
      
      // Atualizar o status do equipamento para ENTREGUE
      const { error: equipmentError } = await supabase
        .from("equipamentos")
        .update({ 
          status: "ENTREGUE",
          entregue_at: new Date().toISOString() 
        })
        .eq("id", equipmentId);

      if (equipmentError) {
        console.error("Erro ao atualizar equipamento:", equipmentError);
        throw equipmentError;
      }

      // Registrar no histórico do ticket
      if (currentUser?.id) {
        const historyData = {
          ticket_id: ticketId,
          status: ticketStatus,
          created_by: currentUser.id,
          action_type: "EQUIPMENT_STATUS",
          equipment_id: equipmentId,
          equipment_codigo: equipmentCode,
          equipment_status: "ENTREGUE",
          reason: "Equipamento entregue ao cliente."
        };

        const { error: historyError } = await supabase
          .from("ticket_history")
          .insert([historyData]);

        if (historyError) {
          console.error("Erro ao registrar histórico:", historyError);
          throw historyError;
        }
      }

      toast({
        title: "Equipamento entregue",
        description: `O equipamento ${equipmentCode} foi marcado como entregue.`,
      });
      
      refetch();
      return true;
    } catch (error) {
      console.error("Erro ao marcar equipamento como entregue:", error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar equipamento",
        description: "Não foi possível marcar o equipamento como entregue.",
      });
      return false;
    }
  };

  return {
    handleFaturarTicket,
    updateTicketStatus,
    handleAssignTicket,
    handleMarkEquipmentAsDelivered,
  };
}
