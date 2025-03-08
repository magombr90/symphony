
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Ticket } from "@/types/ticket";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../use-auth";

export function useTicketActions(tickets: Ticket[], onSuccess: () => void) {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  // Helper function to get current user ID, with fallback to Supabase auth
  const getCurrentUserId = async (): Promise<string | null> => {
    // First try to get from React Query cache
    if (currentUser?.id) {
      console.log("Using cached user ID:", currentUser.id);
      return currentUser.id;
    }
    
    // If not in cache, try to get directly from Supabase auth
    try {
      // Attempt to check session first
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
      } else if (sessionData.session?.user.id) {
        console.log("Using session user ID:", sessionData.session.user.id);
        return sessionData.session.user.id;
      }
      
      // If session doesn't work, try getUser
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error("Error fetching auth user:", error);
        
        // If the error is related to missing session, check if there's a token in localStorage
        if (error.message === "Auth session missing!") {
          const localSession = localStorage.getItem('supabase.auth.token');
          if (localSession) {
            console.log("Found session in localStorage, will attempt to refresh");
            try {
              const { data: refreshData } = await supabase.auth.refreshSession();
              if (refreshData.session?.user.id) {
                console.log("Session refreshed, using user ID:", refreshData.session.user.id);
                return refreshData.session.user.id;
              }
            } catch (refreshError) {
              console.error("Error refreshing session:", refreshError);
            }
          }
        }
        
        return null;
      }
      
      if (data?.user?.id) {
        console.log("Using Supabase auth user ID:", data.user.id);
        return data.user.id;
      }
      
      console.error("No user found in Supabase auth");
      return null;
    } catch (error) {
      console.error("Unexpected error in getCurrentUserId:", error);
      return null;
    }
  };

  const handleStatusChange = async (ticketId: string, newStatus: string, reason?: string) => {
    try {
      console.log("Current user:", currentUser);
      
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
    handleStatusChange,
    handleAssignTicket,
    handleReasonSubmit,
    handleFaturarTicket,
    handleMarkEquipmentAsDelivered,
    handleAddProgressNote
  };
}
