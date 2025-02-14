
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "react-router-dom";
import { useTickets } from "@/hooks/use-tickets";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CreateTicketDialog } from "@/components/tickets/create-ticket-dialog";

const getStatusColor = (status: string) => {
  switch (status) {
    case "ABERTO":
      return "bg-blue-500";
    case "ATENDENDO":
      return "bg-yellow-500";
    case "FECHADO":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
};

export default function Tickets() {
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get("status");
  const { tickets, isLoading } = useTickets(statusFilter || undefined);

  if (isLoading) {
    return (
      <div className="fade-in">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Tickets</h1>
            {statusFilter && (
              <p className="text-muted-foreground mt-2">
                Filtrando por status: {statusFilter}
              </p>
            )}
          </div>
          <CreateTicketDialog />
        </div>

        <Card className="slide-in">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Tickets</h1>
          {statusFilter && (
            <p className="text-muted-foreground mt-2">
              Filtrando por status: {statusFilter}
            </p>
          )}
        </div>
        <CreateTicketDialog />
      </div>

      <Card className="slide-in">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Agendamento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets?.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">{ticket.codigo}</TableCell>
                  <TableCell>{ticket.clients.razao_social}</TableCell>
                  <TableCell>{ticket.description}</TableCell>
                  <TableCell>
                    {format(new Date(ticket.scheduled_for), "PPp", {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(ticket.status)}>
                      {ticket.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      Detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
