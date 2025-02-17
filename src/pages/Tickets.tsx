
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
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

type Ticket = {
  id: string;
  codigo: string;
  status: string;
  description: string;
  client_id: string;
  scheduled_for: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  client: {
    razao_social: string;
  };
};

const statusOptions = [
  { value: "PENDENTE", label: "Pendente" },
  { value: "EM_ANDAMENTO", label: "Em Andamento" },
  { value: "CONCLUIDO", label: "Concluído" },
  { value: "CANCELADO", label: "Cancelado" },
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
    default:
      return "bg-gray-500";
  }
};

export default function Tickets() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState("PENDENTE");
  const [selectedClient, setSelectedClient] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const { data: statusCounts } = useQuery({
    queryKey: ["tickets-count"],
    queryFn: async () => {
      const counts = await Promise.all(
        statusOptions.map(async (status) => {
          const { count } = await supabase
            .from("tickets")
            .select("*", { count: "exact", head: true })
            .eq("status", status.value);
          return {
            status: status.value,
            label: status.label,
            count: count || 0,
          };
        })
      );
      return counts;
    },
  });

  const { data: tickets, refetch } = useQuery({
    queryKey: ["tickets", filterStatus],
    queryFn: async () => {
      let query = supabase
        .from("tickets")
        .select(`
          *,
          client:clients(razao_social)
        `)
        .order("created_at", { ascending: false });

      if (filterStatus) {
        query = query.eq("status", filterStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Ticket[];
    },
  });

  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("*");
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const scheduledFor = new Date(String(formData.get("scheduled_for")));
    
    const newTicket = {
      description: String(formData.get("description")),
      client_id: selectedClient,
      status: selectedStatus,
      scheduled_for: scheduledFor.toISOString(),
      created_by: "system", // Temporário até implementar autenticação
    };

    const { error } = await supabase.from("tickets").insert(newTicket);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar ticket",
        description: error.message,
      });
      return;
    }

    toast({
      title: "Ticket criado com sucesso!",
    });
    setOpen(false);
    refetch();
  };

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Tickets</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Ticket
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Ticket</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Cliente</Label>
                <Select
                  value={selectedClient}
                  onValueChange={setSelectedClient}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients?.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.razao_social}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Input id="description" name="description" required />
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="scheduled_for">Data Agendada</Label>
                <Input
                  id="scheduled_for"
                  name="scheduled_for"
                  type="datetime-local"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Salvar
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {statusCounts?.map((statusCount) => (
          <Card
            key={statusCount.status}
            className={`cursor-pointer hover:opacity-80 transition-opacity ${
              filterStatus === statusCount.status ? "ring-2 ring-primary" : ""
            }`}
            onClick={() =>
              setFilterStatus(
                filterStatus === statusCount.status ? null : statusCount.status
              )
            }
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <Badge className={getStatusColor(statusCount.status)}>
                  {statusCount.label}
                </Badge>
                <span className="text-2xl font-bold">{statusCount.count}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="slide-in">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Data Agendada</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets?.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>{ticket.codigo}</TableCell>
                  <TableCell>{ticket.client.razao_social}</TableCell>
                  <TableCell>{ticket.description}</TableCell>
                  <TableCell>
                    {format(new Date(ticket.scheduled_for), "dd/MM/yyyy HH:mm")}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(ticket.status)}>
                      {statusOptions.find((s) => s.value === ticket.status)?.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      Detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
