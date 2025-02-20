
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SystemUser } from "@/types/ticket";

export function useTicketActions(systemUsers: SystemUser[] | undefined, refetch: () => void) {
  const { toast } = useToast();

  const handleFaturarTicket = async (ticketId: string) => {
    const { error } = await supabase
      .from("tickets")
      .update({
        faturado: true,
        status: "FATURADO",
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
      const { error: updateError } = await supabase
        .from("tickets")
        .update({ status: newStatus })
        .eq("id", ticketId);

      if (updateError) {
        toast({
          variant: "destructive",
          title: "Erro ao atualizar status",
          description: updateError.message,
        });
        return;
      }

      if (reasonText) {
        const historyData = {
          ticket_id: ticketId,
          status: newStatus,
          reason: reasonText,
          created_by: systemUsers?.[0]?.id,
        };

        const { error: historyError } = await supabase
          .from("ticket_history")
          .insert([historyData]);

        if (historyError) {
          toast({
            variant: "destructive",
            title: "Erro ao registrar histórico",
            description: historyError.message,
          });
          return;
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

      const historyData = {
        ticket_id: ticketId,
        action_type: 'USER_ASSIGNMENT',
        status: ticket.status, // Include the current ticket status
        previous_assigned_to: currentAssignedTo,
        new_assigned_to: newUserId,
        created_by: systemUsers?.[0]?.id,
      };

      const { error: historyError } = await supabase
        .from("ticket_history")
        .insert([historyData]);

      if (historyError) throw historyError;

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

  return {
    handleFaturarTicket,
    updateTicketStatus,
    handleAssignTicket,
  };
}
