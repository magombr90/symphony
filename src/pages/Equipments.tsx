import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { TicketDetails } from "@/components/tickets/TicketDetails";
import { TicketHistory } from "@/types/ticket";

type Equipment = {
  id: string;
  codigo: string;
  equipamento: string;
  numero_serie: string | null;
  condicao: 'NOVO' | 'USADO' | 'DEFEITO';
  observacoes: string | null;
  client: {
    razao_social: string;
  };
  ticket: {
    id: string;
    codigo: string;
    status: string;
    description: string;
    client_id: string;
    scheduled_for: string;
    assigned_to: string | null;
    created_by: string;
    created_at: string;
    updated_at: string;
    faturado: boolean;
    faturado_at: string | null;
    client: {
      razao_social: string;
    };
    assigned_user?: {
      name: string | null;
    } | null;
    equipamentos?: Array<{
      codigo: string;
      equipamento: string;
      numero_serie: string | null;
      condicao: string;
      observacoes: string | null;
    }>;
  } | null;
};

export default function Equipments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<Equipment["ticket"] | null>(null);
  const { toast } = useToast();

  const { data: equipments } = useQuery({
    queryKey: ["equipments", searchTerm],
    queryFn: async () => {
      console.log("Iniciando consulta de equipamentos");

      let query = supabase
        .from("equipamentos")
        .select(`
          *,
          client:clients(razao_social),
          ticket:tickets(
            id,
            codigo,
            status,
            description,
            client_id,
            scheduled_for,
            assigned_to,
            created_by,
            created_at,
            updated_at,
            faturado,
            faturado_at,
            client:clients(razao_social),
            assigned_user:system_users!tickets_assigned_to_fkey(name)
          )
        `);

      if (searchTerm) {
        query = query.or(`
          codigo.ilike.%${searchTerm}%,
          equipamento.ilike.%${searchTerm}%,
          numero_serie.ilike.%${searchTerm}%
        `);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) {
        console.error("Erro na consulta:", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar equipamentos",
          description: error.message,
        });
        throw error;
      }

      console.log("Dados retornados:", data);
      return data as Equipment[];
    },
  });

  const { data: ticketHistory } = useQuery({
    queryKey: ["ticket-history", selectedTicket?.id],
    enabled: !!selectedTicket?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_history")
        .select(`
          *,
          created_by_user:system_users!ticket_history_created_by_fkey(name),
          previous_assigned_to_user:system_users!fk_previous_assigned_to(name),
          new_assigned_to_user:system_users!fk_new_assigned_to(name)
        `)
        .eq("ticket_id", selectedTicket?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as TicketHistory[];
    },
  });

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Equipamentos</h1>
      
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        <Input
          placeholder="Buscar por código, equipamento ou número de série..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Equipamento</TableHead>
                <TableHead>Nº Série</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Nº Ticket</TableHead>
                <TableHead>Condição</TableHead>
                <TableHead className="w-[50px]">Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipments?.map((equipment) => (
                <TableRow key={equipment.id}>
                  <TableCell>{equipment.codigo}</TableCell>
                  <TableCell>{equipment.equipamento}</TableCell>
                  <TableCell>{equipment.numero_serie || "-"}</TableCell>
                  <TableCell>{equipment.client.razao_social}</TableCell>
                  <TableCell>
                    {equipment.ticket?.codigo || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={
                        equipment.condicao === 'NOVO' ? 'bg-green-500' :
                        equipment.condicao === 'USADO' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }
                    >
                      {equipment.condicao}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (!equipment.ticket) {
                          toast({
                            title: "Sem ticket associado",
                            description: "Este equipamento não está associado a nenhum ticket.",
                          });
                          return;
                        }
                        setSelectedTicket(equipment.ticket);
                      }}
                      className="hover:bg-gray-100"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!equipments?.length && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    Nenhum equipamento encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <TicketDetails
        ticket={selectedTicket}
        history={ticketHistory || []}
        onClose={() => setSelectedTicket(null)}
      />
    </div>
  );
}
