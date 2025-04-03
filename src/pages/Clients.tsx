
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ClientForm } from "@/components/clients/ClientForm";
import { ClientDetails } from "@/components/clients/ClientDetails";
import { ClientsTable } from "@/components/clients/ClientsTable";
import { Client, ClientFormData } from "@/types/client";

const initialFormData: ClientFormData = {
  cnpj: "",
  razao_social: "",
  nome_fantasia: "",
  endereco: "",
  telefone: "",
  email: "",
  cep: "",
  observacoes: "",
};

export default function Clients() {
  const [open, setOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchingCNPJ, setSearchingCNPJ] = useState(false);
  const [formData, setFormData] = useState<ClientFormData>(initialFormData);
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

  const fetchCNPJData = async () => {
    const cnpj = formData.cnpj.replace(/[^\d]/g, '');
    if (cnpj.length !== 14) {
      toast({
        variant: "destructive",
        title: "CNPJ inválido",
        description: "O CNPJ deve conter 14 dígitos",
      });
      return;
    }

    setSearchingCNPJ(true);
    try {
      const response = await fetch(`https://publica.cnpj.ws/cnpj/${cnpj}`);
      
      if (!response.ok) {
        throw new Error('CNPJ não encontrado');
      }

      const data = await response.json();
      
      setFormData({
        cnpj: formData.cnpj,
        razao_social: data.razao_social,
        nome_fantasia: data.estabelecimento.nome_fantasia || data.razao_social,
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
      setSearchingCNPJ(false);
    }
  };

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Format CNPJ: XX.XXX.XXX/XXXX-XX
    let formatted = value.replace(/\D/g, '');
    if (formatted.length > 14) formatted = formatted.substring(0, 14);
    
    if (formatted.length > 12) {
      formatted = `${formatted.substring(0, 2)}.${formatted.substring(2, 5)}.${formatted.substring(5, 8)}/${formatted.substring(8, 12)}-${formatted.substring(12)}`;
    } else if (formatted.length > 8) {
      formatted = `${formatted.substring(0, 2)}.${formatted.substring(2, 5)}.${formatted.substring(5, 8)}/${formatted.substring(8)}`;
    } else if (formatted.length > 5) {
      formatted = `${formatted.substring(0, 2)}.${formatted.substring(2, 5)}.${formatted.substring(5)}`;
    } else if (formatted.length > 2) {
      formatted = `${formatted.substring(0, 2)}.${formatted.substring(2)}`;
    }
    
    setFormData(prev => ({ ...prev, cnpj: formatted }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.from("clients").insert({
        cnpj: formData.cnpj,
        razao_social: formData.razao_social,
        nome_fantasia: formData.nome_fantasia || null,
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
      setFormData(initialFormData);
      refetch();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedClient) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from("clients")
        .update({
          razao_social: formData.razao_social,
          nome_fantasia: formData.nome_fantasia || null,
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
    } finally {
      setLoading(false);
    }
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
      nome_fantasia: client.nome_fantasia || "",
      endereco: client.endereco || "",
      telefone: client.telefone || "",
      email: client.email || "",
      cep: client.cep || "",
      observacoes: client.observacoes || "",
    });
    setSelectedClient(client);
    setIsEditing(true);
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
            <ClientForm 
              formData={formData}
              onSubmit={handleSubmit}
              onCNPJChange={handleCNPJChange}
              onCNPJSearch={fetchCNPJData}
              onInputChange={handleInputChange}
              loading={loading}
              searchingCNPJ={searchingCNPJ}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="slide-in">
        <CardContent className="p-0">
          <ClientsTable 
            clients={clients || []}
            onView={setSelectedClient}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <Sheet open={!!selectedClient && !isEditing} onOpenChange={(open) => !open && setSelectedClient(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Detalhes do Cliente</SheetTitle>
          </SheetHeader>
          {selectedClient && (
            <ClientDetails 
              client={selectedClient}
              onEdit={handleEdit}
            />
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={isEditing} onOpenChange={(open) => {
        if (!open) {
          setIsEditing(false);
          setSelectedClient(null);
          setFormData(initialFormData);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>
          <ClientForm 
            formData={formData}
            onSubmit={handleUpdate}
            onCNPJChange={handleCNPJChange}
            onCNPJSearch={fetchCNPJData}
            onInputChange={handleInputChange}
            isEdit
            loading={loading}
            searchingCNPJ={searchingCNPJ}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
