
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/types/ticket";
import { Pencil } from "lucide-react";

interface Equipment {
  id: string;
  codigo: string;
  equipamento: string;
  numero_serie: string | null;
  condicao: 'NOVO' | 'USADO' | 'DEFEITO';
  observacoes: string | null;
  client_id: string;
  ticket_id: string | null;
}

interface EditEquipmentDialogProps {
  equipment: Equipment;
  clients: Client[];
  onSuccess: () => void;
}

export function EditEquipmentDialog({ 
  equipment,
  clients,
  onSuccess 
}: EditEquipmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [equipmentForm, setEquipmentForm] = useState({
    equipamento: "",
    numero_serie: "",
    condicao: "NOVO" as "NOVO" | "USADO" | "DEFEITO",
    observacoes: "",
    client_id: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    if (equipment) {
      setEquipmentForm({
        equipamento: equipment.equipamento,
        numero_serie: equipment.numero_serie || "",
        condicao: equipment.condicao,
        observacoes: equipment.observacoes || "",
        client_id: equipment.client_id,
      });
    }
  }, [equipment]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!equipmentForm.client_id) {
      toast({
        variant: "destructive",
        title: "Cliente obrigatório",
        description: "Selecione um cliente para este equipamento",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("equipamentos")
        .update({
          equipamento: equipmentForm.equipamento,
          numero_serie: equipmentForm.numero_serie || null,
          condicao: equipmentForm.condicao,
          observacoes: equipmentForm.observacoes || null,
          client_id: equipmentForm.client_id,
        })
        .eq("id", equipment.id);

      if (error) throw error;

      toast({
        title: "Equipamento atualizado com sucesso!",
        description: `Equipamento ${equipment.codigo} atualizado`,
      });

      setOpen(false);
      onSuccess();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar equipamento",
        description: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button 
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Equipamento - {equipment.codigo}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="client_id">Cliente</Label>
            <select
              id="client_id"
              value={equipmentForm.client_id}
              onChange={(e) => setEquipmentForm(prev => ({ ...prev, client_id: e.target.value }))}
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            >
              <option value="">Selecione um cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.razao_social}
                </option>
              ))}
            </select>
          </div>
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
                <RadioGroupItem value="NOVO" id="edit-novo" />
                <Label htmlFor="edit-novo">Novo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="USADO" id="edit-usado" />
                <Label htmlFor="edit-usado">Usado</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="DEFEITO" id="edit-defeito" />
                <Label htmlFor="edit-defeito">Defeito</Label>
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
            Salvar Alterações
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
