
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CreateTicketFormProps {
  clients: Array<{ id: string; razao_social: string }>;
  systemUsers: Array<{ id: string; name: string }>;
  onSuccess: () => void;
}

const statusOptions = [
  { value: "PENDENTE", label: "Pendente" },
  { value: "EM_ANDAMENTO", label: "Em Andamento" },
  { value: "CONCLUIDO", label: "Concluído" },
  { value: "CANCELADO", label: "Cancelado" },
];

export function CreateTicketForm({ clients, systemUsers, onSuccess }: CreateTicketFormProps) {
  const [selectedStatus, setSelectedStatus] = useState("PENDENTE");
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedClient || !selectedUser || !description || !scheduledFor) {
      toast({
        variant: "destructive",
        title: "Erro ao criar ticket",
        description: "Por favor, preencha todos os campos obrigatórios",
      });
      return;
    }

    const newTicket = {
      description,
      client_id: selectedClient,
      status: selectedStatus,
      scheduled_for: new Date(scheduledFor).toISOString(),
      assigned_to: selectedUser,
      created_by: selectedUser, // Idealmente viria do contexto de autenticação
      codigo: "TEMP", // Valor temporário que será substituído pelo trigger generate_ticket_code
    };

    const { error } = await supabase
      .from("tickets")
      .insert(newTicket);

    if (error) {
      console.error("Erro ao criar ticket:", error);
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
    
    // Limpar formulário
    setSelectedClient("");
    setSelectedUser("");
    setDescription("");
    setScheduledFor("");
    setSelectedStatus("PENDENTE");
    
    onSuccess();
  };

  return (
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
        <Input 
          id="description" 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required 
        />
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
          type="datetime-local"
          value={scheduledFor}
          onChange={(e) => setScheduledFor(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full">
        Salvar
      </Button>
    </form>
  );
}
