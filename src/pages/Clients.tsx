
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, History, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { TicketDetails } from "@/components/tickets/TicketDetails";

type Client = {
  id: string;
  cnpj: string;
  razao_social: string;
  endereco: string | null;
  telefone: string | null;
  email: string | null;
  created_at: string;
};

type Ticket = {
  id: string;
  codigo: string;
  description: string;
  status: string;
  scheduled_for: string;
  created_at: string;
  client: {
    razao_social: string;
  };
  assigned_user?: {
    name: string | null;
  } | null;
};

const statusOptions = [
  { value: "PENDENTE", label: "Pendente" },
  { value: "EM_ANDAMENTO", label: "Em Andamento" },
  { value: "CONCLUIDO", label: "Concluído" },
  { value: "CANCELADO", label: "Cancelado" },
  { value: "FATURADO", label: "Faturado" },
];

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

export default function Clients() {
  const [open, setOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const { toast } = useToast();

  const { data: clients, refetch } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao carregar clientes",
          description: error.message,
        });
        throw error;
      }

      return data as Client[];
    },
  });

  const { data: clientTickets } = useQuery({
    queryKey: ["client-tickets", selectedClient?.id],
    enabled: !!selectedClient,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tickets")
        .select(`
          *,
          client:clients(razao_social),
          assigned_user:system_users!tickets_assigned_to_fkey(name)
        `)
        .eq("client_id", selectedClient?.id)
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao carregar tickets",
          description: error.message,
        });
        throw error;
      }

      return data as Ticket[];
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
          created_by_user:system_users!ticket_history_created_by_fkey(name)
        `)
        .eq("ticket_id", selectedTicket?.id)
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao carregar histórico",
          description: error.message,
        });
        throw error;
      }

      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newClient = {
      cnpj: String(formData.get("cnpj")),
      razao_social: String(formData.get("razao_social")),
      endereco: formData.get("endereco") ? String(formData.get("endereco")) : null,
      telefone: formData.get("telefone") ? String(formData.get("telefone")) : null,
      email: formData.get("email") ? String(formData.get("email")) : null,
    };

    const { error } = await supabase.from("clients").insert(newClient);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar cliente",
        description: error.message,
      });
      return;
    }

    toast({
      title: "Cliente criado com sucesso!",
    });
    setOpen(false);
    refetch();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("clients").delete().eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao deletar cliente",
        description: error.message,
      });
      return;
    }

    toast({
      title: "Cliente deletado com sucesso!",
    });
    refetch();
  };

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Clientes</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Cliente</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input id="cnpj" name="cnpj" required />
              </div>
              <div>
                <Label htmlFor="razao_social">Razão Social</Label>
                <Input id="razao_social" name="razao_social" required />
              </div>
              <div>
                <Label htmlFor="endereco">Endereço</Label>
                <Input id="endereco" name="endereco" />
              </div>
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input id="telefone" name="telefone" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" />
              </div>
              <Button type="submit" className="w-full">
                Salvar
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="slide-in">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CNPJ</TableHead>
                <TableHead>Razão Social</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients?.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>{client.cnpj}</TableCell>
                  <TableCell>{client.razao_social}</TableCell>
                  <TableCell>{client.telefone}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell className="space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedClient(client)}
                    >
                      <History className="h-4 w-4 mr-2" />
                      Histórico
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDelete(client.id)}
                    >
                      Excluir
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
        <SheetContent className="w-full sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>
              Histórico de Tickets - {selectedClient?.razao_social}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Agendada</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientTickets?.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell>{ticket.codigo}</TableCell>
                    <TableCell>{ticket.description}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(ticket.status)}>
                        {statusOptions.find(s => s.value === ticket.status)?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(ticket.scheduled_for), "dd/MM/yyyy HH:mm")}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {clientTickets?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      Nenhum ticket encontrado para este cliente.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </SheetContent>
      </Sheet>

      <TicketDetails
        ticket={selectedTicket}
        history={ticketHistory || []}
        onClose={() => setSelectedTicket(null)}
      />
    </div>
  );
}
