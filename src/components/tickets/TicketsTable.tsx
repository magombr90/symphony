
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

type Ticket = {
  id: string;
  codigo: string;
  status: string;
  description: string;
  client_id: string;
  scheduled_for: string;
  client: {
    razao_social: string;
  };
  assigned_user?: {
    name: string | null;
  } | null;
  faturado?: boolean;
};

interface TicketsTableProps {
  tickets: Ticket[];
  onStatusChange: (ticketId: string, newStatus: string) => void;
  onViewDetails: (ticket: Ticket) => void;
  renderActions?: (ticket: Ticket) => React.ReactNode;
}

const statusOptions = [
  { value: "pending", label: "Pendente" },
  { value: "in_progress", label: "Em Andamento" },
  { value: "completed", label: "Concluído" },
  { value: "canceled", label: "Cancelado" },
];

export function TicketsTable({ 
  tickets, 
  onStatusChange, 
  onViewDetails,
  renderActions 
}: TicketsTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "in_progress":
        return "bg-blue-500";
      case "completed":
        return "bg-green-500";
      case "canceled":
        return "bg-red-500";
      case "billed":
        return "bg-green-700";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card className="slide-in">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Data Agendada</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets?.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell>{ticket.codigo}</TableCell>
                <TableCell>{ticket.client.razao_social}</TableCell>
                <TableCell>{ticket.assigned_user?.name}</TableCell>
                <TableCell>{ticket.description}</TableCell>
                <TableCell>
                  {format(new Date(ticket.scheduled_for), "dd/MM/yyyy HH:mm")}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(ticket.status)}>
                    {statusOptions.find((s) => s.value === ticket.status)?.label || "Faturado"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails(ticket)}
                    >
                      Detalhes
                    </Button>
                    {!ticket.faturado && (
                      <Select
                        value={ticket.status}
                        onValueChange={(value) => onStatusChange(ticket.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue>Alterar Status</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {renderActions?.(ticket)}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
