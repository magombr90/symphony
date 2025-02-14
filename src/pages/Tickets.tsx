
import { Button } from "@/components/ui/button";
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
import { Plus } from "lucide-react";
import { useSearchParams } from "react-router-dom";

const mockTickets = [
  {
    id: "TICK-001",
    client: "Empresa Exemplo Ltda",
    description: "Problema com sistema X",
    status: "ABERTO",
    createdAt: "2024-03-20 14:30",
    scheduledFor: "2024-03-21 10:00",
  },
  {
    id: "TICK-002",
    client: "Empresa ABC Ltda",
    description: "Manutenção preventiva",
    status: "ATENDENDO",
    createdAt: "2024-03-20 15:30",
    scheduledFor: "2024-03-21 14:00",
  },
  {
    id: "TICK-003",
    client: "Empresa XYZ Ltda",
    description: "Atualização de sistema",
    status: "FECHADO",
    createdAt: "2024-03-20 16:30",
    scheduledFor: "2024-03-20 17:00",
  },
];

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

  const filteredTickets = statusFilter 
    ? mockTickets.filter(ticket => ticket.status === statusFilter)
    : mockTickets;

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
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Ticket
        </Button>
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
              {filteredTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">{ticket.id}</TableCell>
                  <TableCell>{ticket.client}</TableCell>
                  <TableCell>{ticket.description}</TableCell>
                  <TableCell>{ticket.scheduledFor}</TableCell>
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
