
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";
import { Client } from "@/types/client";

interface ClientDetailsProps {
  client: Client;
  onEdit: (client: Client) => void;
}

export function ClientDetails({ client, onEdit }: ClientDetailsProps) {
  return (
    <div className="mt-6 space-y-4">
      <div>
        <Label className="text-muted-foreground">CNPJ</Label>
        <p className="text-lg">{client.cnpj}</p>
      </div>
      <div>
        <Label className="text-muted-foreground">Razão Social</Label>
        <p className="text-lg">{client.razao_social}</p>
      </div>
      <div>
        <Label className="text-muted-foreground">CEP</Label>
        <p className="text-lg">{client.cep || "-"}</p>
      </div>
      <div>
        <Label className="text-muted-foreground">Endereço</Label>
        <p className="text-lg">{client.endereco || "-"}</p>
      </div>
      <div>
        <Label className="text-muted-foreground">Telefone</Label>
        <p className="text-lg">{client.telefone || "-"}</p>
      </div>
      <div>
        <Label className="text-muted-foreground">Email</Label>
        <p className="text-lg">{client.email || "-"}</p>
      </div>
      <div>
        <Label className="text-muted-foreground">Observações</Label>
        <p className="text-lg whitespace-pre-wrap">{client.observacoes || "-"}</p>
      </div>
      <Button 
        className="w-full mt-6" 
        onClick={() => onEdit(client)}
      >
        <Pencil className="h-4 w-4 mr-2" />
        Editar
      </Button>
    </div>
  );
}
