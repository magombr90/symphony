
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Ticket, SystemUser, TicketHistory } from "@/types/ticket";
import { startOfDay, endOfDay } from "date-fns";
import { DateRange } from "react-day-picker";
import { useAuth } from "@/hooks/use-auth";

export function useTicketQueries(
  searchTerm: string,
  statusFilter: string | null,
  dateFilter: DateRange | undefined,
  selectedTicketDetails: Ticket | null
) {
  const { currentUser, isAdmin } = useAuth();

  const { data: tickets, refetch } = useQuery({
    queryKey: ["tickets", searchTerm, statusFilter, dateFilter],
    queryFn: async () => {
      const { data: equipmentData } = await supabase
        .from("equipamentos")
        .select("*")
        .order("created_at", { ascending: false });

      let query = supabase
        .from("tickets_with_equipment")
        .select(`
          *,
          client:clients(id, razao_social),
          assigned_user:system_users!tickets_assigned_to_fkey(id, name)
        `);

      // Filtrar tickets por usuário se não for admin
      if (!isAdmin && currentUser) {
        query = query.or(`assigned_to.eq.${currentUser.id},created_by.eq.${currentUser.id}`);
      }

      if (searchTerm) {
        const searchPattern = `%${searchTerm}%`;
        const { data: clientsData } = await supabase
          .from("clients")
          .select("id")
          .ilike("razao_social", searchPattern);

        const { data: usersData } = await supabase
          .from("system_users")
          .select("id")
          .ilike("name", searchPattern);

        const clientIds = clientsData?.map(c => c.id) || [];
        const userIds = usersData?.map(u => u.id) || [];

        query = query.or(`
          codigo.ilike.${searchPattern},
          client_id.in.(${clientIds.join(',')}),
          assigned_to.in.(${userIds.join(',')})
        `);
      }

      if (statusFilter) {
        query = query.eq("status", statusFilter);
      }

      if (dateFilter?.from) {
        query = query.gte("created_at", startOfDay(dateFilter.from).toISOString());
        
        if (dateFilter.to) {
          query = query.lte("created_at", endOfDay(dateFilter.to).toISOString());
        }
      }

      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      // Map equipment data to tickets with proper type handling
      const mappedTickets = (data || []).map(ticket => {
        const ticketEquipments = equipmentData?.filter(eq => eq.ticket_id === ticket.id) || [];
        
        // Create a properly typed ticket object with all required properties
        const typedTicket: Ticket = {
          ...ticket,
          // Add these properties with explicit defaults since they might not be in the view
          started_at: null,  // Default to null since it doesn't exist in the view
          time_spent: null,  // Default to null since it doesn't exist in the view
          equipamentos: ticketEquipments.map(eq => ({
            id: eq.id,
            codigo: eq.codigo,
            equipamento: eq.equipamento,
            numero_serie: eq.numero_serie,
            condicao: eq.condicao,
            observacoes: eq.observacoes,
            // Ensure status is cast to one of the allowed values
            status: (eq.status === "ENTREGUE" ? "ENTREGUE" : "RETIRADO") as "RETIRADO" | "ENTREGUE",
            entregue_at: eq.entregue_at || null
          }))
        };
        
        return typedTicket;
      });
      
      return mappedTickets;
    },
  });

  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("*");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: systemUsers } = useQuery({
    queryKey: ["system-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_users")
        .select("*")
        .eq("active", true);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: ticketHistory } = useQuery({
    queryKey: ["ticket-history", selectedTicketDetails?.id],
    enabled: !!selectedTicketDetails?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_history")
        .select(`
          *,
          created_by_user:system_users!ticket_history_created_by_fkey(name),
          previous_assigned_to_user:system_users!fk_previous_assigned_to(name),
          new_assigned_to_user:system_users!fk_new_assigned_to(name)
        `)
        .eq("ticket_id", selectedTicketDetails?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map(item => ({
        ...item,
        action_type: item.action_type as "STATUS_CHANGE" | "USER_ASSIGNMENT" | "EQUIPMENT_STATUS"
      })) as TicketHistory[];
    },
  });

  return {
    tickets,
    clients,
    systemUsers,
    ticketHistory,
    refetch,
  };
}
