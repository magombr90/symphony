
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
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Check, FileDown, Loader2, MoreHorizontal, Package } from "lucide-react";
import { useTicketActions } from "@/hooks/tickets/use-ticket-actions";
import { Ticket, TicketHistory } from "@/types/ticket";
import { TicketPDF } from "./TicketPDF";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TicketProgressProps {
  ticket: Ticket;
  onSuccess: () => void;
}

export function TicketProgress({ ticket, onSuccess }: TicketProgressProps) {
  const [loading, setLoading] = useState(false);
  const [processingEquipment, setProcessingEquipment] = useState<string | null>(null);
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

  return (
    <div className="flex items-center gap-2">
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
  );
}
