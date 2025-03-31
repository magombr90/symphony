
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type TicketHistory = {
  id: string;
  status: string;
  reason: string | null;
  created_at: string;
  created_by_user: {
    name: string;
  } | null;
  action_type: string;
  previous_status?: string | null;
};

type Equipment = {
  codigo: string;
  equipamento: string;
  numero_serie: string | null;
  condicao: string;
  observacoes: string | null;
  status?: string;
};

interface ClientTicketDetailsProps {
  ticket: {
    id: string;
    codigo: string;
    status: string;
    description: string;
    scheduled_for: string;
    created_at: string;
  };
  onClose: () => void;
}

export function ClientTicketDetails({ ticket, onClose }: ClientTicketDetailsProps) {
  const [history, setHistory] = useState<TicketHistory[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTicketDetails = async () => {
      setLoading(true);
      try {
        const { data: historyData, error: historyError } = await supabase
          .from("ticket_history")
          .select(`
            id,
            status,
            reason,
            created_at,
            action_type,
            previous_status,
            created_by_user:system_users!ticket_history_created_by_fkey(name)
          `)
          .eq("ticket_id", ticket.id)
          .order("created_at", { ascending: false });

        if (historyError) throw historyError;
        
        const transformedHistory = (historyData || []).map(item => {
          return {
            ...item,
            created_by_user: item.created_by_user && 
              typeof item.created_by_user === 'object' && 
              !('error' in item.created_by_user) ? 
              item.created_by_user : { name: "Usuário não disponível" }
          };
        }) as TicketHistory[];
        
        setHistory(transformedHistory);

        const { data: equipmentData, error: equipmentError } = await supabase
          .from("equipamentos")
          .select("*")
          .eq("ticket_id", ticket.id);

        if (equipmentError) throw equipmentError;
        setEquipments(equipmentData);
      } catch (error) {
        console.error("Erro ao buscar detalhes do ticket:", error);
      } finally {
        setLoading(false);
      }
    };

    if (ticket) {
      fetchTicketDetails();
    }
  }, [ticket]);

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

  const getActionTypeLabel = (actionType: string) => {
    switch (actionType) {
      case "STATUS_CHANGE":
        return "Status alterado";
      case "USER_ASSIGNMENT":
        return "Técnico atribuído";
      case "EQUIPMENT_STATUS":
        return "Status de equipamento";
      case "PROGRESS_NOTE":
        return "Andamento";
      default:
        return "Atualização";
    }
  };

  return (
    <Dialog open={!!ticket} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Ticket {ticket.codigo}
            <Badge className={getStatusColor(ticket.status)}>
              {getStatusLabel(ticket.status)}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Aberto em {format(new Date(ticket.created_at), "dd/MM/yyyy HH:mm")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <h3 className="font-medium mb-2">Descrição</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ticket.description}</p>
          </div>

          <div>
            <h3 className="font-medium mb-2">Data Agendada</h3>
            <p className="text-sm text-muted-foreground">
              {format(new Date(ticket.scheduled_for), "dd/MM/yyyy HH:mm")}
            </p>
          </div>

          <Separator />

          <div>
            <h3 className="font-medium mb-4">Histórico do Ticket</h3>
            {loading ? (
              <div className="text-sm text-center py-4">Carregando...</div>
            ) : history.length === 0 ? (
              <div className="text-sm text-center py-4 text-muted-foreground">
                Nenhum histórico encontrado
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((item) => (
                  <Card key={item.id} className="border-l-4 border-l-blue-500">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-medium flex items-center justify-between">
                        <span>
                          {getActionTypeLabel(item.action_type)}
                          {item.action_type === "STATUS_CHANGE" && 
                            `: ${item.previous_status ? `${getStatusLabel(item.previous_status)} → ` : ''}${getStatusLabel(item.status)}`
                          }
                          {item.action_type === "PROGRESS_NOTE" && ": Atualização"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(item.created_at), "dd/MM/yyyy HH:mm")}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm text-muted-foreground">
                        {item.reason || "Sem observações adicionais"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Por: {item.created_by_user?.name || "Usuário não disponível"}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {equipments.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-medium mb-4">Equipamentos</h3>
                <div className="space-y-4">
                  {equipments.map((equipment) => (
                    <Card key={equipment.codigo}>
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium">
                          {equipment.equipamento} ({equipment.codigo})
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium">Número de Série:</span>{" "}
                            {equipment.numero_serie || "N/A"}
                          </div>
                          <div>
                            <span className="font-medium">Condição:</span>{" "}
                            {equipment.condicao}
                          </div>
                          {equipment.status && (
                            <div className="col-span-2">
                              <span className="font-medium">Status:</span>{" "}
                              {equipment.status === "ENTREGUE" ? "Entregue" : "Retirado"}
                            </div>
                          )}
                          {equipment.observacoes && (
                            <div className="col-span-2">
                              <span className="font-medium">Observações:</span>{" "}
                              {equipment.observacoes}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
