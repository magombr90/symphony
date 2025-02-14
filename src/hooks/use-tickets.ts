
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

export interface Ticket {
  id: string;
  codigo: string;
  client_id: string;
  description: string;
  status: "ABERTO" | "ATENDENDO" | "FECHADO";
  scheduled_for: string;
  assigned_to: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Incluímos os dados do cliente diretamente na consulta
  clients: {
    razao_social: string;
  };
}

export const useTickets = (status?: string) => {
  const queryClient = useQueryClient();

  const { data: tickets, isLoading } = useQuery({
    queryKey: ["tickets", status],
    queryFn: async () => {
      let query = supabase
        .from("tickets")
        .select(`
          *,
          clients (
            razao_social
          )
        `)
        .order("scheduled_for", { ascending: true });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;

      if (error) {
        toast({
          title: "Erro ao carregar tickets",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      return data as Ticket[];
    },
  });

  const createTicket = useMutation({
    mutationFn: async (newTicket: Omit<Ticket, "id" | "codigo" | "created_at" | "updated_at" | "clients">) => {
      const { data, error } = await supabase
        .from("tickets")
        .insert([newTicket])
        .select(`
          *,
          clients (
            razao_social
          )
        `)
        .single();

      if (error) {
        toast({
          title: "Erro ao criar ticket",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast({
        title: "Ticket criado com sucesso",
        description: "O novo ticket foi adicionado ao sistema.",
      });
    },
  });

  const updateTicket = useMutation({
    mutationFn: async (ticket: Partial<Ticket> & { id: string }) => {
      const { data, error } = await supabase
        .from("tickets")
        .update(ticket)
        .eq("id", ticket.id)
        .select(`
          *,
          clients (
            razao_social
          )
        `)
        .single();

      if (error) {
        toast({
          title: "Erro ao atualizar ticket",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast({
        title: "Ticket atualizado com sucesso",
        description: "As informações do ticket foram atualizadas.",
      });
    },
  });

  return {
    tickets,
    isLoading,
    createTicket,
    updateTicket,
  };
};
