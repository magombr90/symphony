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
import { Plus, Eye, Pencil } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

type Client = {
  id: string;
  cnpj: string;
  razao_social: string;
  endereco: string | null;
  telefone: string | null;
  email: string | null;
  cep: string | null;
  observacoes: string | null;
  created_at: string;
};

export default function Clients() {
  const [open, setOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cnpj: "",
    razao_social: "",
    endereco: "",
    telefone: "",
    email: "",
    cep: "",
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
        cep: data.estabelecimento.cep || "",
        observacoes: "",
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      cep: formData.cep || null,
      observacoes: formData.observacoes || null,
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
      cep: "",
      observacoes: "",
    });
    refetch();
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedClient) return;

    const { error } = await supabase
      .from("clients")
      .update({
        razao_social: formData.razao_social,
        endereco: formData.endereco || null,
        telefone: formData.telefone || null,
        email: formData.email || null,
        cep: formData.cep || null,
        observacoes: formData.observacoes || null,
      })
      .eq("id", selectedClient.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar cliente",
        description: error.message,
      });
      return;
    }

    toast({
      title: "Cliente atualizado com sucesso!",
    });
    setIsEditing(false);
    setSelectedClient(null);
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

  const handleEdit = (client: Client) => {
    setFormData({
      cnpj: client.cnpj,
      razao_social: client.razao_social,
      endereco: client.endereco || "",
      telefone: client.telefone || "",
      email: client.email || "",
      cep: client.cep || "",
      observacoes: client.observacoes || "",
    });
    setSelectedClient(client);
    setIsEditing(true);
  };

  const ClientForm = ({ onSubmit, isEdit = false }: { onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>, isEdit?: boolean }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="cnpj">CNPJ</Label>
        <Input 
          id="cnpj" 
          name="cnpj" 
          value={formData.cnpj}
          onChange={handleCNPJChange}
          required 
          disabled={loading || isEdit}
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
        <Label htmlFor="cep">CEP</Label>
        <Input 
          id="cep" 
          name="cep" 
          value={formData.cep}
          onChange={handleInputChange}
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
      <div>
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          name="observacoes"
          value={formData.observacoes}
          onChange={handleInputChange}
          rows={4}
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {isEdit ? "Atualizar" : "Salvar"}
      </Button>
    </form>
  );

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
            <ClientForm onSubmit={handleSubmit} />
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
                <TableHead>CEP</TableHead>
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
                  <TableCell>{client.cep}</TableCell>
                  <TableCell className="space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedClient(client)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Detalhes
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(client)}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Editar
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

      <Sheet open={!!selectedClient && !isEditing} onOpenChange={(open) => !open && setSelectedClient(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Detalhes do Cliente</SheetTitle>
          </SheetHeader>
          {selectedClient && (
            <div className="mt-6 space-y-4">
              <div>
                <Label className="text-muted-foreground">CNPJ</Label>
                <p className="text-lg">{selectedClient.cnpj}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Razão Social</Label>
                <p className="text-lg">{selectedClient.razao_social}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">CEP</Label>
                <p className="text-lg">{selectedClient.cep || "-"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Endereço</Label>
                <p className="text-lg">{selectedClient.endereco || "-"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Telefone</Label>
                <p className="text-lg">{selectedClient.telefone || "-"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p className="text-lg">{selectedClient.email || "-"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Observações</Label>
                <p className="text-lg whitespace-pre-wrap">{selectedClient.observacoes || "-"}</p>
              </div>
              <Button 
                className="w-full mt-6" 
                onClick={() => handleEdit(selectedClient)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={isEditing} onOpenChange={(open) => !open && setIsEditing(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>
          <ClientForm onSubmit={handleUpdate} isEdit />
        </DialogContent>
      </Dialog>
    </div>
  );
}
