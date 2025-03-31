
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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { TicketDetails } from "@/components/tickets/TicketDetails";
import { Ticket, TicketHistory } from "@/types/ticket";
import { CreateEquipmentDialog } from "@/components/equipments/CreateEquipmentDialog";
import { EditEquipmentDialog } from "@/components/equipments/EditEquipmentDialog";
import { AssociateTicketDialog } from "@/components/equipments/AssociateTicketDialog";
import { DeleteEquipmentDialog } from "@/components/equipments/DeleteEquipmentDialog";

interface SelectQueryError<T> {
  error: true;
}

type EquipmentTicket = {
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
  } | null | SelectQueryError<any>;
} | null;

type Equipment = {
  id: string;
  codigo: string;
  equipamento: string;
  numero_serie: string | null;
  condicao: 'NOVO' | 'USADO' | 'DEFEITO';
  observacoes: string | null;
  client_id: string;
  client: {
    razao_social: string;
  };
  ticket_id: string | null;
  ticket: EquipmentTicket;
};

export default function Equipments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const { toast } = useToast();

  const { data: equipments, refetch } = useQuery({
    queryKey: ["equipments", searchTerm],
    queryFn: async () => {
      console.log("Iniciando consulta de equipamentos");

      let query = supabase
        .from("equipamentos")
        .select(`
          *,
          client:clients(razao_social),
          ticket:tickets!equipamentos_ticket_id_fkey(
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

      // Transform the data to handle relationship errors
      const transformedData = (data || []).map(equipment => {
        // Handle ticket.assigned_user if it exists and is an error
        let transformedTicket = equipment.ticket;
        if (transformedTicket && transformedTicket.assigned_user && 
            typeof transformedTicket.assigned_user === 'object') {
          // Check if it's an error object
          if ('error' in transformedTicket.assigned_user) {
            transformedTicket = {
              ...transformedTicket,
              assigned_user: { name: null } as any
            };
          }
        }

        return {
          ...equipment,
          ticket: transformedTicket
        };
      });

      console.log("Dados processados:", transformedData);
      return transformedData as unknown as Equipment[];
    },
  });

  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("*");
      if (error) throw error;
      return data || [];
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
      
      // Transform data to handle relationship errors
      const transformedData = (data || []).map(item => ({
        ...item,
        created_by_user: item.created_by_user && 
          typeof item.created_by_user === 'object' && 
          !('error' in item.created_by_user) ? 
          item.created_by_user : { name: "Usuário não disponível" },
        previous_assigned_to_user: item.previous_assigned_to_user && 
          typeof item.previous_assigned_to_user === 'object' && 
          !('error' in item.previous_assigned_to_user) ? 
          item.previous_assigned_to_user : { name: null },
        new_assigned_to_user: item.new_assigned_to_user && 
          typeof item.new_assigned_to_user === 'object' && 
          !('error' in item.new_assigned_to_user) ? 
          item.new_assigned_to_user : { name: null }
      }));
      
      return transformedData as unknown as TicketHistory[];
    },
  });

  const handleViewTicket = (ticket: EquipmentTicket) => {
    if (!ticket) return;
    
    // Convert from EquipmentTicket to Ticket format
    const ticketData: Ticket = {
      id: ticket.id,
      codigo: ticket.codigo,
      status: ticket.status,
      description: ticket.description,
      client_id: ticket.client_id,
      scheduled_for: ticket.scheduled_for,
      assigned_to: ticket.assigned_to,
      created_by: ticket.created_by,
      created_at: ticket.created_at,
      updated_at: ticket.updated_at,
      client: ticket.client,
      faturado: ticket.faturado,
      faturado_at: ticket.faturado_at,
      assigned_user: ticket.assigned_user && typeof ticket.assigned_user === 'object' && 
                      !('error' in ticket.assigned_user) ? 
                      ticket.assigned_user : { name: null }
    };
    
    setSelectedTicket(ticketData);
  };

  return (
    <div className="container mx-auto py-6">
      <CardHeader className="flex flex-row items-center justify-between px-0">
        <h1 className="text-3xl font-bold">Equipamentos</h1>
        <CreateEquipmentDialog 
          clients={clients || []} 
          onSuccess={refetch} 
        />
      </CardHeader>
      
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
                <TableHead>Código Ticket</TableHead>
                <TableHead>Condição</TableHead>
                <TableHead className="text-right">Ações</TableHead>
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
                  <TableCell className="text-right space-x-1">
                    <EditEquipmentDialog 
                      equipment={equipment} 
                      clients={clients || []} 
                      onSuccess={refetch} 
                    />
                    {!equipment.ticket_id && (
                      <>
                        <AssociateTicketDialog
                          equipmentId={equipment.id}
                          onSuccess={refetch}
                        />
                        <DeleteEquipmentDialog
                          equipmentId={equipment.id}
                          equipmentCode={equipment.codigo}
                          onSuccess={refetch}
                        />
                      </>
                    )}
                    {equipment.ticket && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewTicket(equipment.ticket)}
                        className="hover:bg-gray-100"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
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
