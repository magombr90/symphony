
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { query } from "@/config/database";

interface AddEquipmentDialogProps {
  clientId: string;
  ticketId?: string;
  ticketCode?: string;
  onSuccess: () => void;
}

export function AddEquipmentDialog({ 
  clientId, 
  ticketId, 
  ticketCode, 
  onSuccess 
}: AddEquipmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [equipmentForm, setEquipmentForm] = useState({
    equipamento: "",
    numero_serie: "",
    condicao: "NOVO" as "NOVO" | "USADO" | "DEFEITO",
    observacoes: "",
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const { rows } = await query(
        `INSERT INTO equipamentos 
         (client_id, equipamento, numero_serie, condicao, observacoes, ticket_id) 
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, codigo`,
        [
          clientId,
          equipmentForm.equipamento,
          equipmentForm.numero_serie || null,
          equipmentForm.condicao,
          equipmentForm.observacoes || null,
          ticketId
        ]
      );

      toast({
        title: "Equipamento cadastrado com sucesso!",
        description: ticketCode 
          ? `Equipamento vinculado ao ticket ${ticketCode}` 
          : "Equipamento cadastrado para o cliente",
      });

      setEquipmentForm({
        equipamento: "",
        numero_serie: "",
        condicao: "NOVO",
        observacoes: "",
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
        variant="outline"
        onClick={() => setOpen(true)}
      >
        Adicionar Equipamento
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Equipamento</DialogTitle>
          {ticketCode && (
            <DialogDescription>
              Vinculado ao ticket: {ticketCode}
            </DialogDescription>
          )}
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
