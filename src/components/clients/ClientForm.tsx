
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search } from "lucide-react";

interface ClientFormData {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  endereco: string;
  telefone: string;
  email: string;
  cep: string;
  observacoes: string;
}

interface ClientFormProps {
  formData: ClientFormData;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onCNPJChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onCNPJSearch: () => void;
  isEdit?: boolean;
  loading?: boolean;
  searchingCNPJ?: boolean;
}

export function ClientForm({
  formData,
  onSubmit,
  onCNPJChange,
  onInputChange,
  onCNPJSearch,
  isEdit = false,
  loading = false,
  searchingCNPJ = false,
}: ClientFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1">
          <Label htmlFor="cnpj">CNPJ</Label>
          <div className="flex">
            <Input 
              id="cnpj" 
              name="cnpj" 
              value={formData.cnpj}
              onChange={onCNPJChange}
              required 
              disabled={loading || isEdit || searchingCNPJ}
              className="rounded-r-none"
              placeholder="00.000.000/0000-00"
            />
            <Button 
              type="button" 
              onClick={onCNPJSearch} 
              className="rounded-l-none" 
              variant="secondary"
              disabled={isEdit || searchingCNPJ || formData.cnpj.replace(/[^\d]/g, '').length !== 14}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <div>
        <Label htmlFor="razao_social">Razão Social</Label>
        <Input 
          id="razao_social" 
          name="razao_social" 
          value={formData.razao_social}
          onChange={onInputChange}
          required 
          disabled={loading || searchingCNPJ}
        />
      </div>
      <div>
        <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
        <Input 
          id="nome_fantasia" 
          name="nome_fantasia" 
          value={formData.nome_fantasia}
          onChange={onInputChange}
          placeholder="Nome que aparecerá nos tickets"
          disabled={loading || searchingCNPJ}
        />
      </div>
      <div>
        <Label htmlFor="cep">CEP</Label>
        <Input 
          id="cep" 
          name="cep" 
          value={formData.cep}
          onChange={onInputChange}
          disabled={loading || searchingCNPJ}
          placeholder="00000-000"
        />
      </div>
      <div>
        <Label htmlFor="endereco">Endereço</Label>
        <Input 
          id="endereco" 
          name="endereco" 
          value={formData.endereco}
          onChange={onInputChange}
          disabled={loading || searchingCNPJ}
        />
      </div>
      <div>
        <Label htmlFor="telefone">Telefone</Label>
        <Input 
          id="telefone" 
          name="telefone" 
          value={formData.telefone}
          onChange={onInputChange}
          disabled={loading || searchingCNPJ}
          placeholder="(00) 00000-0000"
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          name="email" 
          type="email" 
          value={formData.email}
          onChange={onInputChange}
          disabled={loading || searchingCNPJ}
        />
      </div>
      <div>
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          name="observacoes"
          value={formData.observacoes}
          onChange={onInputChange}
          rows={4}
          disabled={loading || searchingCNPJ}
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading || searchingCNPJ}>
        {isEdit ? "Atualizar" : "Salvar"}
      </Button>
    </form>
  );
}
