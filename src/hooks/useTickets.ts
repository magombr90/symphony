
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useTickets(searchTerm: string, statusFilter: string | null) {
  return useQuery({
    queryKey: ["tickets", searchTerm, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("tickets")
        .select(`
          *,
          client:clients(razao_social),
          assigned_user:system_users!tickets_assigned_to_fkey(name)
        `)
        .order("created_at", { ascending: false });

      if (searchTerm) {
        query = query.or(`
          codigo.ilike.%${searchTerm}%,
          clients.razao_social.ilike.%${searchTerm}%
        `);
      }

      if (statusFilter) {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}
