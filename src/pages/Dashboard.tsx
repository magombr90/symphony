
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TicketStats } from "@/components/tickets/TicketStats";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TicketsTable } from "@/components/tickets/TicketsTable";
import { useState } from "react";
import { 
  CheckSquare, 
  AlertOctagon, 
  Loader, 
  XOctagon,
  User,
  LucideIcon
} from "lucide-react";

type Ticket = {
  id: string;
  codigo: string;
  status: string;
  description: string;
  client_id: string;
  scheduled_for: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  client: {
    razao_social: string;
  };
  assigned_to: string | null;
  assigned_user?: {
    name: string | null;
  } | null;
};

const statusOptions = [
  { value: "PENDENTE", label: "Pendente", icon: AlertOctagon, color: "text-yellow-500" },
  { value: "EM_ANDAMENTO", label: "Em Andamento", icon: Loader, color: "text-blue-500" },
  { value: "CONCLUIDO", label: "Concluído", icon: CheckSquare, color: "text-green-500" },
  { value: "CANCELADO", label: "Cancelado", icon: XOctagon, color: "text-red-500" },
];

export default function Dashboard() {
  const [filterUser, setFilterUser] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [showSheet, setShowSheet] = useState(false);

  const { data: userStats } = useQuery({
    queryKey: ["user-tickets-stats"],
    queryFn: async () => {
      const { data: users } = await supabase
        .from("system_users")
        .select("*")
        .eq("active", true);

      if (!users) return [];

      const stats = await Promise.all(
        users.map(async (user) => {
          const { count: total } = await supabase
            .from("tickets")
            .select("*", { count: "exact", head: true })
            .eq("assigned_to", user.id);

          const { data: inProgress } = await supabase
            .from("tickets")
            .select("*")
            .eq("assigned_to", user.id)
            .eq("status", "EM_ANDAMENTO");

          return {
            user,
            total: total || 0,
            inProgress: inProgress?.length || 0,
          };
        })
      );

      return stats;
    },
  });

  const { data: statusCounts } = useQuery({
    queryKey: ["tickets-count"],
    queryFn: async () => {
      const counts = await Promise.all(
        statusOptions.map(async (status) => {
          const { count } = await supabase
            .from("tickets")
            .select("*", { count: "exact", head: true })
            .eq("status", status.value);
          return {
            status: status.value,
            label: status.label,
            count: count || 0,
          };
        })
      );
      return counts;
    },
  });

  const { data: filteredTickets } = useQuery({
    queryKey: ["filtered-tickets", filterStatus, filterUser],
    enabled: showSheet && (!!filterStatus || !!filterUser),
    queryFn: async () => {
      let query = supabase
        .from("tickets")
        .select(`
          *,
          client:clients(razao_social),
          assigned_user:system_users!tickets_assigned_to_fkey(name)
        `)
        .order("created_at", { ascending: false });

      if (filterStatus) {
        query = query.eq("status", filterStatus);
      }

      if (filterUser) {
        query = query.eq("assigned_to", filterUser);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Ticket[];
    },
  });

  const handleFilterChange = (userId: string | null, status: string | null) => {
    setFilterUser(userId);
    setFilterStatus(status);
    setShowSheet(true);
  };

  const getSheetTitle = () => {
    if (filterUser) {
      const user = userStats?.find(stat => stat.user.id === filterUser);
      return `Tickets de ${user?.user.name}`;
    }
    if (filterStatus) {
      const status = statusOptions.find(s => s.value === filterStatus);
      return `Tickets ${status?.label}`;
    }
    return "Tickets";
  };

  const StatusIcon = filterStatus ? 
    statusOptions.find(s => s.value === filterStatus)?.icon : null;

  return (
    <div className="fade-in">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <TicketStats
        userStats={userStats || []}
        statusCounts={statusCounts || []}
        filterUser={filterUser}
        filterStatus={filterStatus}
        onFilterUserChange={(userId) => handleFilterChange(userId, null)}
        onFilterStatusChange={(status) => handleFilterChange(null, status)}
      />

      <Sheet open={showSheet} onOpenChange={setShowSheet}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              {filterUser && <User className="h-5 w-5" />}
              {StatusIcon && (
                <StatusIcon 
                  className={`h-5 w-5 ${statusOptions.find(s => s.value === filterStatus)?.color}`}
                />
              )}
              {getSheetTitle()}
            </SheetTitle>
          </SheetHeader>
          
          <div className="mt-6">
            <TicketsTable
              tickets={filteredTickets || []}
              onStatusChange={() => {}}
              onViewDetails={() => {}}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
