
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const { toast } = useToast();

  // Carregar todos os tickets quando o diálogo for aberto
  useEffect(() => {
    if (open) {
      loadAllTickets();
    } else {
      // Resetar estados quando fechar o diálogo
      setSearchTerm("");
      setSelectedTicket(null);
    }
  }, [open]);

  // Filtrar tickets com base no termo de busca
  useEffect(() => {
    if (tickets.length > 0) {
      if (searchTerm.trim() === "") {
        setFilteredTickets(tickets);
      } else {
        const filtered = tickets.filter(ticket => 
          ticket.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.client?.razao_social.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredTickets(filtered);
      }
    }
  }, [searchTerm, tickets]);

  const loadAllTickets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select(`
          id, 
          codigo, 
          status, 
          client_id,
          description,
          client:clients(razao_social)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      console.log("Tickets carregados:", data);
      setTickets(data as Ticket[]);
      setFilteredTickets(data as Ticket[]);
    } catch (error) {
      console.error("Erro ao carregar tickets:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar tickets",
        description: error instanceof Error ? error.message : "Erro desconhecido",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // A pesquisa agora é feita automaticamente pelo useEffect
    console.log("Buscando por:", searchTerm);
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
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Associar Ticket ao Equipamento</DialogTitle>
          <DialogDescription>
            Selecione um ticket para associar a este equipamento.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Filtrar tickets por código ou cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="border rounded-md divide-y max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                Carregando tickets...
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm ? "Nenhum ticket encontrado" : "Nenhum ticket disponível"}
              </div>
            ) : (
              filteredTickets.map((ticket) => (
                <div 
                  key={ticket.id} 
                  className={`p-3 cursor-pointer hover:bg-gray-100 ${selectedTicket?.id === ticket.id ? 'bg-gray-100' : ''}`}
                  onClick={() => handleSelectTicket(ticket)}
                >
                  <div className="font-medium">{ticket.codigo}</div>
                  <div className="text-sm text-gray-500">{ticket.client?.razao_social}</div>
                  <div className="text-xs mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      ticket.status === 'PENDENTE' ? 'bg-blue-100 text-blue-800' :
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
