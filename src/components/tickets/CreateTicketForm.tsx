
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
import { AddEquipmentDialog } from "./AddEquipmentDialog";

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

export function CreateTicketForm({ clients = [], systemUsers = [], onSuccess }: CreateTicketFormProps) {
  const [selectedStatus, setSelectedStatus] = useState("PENDENTE");
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [newTicketId, setNewTicketId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const scheduledForValue = formData.get("scheduled_for");
    
    if (!scheduledForValue) {
      toast({
        variant: "destructive",
        title: "Data inválida",
        description: "Por favor, selecione uma data válida para o agendamento.",
      });
      return;
    }

    const scheduledFor = new Date(String(scheduledForValue));

    // Verifica se a data é válida
    if (isNaN(scheduledFor.getTime())) {
      toast({
        variant: "destructive",
        title: "Data inválida",
        description: "Por favor, selecione uma data válida para o agendamento.",
      });
      return;
    }

    // Verifica se a data não é no passado
    if (scheduledFor < new Date()) {
      toast({
        variant: "destructive",
        title: "Data inválida",
        description: "A data de agendamento não pode ser no passado.",
      });
      return;
    }
    
    const newTicket = {
      description: String(formData.get("description")),
      client_id: selectedClient,
      status: selectedStatus,
      scheduled_for: scheduledFor.toISOString(),
      assigned_to: selectedUser || null,
      created_by: selectedUser, // Temporário, idealmente viria do contexto de autenticação
      codigo: "TEMP", // Valor temporário que será substituído pelo trigger generate_ticket_code
    };

    const { data, error } = await supabase
      .from("tickets")
      .insert(newTicket)
      .select()
      .single();

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar ticket",
        description: error.message,
      });
      return;
    }

    setNewTicketId(data.id);
    toast({
      title: "Ticket criado com sucesso!",
    });
    onSuccess();
  };

  // Formata a data mínima para o campo datetime-local (data atual)
  const getMinDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16); // Formato YYYY-MM-DDTHH:mm
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
            {(clients || []).map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.razao_social}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedClient && (
        <div>
          <AddEquipmentDialog 
            clientId={selectedClient}
            ticketId={newTicketId || undefined}
            onSuccess={() => {
              toast({
                title: "Equipamento adicionado com sucesso!",
                description: "O equipamento foi vinculado ao cliente e ao ticket.",
              });
            }}
          />
        </div>
      )}

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
            {(systemUsers || []).map((user) => (
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
          min={getMinDateTime()}
          required
        />
      </div>
      <Button type="submit" className="w-full">
        Salvar
      </Button>
    </form>
  );
}
