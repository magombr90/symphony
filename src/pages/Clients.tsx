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
import { Plus, History, Wrench } from "lucide-react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

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
};

type Equipment = {
  id: string;
  codigo: string;
  equipamento: string;
  numero_serie: string | null;
  condicao: 'NOVO' | 'USADO' | 'DEFEITO';
  observacoes: string | null;
  created_at: string;
  client_id: string | null;
  ticket_id: string | null;
  ticket: {
    codigo: string;
  } | null;
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

export default function Clients() {
  const [open, setOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedView, setSelectedView] = useState<'tickets' | 'equipment'>('tickets');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cnpj: "",
    razao_social: "",
    endereco: "",
    telefone: "",
    email: "",
  });
  const [equipmentForm, setEquipmentForm] = useState({
    equipamento: "",
    numero_serie: "",
    condicao: "NOVO" as "NOVO" | "USADO" | "DEFEITO",
    observacoes: "",
  });
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
    enabled: !!selectedClient && selectedView === 'tickets',
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
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

  const { data: clientEquipment, refetch: refetchEquipment } = useQuery({
    queryKey: ["client-equipment", selectedClient?.id],
    enabled: !!selectedClient && selectedView === 'equipment',
    queryFn: async () => {
      console.log("Buscando equipamentos para cliente:", selectedClient?.id);
      const { data, error } = await supabase
        .from("equipamentos")
        .select(`
          *,
          ticket:tickets(codigo)
        `)
        .eq("client_id", selectedClient?.id)
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao carregar equipamentos",
          description: error.message,
        });
        throw error;
      }

      console.log("Equipamentos encontrados:", data);
      return data as Equipment[];
    },
  });

  const fetchCNPJData = async (cnpj: string) => {
    setLoading(true);
    try {
      const formattedCNPJ = cnpj.replace(/[^\d]/g, '');
      const response = await fetch(`https://publica.cnpj.ws/cnpj/${formattedCNPJ}`);
      
      if (!response.ok) {
        throw new Error('CNPJ não encontrado');
      }

      const data = await response.json();
      
      setFormData({
        cnpj: cnpj,
        razao_social: data.razao_social,
        endereco: `${data.estabelecimento.logradouro}, ${data.estabelecimento.numero} - ${data.estabelecimento.bairro}, ${data.estabelecimento.cidade.nome}/${data.estabelecimento.estado.sigla}`,
        telefone: data.estabelecimento.ddd1 && data.estabelecimento.telefone1 
          ? `${data.estabelecimento.ddd1}${data.estabelecimento.telefone1}`
          : "",
        email: data.estabelecimento.email || "",
      });

      toast({
        title: "Dados do CNPJ carregados com sucesso!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar dados do CNPJ",
        description: error instanceof Error ? error.message : "Erro desconhecido",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, cnpj: value }));
    
    if (value.replace(/[^\d]/g, '').length === 14) {
      fetchCNPJData(value);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const { error } = await supabase.from("clients").insert({
      cnpj: formData.cnpj,
      razao_social: formData.razao_social,
      endereco: formData.endereco || null,
      telefone: formData.telefone || null,
      email: formData.email || null,
    });

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
    setFormData({
      cnpj: "",
      razao_social: "",
      endereco: "",
      telefone: "",
      email: "",
    });
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

  const handleEquipmentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedClient) return;

    const { error } = await supabase.from("equipamentos").insert([{
      client_id: selectedClient.id,
      equipamento: equipmentForm.equipamento,
      numero_serie: equipmentForm.numero_serie || null,
      condicao: equipmentForm.condicao,
      observacoes: equipmentForm.observacoes || null,
      codigo: 'TEMP',
    }]);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao cadastrar equipamento",
        description: error.message,
      });
      return;
    }

    toast({
      title: "Equipamento cadastrado com sucesso!",
    });
    setEquipmentForm({
      equipamento: "",
      numero_serie: "",
      condicao: "NOVO",
      observacoes: "",
    });
    refetchEquipment();
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
                <Input 
                  id="cnpj" 
                  name="cnpj" 
                  value={formData.cnpj}
                  onChange={handleCNPJChange}
                  required 
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="razao_social">Razão Social</Label>
                <Input 
                  id="razao_social" 
                  name="razao_social" 
                  value={formData.razao_social}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              <div>
                <Label htmlFor="endereco">Endereço</Label>
                <Input 
                  id="endereco" 
                  name="endereco" 
                  value={formData.endereco}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input 
                  id="telefone" 
                  name="telefone" 
                  value={formData.telefone}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
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
                      onClick={() => {
                        setSelectedClient(client);
                        setSelectedView('tickets');
                      }}
                    >
                      <History className="h-4 w-4 mr-2" />
                      Histórico
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedClient(client);
                        setSelectedView('equipment');
                      }}
                    >
                      <Wrench className="h-4 w-4 mr-2" />
                      Equipamentos
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
              {selectedView === 'tickets' ? 'Histórico de Tickets' : 'Equipamentos'} - {selectedClient?.razao_social}
            </SheetTitle>
            <div className="flex space-x-2 mt-4">
              <Button
                variant={selectedView === 'tickets' ? 'default' : 'outline'}
                onClick={() => setSelectedView('tickets')}
              >
                <History className="h-4 w-4 mr-2" />
                Tickets
              </Button>
              <Button
                variant={selectedView === 'equipment' ? 'default' : 'outline'}
                onClick={() => setSelectedView('equipment')}
              >
                <Wrench className="h-4 w-4 mr-2" />
                Equipamentos
              </Button>
            </div>
          </SheetHeader>

          {selectedView === 'tickets' ? (
            <div className="mt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data Agendada</TableHead>
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
                    </TableRow>
                  ))}
                  {clientTickets?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        Nenhum ticket encontrado para este cliente.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              <form onSubmit={handleEquipmentSubmit} className="space-y-4 border-b pb-6">
                <div>
                  <Label htmlFor="equipamento">Equipamento</Label>
                  <Input
                    id="equipamento"
                    value={equipmentForm.equipamento}
                    onChange={(e) => setEquipmentForm(prev => ({ ...prev, equipamento: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="numero_serie">Número de Série</Label>
                  <Input
                    id="numero_serie"
                    value={equipmentForm.numero_serie}
                    onChange={(e) => setEquipmentForm(prev => ({ ...prev, numero_serie: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label>Condição</Label>
                  <RadioGroup
                    value={equipmentForm.condicao}
                    onValueChange={(value: "NOVO" | "USADO" | "DEFEITO") => 
                      setEquipmentForm(prev => ({ ...prev, condicao: value }))
                    }
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="NOVO" id="novo" />
                      <Label htmlFor="novo">Novo</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="USADO" id="usado" />
                      <Label htmlFor="usado">Usado</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="DEFEITO" id="defeito" />
                      <Label htmlFor="defeito">Defeito</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={equipmentForm.observacoes}
                    onChange={(e) => setEquipmentForm(prev => ({ ...prev, observacoes: e.target.value }))}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Cadastrar Equipamento
                </Button>
              </form>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Equipamento</TableHead>
                    <TableHead>Nº Série</TableHead>
                    <TableHead>Condição</TableHead>
                    <TableHead>Nº Ticket</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientEquipment?.map((equipment) => {
                    console.log("Dados do equipamento:", equipment);
                    return (
                      <TableRow key={equipment.id}>
                        <TableCell>{equipment.codigo}</TableCell>
                        <TableCell>{equipment.equipamento}</TableCell>
                        <TableCell>{equipment.numero_serie}</TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              equipment.condicao === 'NOVO' ? 'bg-green-500' :
                              equipment.condicao === 'USADO' ? 'bg-yellow-500' :
                              'bg-red-500'
                            }
                          >
                            {equipment.condicao}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {equipment.ticket?.codigo ? equipment.ticket.codigo.split('-')[1] : '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {clientEquipment?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        Nenhum equipamento cadastrado para este cliente.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
