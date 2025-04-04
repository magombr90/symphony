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

      // Get current user
      let userId = currentUser?.id;
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id;
        
        if (!userId) {
          toast({
            variant: "destructive",
            title: "Erro ao autenticar",
            description: "Usuário não encontrado.",
          });
          return false;
        }
      }

      // Verifica se o usuário já moveu o ticket (exceto para admins)
      if (!isAdmin && userId) {
        const { data: canMove } = await supabase
          .rpc('can_move_ticket', { 
            ticket_id: ticketId, 
            user_id: userId 
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

      // Primeiro obter o status atual para registrar no histórico
      const { data: currentTicket } = await supabase
        .from("tickets")
        .select("status")
        .eq("id", ticketId)
        .single();

      const previousStatus = currentTicket?.status;

      // Atualiza o status do ticket
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

      // Um motivo é obrigatório para cancelamentos e conclusões
      if ((newStatus === "CANCELADO" || newStatus === "CONCLUIDO") && !reasonText) {
        toast({
          variant: "destructive",
          title: "Motivo obrigatório",
          description: `É necessário informar o motivo para ${newStatus === "CANCELADO" ? "cancelar" : "concluir"} o ticket.`,
        });
        return false;
      }

      // Registrar o histórico independentemente do motivo
      if (userId) {
        console.log("Registrando histórico com motivo:", { reasonText });

        const historyData = {
          ticket_id: ticketId,
          status: newStatus,
          reason: reasonText || null,
          created_by: userId,
          action_type: 'STATUS_CHANGE',
          previous_status: previousStatus
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
      // Get current user
      let userId = currentUser?.id;
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id;
        
        if (!userId) {
          toast({
            variant: "destructive",
            title: "Erro ao autenticar",
            description: "Usuário não encontrado.",
          });
          return false;
        }
      }

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

      if (userId) {
        const historyData = {
          ticket_id: ticketId,
          action_type: 'USER_ASSIGNMENT',
          status: ticket?.status,
          previous_assigned_to: currentAssignedTo,
          new_assigned_to: newUserId,
          created_by: userId,
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
      
      if (!equipmentId || !equipmentCode) {
        console.error("ID do equipamento ou código não fornecido");
        toast({
          variant: "destructive",
          title: "Erro ao atualizar equipamento",
          description: "Identificação do equipamento não fornecida corretamente.",
        });
        return false;
      }
      
      // Get current user
      let userId = currentUser?.id;
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id;
        
        if (!userId) {
          toast({
            variant: "destructive",
            title: "Erro ao autenticar",
            description: "Usuário não encontrado.",
          });
          return false;
        }
      }
      
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
        toast({
          variant: "destructive",
          title: "Erro ao atualizar equipamento",
          description: equipmentError.message,
        });
        return false;
      }

      // Registrar no histórico do ticket
      if (userId) {
        const historyData = {
          ticket_id: ticketId,
          status: ticketStatus,
          created_by: userId,
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
          toast({
            variant: "destructive",
            title: "Erro ao registrar histórico",
            description: historyError.message,
          });
          return false;
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

  const addProgressNote = async (ticketId: string, note: string, ticketStatus: string) => {
    try {
      if (!note.trim()) {
        return false;
      }

      console.log("Adding progress note:", { ticketId, note, ticketStatus });

      // Get current user
      let userId = currentUser?.id;
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id;
        
        if (!userId) {
          toast({
            variant: "destructive",
            title: "Erro ao registrar andamento",
            description: "Você precisa estar autenticado para registrar andamentos.",
          });
          return false;
        }
      }
      
      // Get the current ticket status to store as previous_status
      const { data: ticketData } = await supabase
        .from("tickets")
        .select("status")
        .eq("id", ticketId)
        .single();

      const currentStatus = ticketData?.status || ticketStatus;

      // Register progress note in ticket history
      const historyData = {
        ticket_id: ticketId,
        status: currentStatus,
        reason: note,
        created_by: userId,
        action_type: 'PROGRESS_NOTE',
        previous_status: currentStatus
      };

      console.log("Sending history data:", historyData);

      const { data: historyResult, error: historyError } = await supabase
        .from("ticket_history")
        .insert([historyData])
        .select();

      console.log("Progress note history result:", { historyResult, historyError });

      if (historyError) {
        console.error("Error registering progress:", historyError);
        toast({
          variant: "destructive",
          title: "Erro ao registrar andamento",
          description: historyError.message,
        });
        return false;
      }

      toast({
        title: "Andamento registrado com sucesso!",
      });
      refetch();
      return true;
    } catch (error) {
      console.error("Erro ao registrar andamento:", error);
      toast({
        variant: "destructive",
        title: "Erro ao registrar andamento",
        description: "Ocorreu um erro ao registrar o andamento. Tente novamente.",
      });
      return false;
    }
  };

  return {
    handleFaturarTicket,
    updateTicketStatus,
    handleAssignTicket,
    handleMarkEquipmentAsDelivered,
    addProgressNote,
  };
}
