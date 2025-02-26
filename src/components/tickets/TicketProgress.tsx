
import { useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Check, FileDown, Loader2, MoreHorizontal } from "lucide-react";
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
  const { toast } = useToast();
  const { handleFaturarTicket } = useTicketActions([], () => {});

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
        action_type: item.action_type as "STATUS_CHANGE" | "USER_ASSIGNMENT"
      })) as TicketHistory[];
    },
  });

  const handleFaturar = async () => {
    setLoading(true);
    try {
      const success = await handleFaturarTicket(ticket.id);
      if (success) {
        toast({
          title: "Ticket faturado",
          description: `O ticket ${ticket.codigo} foi marcado como faturado.`,
        });
        onSuccess();
      }
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

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <PDFDownloadLink
            document={<TicketPDF ticket={ticket} history={ticketHistory || []} />}
            fileName={`ticket_${ticket.codigo}.pdf`}
          >
            {({ loading: pdfLoading }) => (
              <DropdownMenuItem disabled={pdfLoading} onSelect={(e) => e.preventDefault()}>
                {pdfLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileDown className="h-4 w-4 mr-2" />
                )}
                Baixar PDF
              </DropdownMenuItem>
            )}
          </PDFDownloadLink>
          {ticket.status === "CONCLUIDO" && !ticket.faturado && (
            <DropdownMenuItem disabled={loading} onClick={handleFaturar}>
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Marcar como Faturado
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
