
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Ticket } from "@/types/ticket";
import { Search } from "lucide-react";

interface AssociateTicketDialogProps {
  equipmentId: string;
  onSuccess: () => void;
}

export function AssociateTicketDialog({ 
  equipmentId,
  onSuccess 
}: AssociateTicketDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchTerm) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select(`
          id,
          codigo,
          status,
          client_id,
          client:clients(razao_social)
        `)
        .or(`codigo.ilike.%${searchTerm}%`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTickets(data as Ticket[]);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar tickets",
        description: error instanceof Error ? error.message : "Erro desconhecido",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
  };

  const handleAssociate = async () => {
    if (!selectedTicket) return;
    
    try {
      const { error } = await supabase
        .from("equipamentos")
        .update({ ticket_id: selectedTicket.id })
        .eq("id", equipmentId);

      if (error) throw error;

      toast({
        title: "Ticket associado com sucesso",
        description: `Equipamento associado ao ticket ${selectedTicket.codigo}`,
      });
      
      setOpen(false);
      onSuccess();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao associar ticket",
        description: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button 
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        Associar Ticket
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Associar Ticket ao Equipamento</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Buscar ticket por código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? "Buscando..." : "Buscar"}
            </Button>
          </div>

          <div className="border rounded-md divide-y max-h-60 overflow-y-auto">
            {tickets.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm ? "Nenhum ticket encontrado" : "Busque por um ticket para associar"}
              </div>
            ) : (
              tickets.map((ticket) => (
                <div 
                  key={ticket.id} 
                  className={`p-3 cursor-pointer hover:bg-gray-100 ${selectedTicket?.id === ticket.id ? 'bg-gray-100' : ''}`}
                  onClick={() => handleSelectTicket(ticket)}
                >
                  <div className="font-medium">{ticket.codigo}</div>
                  <div className="text-sm text-gray-500">{ticket.client?.razao_social}</div>
                  <div className="text-xs mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      ticket.status === 'ABERTO' ? 'bg-blue-100 text-blue-800' :
                      ticket.status === 'EM_ANDAMENTO' ? 'bg-yellow-100 text-yellow-800' :
                      ticket.status === 'CONCLUIDO' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <Button 
            className="w-full" 
            disabled={!selectedTicket} 
            onClick={handleAssociate}
          >
            Associar Ticket
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
