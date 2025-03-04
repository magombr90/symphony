
import { useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Check, FileDown, Loader2, MoreHorizontal, Package, Timer, Tag } from "lucide-react";
import { useTicketActions } from "@/hooks/tickets/use-ticket-actions";
import { Ticket, TicketHistory } from "@/types/ticket";
import { TicketPDF } from "./TicketPDF";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TicketProgressProps {
  ticket: Ticket;
  onSuccess: () => void;
}

export function TicketProgress({ ticket, onSuccess }: TicketProgressProps) {
  const [loading, setLoading] = useState(false);
  const [processingEquipment, setProcessingEquipment] = useState<string | null>(null);
  const [customStatusDialog, setCustomStatusDialog] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<{id: string, codigo: string} | null>(null);
  const [customStatus, setCustomStatus] = useState("");
  const { toast } = useToast();
  const { handleFaturarTicket, handleMarkEquipmentAsDelivered } = useTicketActions([], onSuccess);

  // Buscar histórico do ticket para o PDF
  const { data: ticketHistory } = useQuery({
    queryKey: ["ticket-history-for-pdf", ticket.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_history")
        .select(`
          *,
          created_by_user:system_users!ticket_history_created_by_fkey(name),
          previous_assigned_to_user:system_users!fk_previous_assigned_to(name),
          new_assigned_to_user:system_users!fk_new_assigned_to(name)
        `)
        .eq("ticket_id", ticket.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map(item => ({
        ...item,
        action_type: item.action_type as "STATUS_CHANGE" | "USER_ASSIGNMENT" | "EQUIPMENT_STATUS"
      })) as TicketHistory[];
    },
  });

  const handleFaturar = async () => {
    setLoading(true);
    try {
      await handleFaturarTicket(ticket.id);
      toast({
        title: "Ticket faturado",
        description: `O ticket ${ticket.codigo} foi marcado como faturado.`,
      });
      onSuccess();
    } catch (error) {
      console.error("Erro ao faturar ticket:", error);
      toast({
        variant: "destructive",
        title: "Erro ao faturar ticket",
        description: "Não foi possível faturar este ticket.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeliverEquipment = async (equipmentId: string, equipmentCode: string) => {
    setProcessingEquipment(equipmentId);
    try {
      await handleMarkEquipmentAsDelivered(equipmentId, equipmentCode, ticket.id, ticket.status);
      onSuccess();
    } catch (error) {
      console.error("Erro ao marcar equipamento como entregue:", error);
    } finally {
      setProcessingEquipment(null);
    }
  };

  const handleCustomStatus = async () => {
    if (!selectedEquipment || !customStatus) return;
    
    setProcessingEquipment(selectedEquipment.id);
    try {
      // Update equipment status
      const { error: equipmentError } = await supabase
        .from("equipamentos")
        .update({ 
          status: customStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", selectedEquipment.id);
  
      if (equipmentError) throw equipmentError;
  
      // Create history record
      const { error: historyError } = await supabase
        .from("ticket_history")
        .insert({
          ticket_id: ticket.id,
          status: ticket.status,
          reason: `Equipamento ${selectedEquipment.codigo} alterado para status: ${customStatus}`,
          created_by: ticket.created_by,
          action_type: "EQUIPMENT_STATUS",
          equipment_id: selectedEquipment.id,
          equipment_codigo: selectedEquipment.codigo,
          equipment_status: customStatus
        });
  
      if (historyError) throw historyError;
  
      toast({
        title: "Status alterado",
        description: `O equipamento ${selectedEquipment.codigo} foi alterado para o status: ${customStatus}.`,
      });
      
      setCustomStatusDialog(false);
      setCustomStatus("");
      setSelectedEquipment(null);
      onSuccess();
    } catch (error) {
      console.error("Erro ao alterar status do equipamento:", error);
      toast({
        variant: "destructive",
        title: "Erro ao alterar status",
        description: "Não foi possível alterar o status deste equipamento.",
      });
    } finally {
      setProcessingEquipment(null);
    }
  };

  // Function to format time spent (minutes) into a readable format
  const formatTimeSpent = (minutes: number | null) => {
    if (!minutes) return "N/A";
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.floor(minutes % 60);
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}min`;
    }
    return `${remainingMinutes}min`;
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {ticket.status === "EM_ANDAMENTO" && ticket.started_at && (
          <div className="text-xs text-muted-foreground flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-md">
            <Timer className="h-3 w-3" />
            <span>Em andamento desde {format(new Date(ticket.started_at), "dd/MM HH:mm")}</span>
          </div>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* PDF Download Link */}
            {ticketHistory && (
              <DropdownMenuItem className="w-full cursor-pointer" onSelect={(e) => e.preventDefault()}>
                <PDFDownloadLink
                  document={<TicketPDF ticket={ticket} history={ticketHistory || []} />}
                  fileName={`ticket_${ticket.codigo}.pdf`}
                  className="flex w-full items-center"
                >
                  {({ loading: pdfLoading }) => (
                    <>
                      {pdfLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <FileDown className="h-4 w-4 mr-2" />
                      )}
                      Baixar PDF
                    </>
                  )}
                </PDFDownloadLink>
              </DropdownMenuItem>
            )}

            {ticket.equipamentos && ticket.equipamentos.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Package className="h-4 w-4 mr-2" />
                    Marcar equipamento como entregue
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {ticket.equipamentos
                      .filter(equip => equip.status !== "ENTREGUE" && equip.id)
                      .map(equip => (
                        <DropdownMenuItem 
                          key={equip.id}
                          disabled={processingEquipment === equip.id}
                          onClick={() => equip.id && handleDeliverEquipment(equip.id, equip.codigo)}
                          className="cursor-pointer"
                        >
                          {processingEquipment === equip.id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4 mr-2" />
                          )}
                          {equip.codigo} - {equip.equipamento}
                        </DropdownMenuItem>
                      ))}
                    {ticket.equipamentos.filter(equip => equip.status !== "ENTREGUE" && equip.id).length === 0 && (
                      <DropdownMenuItem disabled>
                        Nenhum equipamento pendente
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Tag className="h-4 w-4 mr-2" />
                    Alterar status do equipamento
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {ticket.equipamentos
                      .filter(equip => equip.id)
                      .map(equip => (
                        <DropdownMenuItem 
                          key={equip.id}
                          disabled={processingEquipment === equip.id}
                          onClick={() => {
                            if (equip.id) {
                              setSelectedEquipment({id: equip.id, codigo: equip.codigo});
                              setCustomStatusDialog(true);
                            }
                          }}
                          className="cursor-pointer"
                        >
                          {processingEquipment === equip.id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Tag className="h-4 w-4 mr-2" />
                          )}
                          {equip.codigo} - {equip.equipamento} ({equip.status || 'Sem status'})
                        </DropdownMenuItem>
                      ))}
                    {ticket.equipamentos.filter(equip => equip.id).length === 0 && (
                      <DropdownMenuItem disabled>
                        Nenhum equipamento disponível
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </>
            )}

            {ticket.status === "CONCLUIDO" && !ticket.faturado && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  disabled={loading} 
                  onClick={handleFaturar}
                  className="cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Marcar como Faturado
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={customStatusDialog} onOpenChange={setCustomStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Status do Equipamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="equipment-code">Equipamento</Label>
              <Input 
                id="equipment-code" 
                value={selectedEquipment?.codigo || ''} 
                disabled 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom-status">Novo Status</Label>
              <Input 
                id="custom-status" 
                value={customStatus} 
                onChange={(e) => setCustomStatus(e.target.value)}
                placeholder="Digite o novo status (ex: MANUTENÇÃO, EMPRESTADO, etc)" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setCustomStatusDialog(false);
                setCustomStatus("");
                setSelectedEquipment(null);
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCustomStatus} 
              disabled={!customStatus || !selectedEquipment}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
