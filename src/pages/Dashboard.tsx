
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TicketsTable } from "@/components/tickets/TicketsTable";
import { startOfDay } from "date-fns";

export default function Dashboard() {
  const { data: tickets } = useQuery({
    queryKey: ["dashboard-tickets"],
    queryFn: async () => {
      const today = startOfDay(new Date());
      
      let query = supabase
        .from("tickets")
        .select(`
          *,
          client:clients(razao_social),
          assigned_user:system_users!tickets_assigned_to_fkey(name)
        `)
        .or('status.eq.pending,status.eq.in_progress')
        .lte('scheduled_for', today.toISOString());

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Tickets Ativos</h2>
        <TicketsTable
          tickets={tickets || []}
          onStatusChange={() => {}}
          onViewDetails={() => {}}
        />
      </div>
    </div>
  );
}
