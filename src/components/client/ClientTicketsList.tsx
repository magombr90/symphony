
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Eye } from "lucide-react";
import { ClientTicketDetails } from "./ClientTicketDetails";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type ClientTicket = {
  id: string;
  codigo: string;
  status: string;
  description: string;
  scheduled_for: string;
  created_at: string;
  assigned_user?: { name: string } | null;
};

interface ClientTicketsListProps {
  clientId: string;
}

export function ClientTicketsList({ clientId }: ClientTicketsListProps) {
  const [tickets, setTickets] = useState<ClientTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<ClientTicket | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<ClientTicket[]>([]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("tickets_with_equipment")
        .select(`
          id,
          codigo,
          status,
          description,
          scheduled_for,
          created_at,
          assigned_user:system_users!tickets_assigned_to_fkey(name)
        `)
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Transform the data to ensure assigned_user has the correct shape
      const transformedData = (data || []).map(ticket => {
        // Handle the case when assigned_user is an error object
        const assignedUser = ticket.assigned_user && 
          typeof ticket.assigned_user === 'object' && 
          !('error' in ticket.assigned_user) ? 
          ticket.assigned_user : { name: "Não disponível" };
          
        return {
          ...ticket,
          assigned_user: assignedUser
        };
      }) as ClientTicket[];
      
      setTickets(transformedData);
      
      // Filtrar tickets com agendamento nos próximos 3 dias
      const now = new Date();
      const threeDaysLater = new Date();
      threeDaysLater.setDate(now.getDate() + 3);
      
      const upcoming = transformedData.filter(ticket => {
        const scheduledDate = new Date(ticket.scheduled_for);
        return scheduledDate > now && scheduledDate < threeDaysLater && 
               (ticket.status === "PENDENTE" || ticket.status === "EM_ANDAMENTO");
      });
      
      setUpcomingAppointments(upcoming);
    } catch (error) {
      console.error("Erro ao buscar tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [clientId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDENTE":
        return "bg-yellow-500";
      case "EM_ANDAMENTO":
        return "bg-blue-500";
      case "CONCLUIDO":
        return "bg-green-500";
      case "CANCELADO":
        return "bg-red-500";
      case "FATURADO":
        return "bg-green-700";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDENTE":
        return "Pendente";
      case "EM_ANDAMENTO":
        return "Em Andamento";
      case "CONCLUIDO":
        return "Concluído";
      case "CANCELADO":
        return "Cancelado";
      case "FATURADO":
        return "Faturado";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {upcomingAppointments.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Atendimentos Agendados</AlertTitle>
          <AlertDescription>
            {upcomingAppointments.map((ticket) => (
              <div key={ticket.id} className="mt-2">
                <strong>{format(new Date(ticket.scheduled_for), "dd/MM/yyyy HH:mm")}</strong> - Ticket {ticket.codigo}
              </div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Meus Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Carregando...</div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              Você ainda não possui tickets. Crie uma nova solicitação.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Agendada</TableHead>
                  <TableHead>Técnico</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium">{ticket.codigo}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(ticket.status)}>
                        {getStatusLabel(ticket.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(ticket.scheduled_for), "dd/MM/yyyy HH:mm")}
                    </TableCell>
                    <TableCell>
                      {ticket.assigned_user?.name || "Não atribuído"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedTicket && (
        <ClientTicketDetails 
          ticket={selectedTicket} 
          onClose={() => setSelectedTicket(null)} 
        />
      )}
    </div>
  );
}
