
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

      return (data || []).map(ticket => ({
        ...ticket,
        equipamentos: ticket.equipamentos as Ticket['equipamentos']
      })) as Ticket[];
    },
  });

  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("*");
      if (error) throw error;
      return data;
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
      return data as SystemUser[];
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
      return data as TicketHistory[];
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
