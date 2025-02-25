
import { useState } from "react";
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
import type { Database } from "@/integrations/supabase/types";
import { Client } from "@/types/ticket";

interface CreateEquipmentDialogProps {
  clients: Client[];
  onSuccess: () => void;
}

type EquipmentInsert = Database['public']['Tables']['equipamentos']['Insert'];

export function CreateEquipmentDialog({ 
  clients, 
  onSuccess 
}: CreateEquipmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [equipmentForm, setEquipmentForm] = useState({
    equipamento: "",
    numero_serie: "",
    condicao: "NOVO" as "NOVO" | "USADO" | "DEFEITO",
    observacoes: "",
    client_id: "",
  });
  const { toast } = useToast();

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
      const insertData: EquipmentInsert = {
        client_id: equipmentForm.client_id,
        equipamento: equipmentForm.equipamento,
        numero_serie: equipmentForm.numero_serie || null,
        condicao: equipmentForm.condicao,
        observacoes: equipmentForm.observacoes || null,
        codigo: "TEMP", // Valor temporário que será substituído pelo trigger
      };

      const { data, error } = await supabase
        .from("equipamentos")
        .insert([insertData])
        .select('id, codigo')
        .single();

      if (error) throw error;

      toast({
        title: "Equipamento cadastrado com sucesso!",
        description: `Equipamento ${data.codigo} cadastrado`,
      });

      setEquipmentForm({
        equipamento: "",
        numero_serie: "",
        condicao: "NOVO",
        observacoes: "",
        client_id: "",
      });
      setOpen(false);
      onSuccess();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao cadastrar equipamento",
        description: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button 
        onClick={() => setOpen(true)}
      >
        Novo Equipamento
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Equipamento</DialogTitle>
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
      </DialogContent>
    </Dialog>
  );
}
