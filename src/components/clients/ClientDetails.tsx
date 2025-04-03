
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, Pencil, Search } from "lucide-react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface ClientDetailsProps {
  client: Client;
  onEdit: (client: Client) => void;
}

export function ClientDetails({ client, onEdit }: ClientDetailsProps) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: tickets } = useQuery({
    queryKey: ["client-tickets", client.id, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("tickets")
        .select(`
          *,
          assigned_user:system_users!tickets_assigned_to_fkey(name)
        `)
        .eq("client_id", client.id);

      if (searchTerm) {
        query = query.ilike('codigo', `%${searchTerm}%`);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      
      // Process data to handle relation errors
      return data?.map(ticket => ({
        ...ticket,
        assigned_user: ticket.assigned_user?.error 
          ? { name: 'Não atribuído' } 
          : ticket.assigned_user
      }));
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

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => setIsHistoryOpen(true)}
        >
          <Eye className="h-4 w-4 mr-2" />
          Histórico de Tickets
        </Button>
        <Button 
          variant="outline"
          size="icon"
          onClick={() => onEdit(client)}
          title="Editar"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Histórico de Tickets - {client.razao_social}</DialogTitle>
            <DialogDescription>
              Visualize todos os tickets associados a este cliente
            </DialogDescription>
          </DialogHeader>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Buscar por número do ticket..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex-1 overflow-auto">
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
        </DialogContent>
      </Dialog>
    </div>
  );
}
