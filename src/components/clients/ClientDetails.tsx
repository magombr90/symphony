
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";
import { Client } from "@/types/client";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

interface ClientDetailsProps {
  client: Client;
  onEdit: (client: Client) => void;
}

export function ClientDetails({ client, onEdit }: ClientDetailsProps) {
  const { data: tickets } = useQuery({
    queryKey: ["client-tickets", client.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tickets")
        .select(`
          *,
          assigned_user:system_users!tickets_assigned_to_fkey(name)
        `)
        .eq("client_id", client.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

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
    <div className="mt-6 space-y-8">
      <div className="space-y-4">
        <div>
          <Label className="text-muted-foreground">CNPJ</Label>
          <p className="text-lg">{client.cnpj}</p>
        </div>
        <div>
          <Label className="text-muted-foreground">Razão Social</Label>
          <p className="text-lg">{client.razao_social}</p>
        </div>
        <div>
          <Label className="text-muted-foreground">CEP</Label>
          <p className="text-lg">{client.cep || "-"}</p>
        </div>
        <div>
          <Label className="text-muted-foreground">Endereço</Label>
          <p className="text-lg">{client.endereco || "-"}</p>
        </div>
        <div>
          <Label className="text-muted-foreground">Telefone</Label>
          <p className="text-lg">{client.telefone || "-"}</p>
        </div>
        <div>
          <Label className="text-muted-foreground">Email</Label>
          <p className="text-lg">{client.email || "-"}</p>
        </div>
        <div>
          <Label className="text-muted-foreground">Observações</Label>
          <p className="text-lg whitespace-pre-wrap">{client.observacoes || "-"}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Histórico de Tickets</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data Agendada</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Faturado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets?.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell>{ticket.codigo}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(ticket.status)}>
                    {getStatusLabel(ticket.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(ticket.scheduled_for), "dd/MM/yyyy HH:mm")}
                </TableCell>
                <TableCell>{ticket.assigned_user?.name || "-"}</TableCell>
                <TableCell>
                  {ticket.faturado ? (
                    <Badge variant="outline" className="bg-green-50">
                      Sim
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-yellow-50">
                      Não
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {!tickets?.length && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  Nenhum ticket encontrado para este cliente.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end gap-2">
        <Button 
          variant="outline"
          size="icon"
          onClick={() => onEdit(client)}
          title="Editar"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
