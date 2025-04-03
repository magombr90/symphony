
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
import { ClientSearch } from "./ClientSearch";

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
  const [newTicket, setNewTicket] = useState<{ id: string; codigo: string } | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Validate client selection
    if (!selectedClient) {
      toast({
        variant: "destructive",
        title: "Cliente não selecionado",
        description: "Por favor, selecione um cliente para continuar.",
      });
      return;
    }

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
    
    const newTicketData = {
      description: String(formData.get("description")),
      client_id: selectedClient,
      status: selectedStatus,
      scheduled_for: scheduledFor.toISOString(),
      assigned_to: selectedUser || null,
      created_by: selectedUser, // Temporário, idealmente viria do contexto de autenticação
      codigo: "TEMP", // Valor temporário que será substituído pelo trigger generate_ticket_code
    };

    try {
      const { data, error } = await supabase
        .from("tickets")
        .insert(newTicketData)
        .select()
        .single();

      if (error) {
        console.error("Error creating ticket:", error);
        toast({
          variant: "destructive",
          title: "Erro ao criar ticket",
          description: error.message,
        });
        return;
      }

      setNewTicket(data);
      toast({
        title: "Ticket criado com sucesso!",
        description: `Ticket ${data.codigo} foi criado.`,
      });
      onSuccess();
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        variant: "destructive",
        title: "Erro ao criar ticket",
        description: "Ocorreu um erro inesperado. Tente novamente.",
      });
    }
  };

  // Formata a data mínima para o campo datetime-local (data atual)
  const getMinDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16); // Formato YYYY-MM-DDTHH:mm
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="client">Cliente*</Label>
        <ClientSearch 
          value={selectedClient} 
          onChange={(value) => {
            console.log("Client selected:", value);
            setSelectedClient(value);
          }} 
        />
      </div>

      {selectedClient && newTicket && (
        <div>
          <AddEquipmentDialog 
            clientId={selectedClient}
            ticketId={newTicket?.id}
            ticketCode={newTicket?.codigo}
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
        <Label htmlFor="assigned_to">Responsável*</Label>
        <Select
          value={selectedUser}
          onValueChange={(value) => {
            console.log("User selected:", value);
            setSelectedUser(value);
          }}
          required
        >
          <SelectTrigger id="assigned_to">
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
        <Label htmlFor="description">Descrição*</Label>
        <Input id="description" name="description" required />
      </div>
      <div>
        <Label htmlFor="status">Status*</Label>
        <Select
          value={selectedStatus}
          onValueChange={setSelectedStatus}
          required
        >
          <SelectTrigger id="status">
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
        <Label htmlFor="scheduled_for">Data Agendada*</Label>
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
