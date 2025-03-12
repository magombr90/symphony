
import { useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, User, Clock, AlertCircle, Check, Loader2 } from "lucide-react";
import { Ticket, TicketHistory } from "@/types/ticket";
import { TicketProgress } from "./TicketProgress";
import { Button } from "../ui/button";
import { useTicketActions } from "@/hooks/tickets/use-ticket-actions";

interface TicketDetailsProps {
  ticket: Ticket | null;
  history: TicketHistory[];
  onClose: () => void;
}

export function TicketDetails({ ticket, history, onClose }: TicketDetailsProps) {
  const [processingEquipment, setProcessingEquipment] = useState<string | null>(null);
  const { handleMarkEquipmentAsDelivered } = useTicketActions([], onClose);

  if (!ticket) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDENTE":
        return <Badge className="bg-yellow-500">Pendente</Badge>;
      case "EM_ANDAMENTO":
        return <Badge className="bg-blue-500">Em Andamento</Badge>;
      case "CONCLUIDO":
        return <Badge className="bg-green-500">Concluído</Badge>;
      case "CANCELADO":
        return <Badge className="bg-red-500">Cancelado</Badge>;
      case "FATURADO":
        return <Badge className="bg-green-700">Faturado</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  const getActionTypeText = (actionType: string) => {
    switch (actionType) {
      case "STATUS_CHANGE":
        return "Alteração de Status";
      case "USER_ASSIGNMENT":
        return "Reatribuição de Usuário";
      case "EQUIPMENT_STATUS":
        return "Status de Equipamento";
      default:
        return actionType;
    }
  };

  const getEquipmentStatusBadge = (status: string | undefined) => {
    if (!status) return null;
    return status === "ENTREGUE" ? 
      <Badge className="bg-green-500">Entregue</Badge> : 
      <Badge className="bg-blue-500">Retirado</Badge>;
  };

  const handleDeliverEquipment = async (equipmentId: string, equipmentCode: string) => {
    if (!ticket) return;
    
    setProcessingEquipment(equipmentId);
    try {
      await handleMarkEquipmentAsDelivered(equipmentId, equipmentCode, ticket.id, ticket.status);
    } finally {
      setProcessingEquipment(null);
    }
  };

  return (
    <Dialog open={!!ticket} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl">
            Ticket #{ticket.codigo}
          </DialogTitle>
          <div className="flex items-center gap-2">
            {getStatusBadge(ticket.status)}
            <TicketProgress ticket={ticket} onSuccess={onClose} />
          </div>
        </DialogHeader>

        <Tabs defaultValue="details">
          <TabsList className="mb-4">
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
            <TabsTrigger value="equipment">Equipamentos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Ticket</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Cliente</h4>
                    <p>{ticket.client.razao_social}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Status</h4>
                    <p>{getStatusBadge(ticket.status)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Responsável</h4>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      <p>{ticket.assigned_user?.name || "Não atribuído"}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Agendado para</h4>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      <p>{format(new Date(ticket.scheduled_for), "dd/MM/yyyy HH:mm")}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Descrição</h4>
                  <p className="whitespace-pre-line">{ticket.description}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Histórico do Ticket</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Detalhes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          {format(new Date(entry.created_at), "dd/MM/yyyy HH:mm")}
                        </TableCell>
                        <TableCell>{entry.created_by_user?.name}</TableCell>
                        <TableCell>{getActionTypeText(entry.action_type)}</TableCell>
                        <TableCell>
                          {entry.action_type === "STATUS_CHANGE" && (
                            <div>
                              <div>Status: {getStatusBadge(entry.status)}</div>
                              {entry.reason && (
                                <div className="mt-1">
                                  <span className="font-semibold">Motivo: </span>
                                  {entry.reason}
                                </div>
                              )}
                            </div>
                          )}
                          {entry.action_type === "USER_ASSIGNMENT" && (
                            <div>
                              <div>De: {entry.previous_assigned_to_user?.name || "Não atribuído"}</div>
                              <div>Para: {entry.new_assigned_to_user?.name || "Não atribuído"}</div>
                            </div>
                          )}
                          {entry.action_type === "EQUIPMENT_STATUS" && (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                <span>{entry.equipment_codigo}</span>
                                {getEquipmentStatusBadge(entry.equipment_status)}
                              </div>
                              {entry.reason && <div className="text-sm">{entry.reason}</div>}
                              {entry.equipment_status !== "ENTREGUE" && entry.equipment_id && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  disabled={processingEquipment === entry.equipment_id}
                                  onClick={() => entry.equipment_id && entry.equipment_codigo && 
                                    handleDeliverEquipment(entry.equipment_id, entry.equipment_codigo)}
                                  className="w-fit mt-1"
                                >
                                  {processingEquipment === entry.equipment_id ? (
                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                  ) : (
                                    <Check className="h-3 w-3 mr-1" />
                                  )}
                                  Marcar como entregue
                                </Button>
                              )}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {history.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <AlertCircle className="h-6 w-6 mb-2" />
                            Nenhum registro de histórico encontrado
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="equipment">
            <Card>
              <CardHeader>
                <CardTitle>Equipamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Equipamento</TableHead>
                      <TableHead>Número de Série</TableHead>
                      <TableHead>Condição</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ticket.equipamentos && ticket.equipamentos.length > 0 ? (
                      ticket.equipamentos.map((equip) => (
                        <TableRow key={equip.id}>
                          <TableCell>{equip.codigo}</TableCell>
                          <TableCell>{equip.equipamento}</TableCell>
                          <TableCell>{equip.numero_serie || "-"}</TableCell>
                          <TableCell>
                            <Badge className={
                              equip.condicao === "NOVO" ? "bg-green-500" :
                              equip.condicao === "USADO" ? "bg-yellow-500" : "bg-red-500"
                            }>
                              {equip.condicao}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {getEquipmentStatusBadge(equip.status)}
                          </TableCell>
                          <TableCell>
                            {equip.status !== "ENTREGUE" && equip.id && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                disabled={processingEquipment === equip.id}
                                onClick={() => equip.id && 
                                  handleDeliverEquipment(equip.id, equip.codigo)}
                              >
                                {processingEquipment === equip.id ? (
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                ) : (
                                  <Check className="h-3 w-3 mr-1" />
                                )}
                                Marcar como entregue
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <Package className="h-6 w-6 mb-2" />
                            Nenhum equipamento associado a este ticket
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
