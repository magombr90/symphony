
import { useState, useEffect } from "react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AddEquipmentDialog } from "./AddEquipmentDialog";
import { Search } from "lucide-react";

interface CreateTicketFormProps {
  clients: Array<{ id: string; razao_social: string; cnpj: string }>;
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
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ id: string; razao_social: string; cnpj: string }>>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedClientLabel, setSelectedClientLabel] = useState("");
  const { toast } = useToast();

  // Efeito para filtrar clientes baseado no termo de busca
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = clients.filter(
      client => 
        client.razao_social.toLowerCase().includes(lowerSearchTerm) || 
        (client.cnpj && client.cnpj.includes(searchTerm))
    );
    
    setSearchResults(filtered);
  }, [searchTerm, clients]);

  const handleClientSelect = (client: { id: string; razao_social: string }) => {
    console.log('Cliente selecionado:', client); // Para debug
    setSelectedClient(client.id);
    setSelectedClientLabel(client.razao_social);
    setIsSearchOpen(false);
    setSearchTerm(""); // Limpar o termo de busca após a seleção
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (!selectedClient) {
      toast({
        variant: "destructive",
        title: "Cliente não selecionado",
        description: "Por favor, selecione um cliente para o ticket.",
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

    const { data, error } = await supabase
      .from("tickets")
      .insert(newTicketData)
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

    setNewTicket(data);
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
        <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isSearchOpen}
              className="w-full justify-between"
              type="button"
            >
              {selectedClient
                ? selectedClientLabel
                : "Buscar cliente..."}
              <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0 max-w-[400px]" align="start">
            <div className="flex flex-col p-2 gap-2">
              <Input
                placeholder="Buscar por razão social ou CNPJ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-2"
                autoFocus
              />
              <div className="max-h-60 overflow-y-auto">
                {searchResults.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {searchResults.map((client) => (
                      <Button
                        key={client.id}
                        variant="ghost"
                        className="justify-start text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors py-3"
                        onClick={(e) => {
                          e.preventDefault(); // Previne o comportamento padrão do botão
                          console.log('Clicou no cliente:', client); // Para debug
                          handleClientSelect(client);
                        }}
                        type="button"
                      >
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{client.razao_social}</span>
                          {client.cnpj && <span className="text-xs text-muted-foreground">CNPJ: {client.cnpj}</span>}
                        </div>
                      </Button>
                    ))}
                  </div>
                ) : searchTerm.trim() !== "" ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    Nenhum cliente encontrado.
                  </div>
                ) : (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    Digite para buscar um cliente.
                  </div>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
        {selectedClient && (
          <p className="text-sm text-muted-foreground mt-1">
            Cliente selecionado: <span className="font-medium">{selectedClientLabel}</span>
          </p>
        )}
      </div>

      {/* Resto do formulário permanece o mesmo */}
      {selectedClient && (
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
