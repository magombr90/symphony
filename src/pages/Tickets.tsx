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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
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
import { Textarea } from "@/components/ui/textarea";

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
  assigned_to: string | null;
  assigned_user?: {
    name: string | null;
  } | null;
};

type SystemUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
};

type TicketHistory = {
  id: string;
  ticket_id: string;
  status: string;
  reason: string;
  created_at: string;
  created_by: string;
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
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [showReasonDialog, setShowReasonDialog] = useState(false);
  const [reason, setReason] = useState("");
  const [selectedTicketDetails, setSelectedTicketDetails] = useState<Ticket | null>(null);
  const { toast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState("PENDENTE");
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterUser, setFilterUser] = useState<string | null>(null);

  const { data: userStats } = useQuery({
    queryKey: ["user-tickets-stats"],
    queryFn: async () => {
      const { data: users } = await supabase
        .from("system_users")
        .select("*")
        .eq("active", true);

      if (!users) return [];

      const stats = await Promise.all(
        users.map(async (user) => {
          const { count: total } = await supabase
            .from("tickets")
            .select("*", { count: "exact", head: true })
            .eq("assigned_to", user.id);

          const { data: inProgress } = await supabase
            .from("tickets")
            .select("*")
            .eq("assigned_to", user.id)
            .eq("status", "EM_ANDAMENTO");

          return {
            user,
            total: total || 0,
            inProgress: inProgress?.length || 0,
          };
        })
      );

      return stats;
    },
  });

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
    queryKey: ["tickets", filterStatus, filterUser],
    queryFn: async () => {
      let query = supabase
        .from("tickets")
        .select(`
          *,
          client:clients(razao_social),
          assigned_user:system_users!tickets_assigned_to_fkey(name)
        `)
        .order("created_at", { ascending: false });

      if (filterStatus) {
        query = query.eq("status", filterStatus);
      }

      if (filterUser) {
        query = query.eq("assigned_to", filterUser);
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

  const { data: systemUsers } = useQuery({
    queryKey: ["system-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_users")
        .select("*")
        .eq("active", true);
      if (error) throw error;
      return data as SystemUser[];
    },
  });

  const { data: ticketHistory } = useQuery({
    queryKey: ["ticket-history", selectedTicketDetails?.id],
    enabled: !!selectedTicketDetails?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_history")
        .select(`
          *,
          created_by_user:system_users!ticket_history_created_by_fkey(name)
        `)
        .eq("ticket_id", selectedTicketDetails?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as (TicketHistory & { created_by_user: { name: string } })[];
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
      assigned_to: selectedUser || null,
      created_by: selectedUser // Temporário, idealmente viria do contexto de autenticação
    };

    const { error } = await supabase
      .from("tickets")
      .insert(newTicket as any);

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

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    if (newStatus === "CANCELADO" || newStatus === "CONCLUIDO") {
      setEditingTicket({
        ...(tickets?.find((t) => t.id === ticketId) as Ticket),
        status: newStatus,
      });
      setShowReasonDialog(true);
      return;
    }

    await updateTicketStatus(ticketId, newStatus);
  };

  const updateTicketStatus = async (ticketId: string, newStatus: string, reasonText?: string) => {
    const { error: updateError } = await supabase
      .from("tickets")
      .update({ status: newStatus })
      .eq("id", ticketId);

    if (updateError) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar status",
        description: updateError.message,
      });
      return;
    }

    if (reasonText) {
      const { error: historyError } = await supabase
        .from("ticket_history")
        .insert({
          ticket_id: ticketId,
          status: newStatus,
          reason: reasonText,
          created_by: selectedUser, // Idealmente viria do contexto de autenticação
        });

      if (historyError) {
        toast({
          variant: "destructive",
          title: "Erro ao registrar histórico",
          description: historyError.message,
        });
        return;
      }
    }

    toast({
      title: "Status atualizado com sucesso!",
    });
    refetch();
    setShowReasonDialog(false);
    setReason("");
    setEditingTicket(null);
  };

  const handleReasonSubmit = async () => {
    if (!editingTicket) return;
    await updateTicketStatus(editingTicket.id, editingTicket.status, reason);
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
                <Label>Responsável</Label>
                <Select
                  value={selectedUser}
                  onValueChange={setSelectedUser}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    {systemUsers?.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {userStats?.map(({ user, total, inProgress }) => (
          <Card
            key={user.id}
            className={`cursor-pointer hover:opacity-80 transition-opacity ${
              filterUser === user.id ? "ring-2 ring-primary" : ""
            }`}
            onClick={() =>
              setFilterUser(filterUser === user.id ? null : user.id)
            }
          >
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">{user.name}</h3>
                  <Badge className="bg-blue-500">
                    {inProgress} em andamento
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Total de tickets: {total}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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
                <TableHead>Responsável</TableHead>
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
                  <TableCell>{ticket.assigned_user?.name}</TableCell>
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
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTicketDetails(ticket)}
                      >
                        Detalhes
                      </Button>
                      <Select
                        value={ticket.status}
                        onValueChange={(value) => handleStatusChange(ticket.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue>Alterar Status</SelectValue>
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showReasonDialog} onOpenChange={setShowReasonDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTicket?.status === "CANCELADO"
                ? "Motivo do Cancelamento"
                : "Motivo da Conclusão"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Motivo</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Digite o motivo..."
                required
              />
            </div>
            <Button
              onClick={handleReasonSubmit}
              className="w-full"
              disabled={!reason.trim()}
            >
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Sheet 
        open={!!selectedTicketDetails} 
        onOpenChange={() => setSelectedTicketDetails(null)}
      >
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              Detalhes do Ticket - {selectedTicketDetails?.codigo}
            </SheetTitle>
          </SheetHeader>
          {selectedTicketDetails && (
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Cliente</Label>
                  <p className="mt-1">{selectedTicketDetails.client.razao_social}</p>
                </div>
                <div>
                  <Label>Responsável</Label>
                  <p className="mt-1">{selectedTicketDetails.assigned_user?.name}</p>
                </div>
                <div>
                  <Label>Data Agendada</Label>
                  <p className="mt-1">
                    {format(new Date(selectedTicketDetails.scheduled_for), "dd/MM/yyyy HH:mm")}
                  </p>
                </div>
                <div>
                  <Label>Status Atual</Label>
                  <Badge className={`mt-1 ${getStatusColor(selectedTicketDetails.status)}`}>
                    {statusOptions.find((s) => s.value === selectedTicketDetails.status)?.label}
                  </Badge>
                </div>
              </div>

              <div>
                <Label>Descrição</Label>
                <p className="mt-1">{selectedTicketDetails.description}</p>
              </div>

              <div>
                <Label className="mb-2 block">Histórico de Status</Label>
                {ticketHistory && ticketHistory.length > 0 ? (
                  <div className="space-y-4">
                    {ticketHistory.map((history) => (
                      <div key={history.id} className="border p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <Badge className={getStatusColor(history.status)}>
                              {statusOptions.find((s) => s.value === history.status)?.label}
                            </Badge>
                            {history.reason && (
                              <p className="mt-2 text-sm text-gray-600">
                                Motivo: {history.reason}
                              </p>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            <p>{format(new Date(history.created_at), "dd/MM/yyyy HH:mm")}</p>
                            <p className="text-right">por {history.created_by_user.name}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Nenhuma alteração de status registrada.</p>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
