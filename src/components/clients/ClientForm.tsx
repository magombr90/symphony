
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ClientFormData {
  cnpj: string;
  razao_social: string;
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
  isEdit?: boolean;
  loading?: boolean;
}

export function ClientForm({
  formData,
  onSubmit,
  onCNPJChange,
  onInputChange,
  isEdit = false,
  loading = false,
}: ClientFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="cnpj">CNPJ</Label>
        <Input 
          id="cnpj" 
          name="cnpj" 
          value={formData.cnpj}
          onChange={onCNPJChange}
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
          onChange={onInputChange}
          required 
        />
      </div>
      <div>
        <Label htmlFor="cep">CEP</Label>
        <Input 
          id="cep" 
          name="cep" 
          value={formData.cep}
          onChange={onInputChange}
        />
      </div>
      <div>
        <Label htmlFor="endereco">Endereço</Label>
        <Input 
          id="endereco" 
          name="endereco" 
          value={formData.endereco}
          onChange={onInputChange}
        />
      </div>
      <div>
        <Label htmlFor="telefone">Telefone</Label>
        <Input 
          id="telefone" 
          name="telefone" 
          value={formData.telefone}
          onChange={onInputChange}
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
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {isEdit ? "Atualizar" : "Salvar"}
      </Button>
    </form>
  );
}
