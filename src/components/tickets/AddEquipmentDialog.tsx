
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
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/use-auth";

interface AddEquipmentDialogProps {
  clientId: string;
  ticketId?: string;
  ticketCode?: string;
  onSuccess: () => void;
}

type EquipmentInsert = Database['public']['Tables']['equipamentos']['Insert'];

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
  const { currentUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // Verificar quais campos são permitidos no tipo EquipmentInsert
      const insertData: EquipmentInsert = {
        client_id: clientId,
        equipamento: equipmentForm.equipamento,
        numero_serie: equipmentForm.numero_serie || null,
        condicao: equipmentForm.condicao,
        observacoes: equipmentForm.observacoes || null,
        codigo: "TEMP", // Valor temporário que será substituído pelo trigger
        ...(ticketId ? { ticket_id: ticketId } : {})
      };

      const { data, error } = await supabase
        .from("equipamentos")
        .insert([insertData])  // Passar o objeto dentro de um array
        .select('id, codigo')
        .single();

      if (error) throw error;

      // Se tiver ticket_id, registrar no histórico do ticket
      if (ticketId && currentUser) {
        const historyData = {
          ticket_id: ticketId,
          status: "EM_ANDAMENTO", // Assumindo que o ticket está em andamento quando equipamentos são retirados
          created_by: currentUser.id,
          action_type: "EQUIPMENT_STATUS",
          equipment_id: data.id,
          equipment_codigo: data.codigo,
          equipment_status: "RETIRADO",
          reason: "Equipamento retirado do cliente."
        };

        const { error: historyError } = await supabase
          .from("ticket_history")
          .insert([historyData]);

        if (historyError) {
          console.error("Erro ao registrar histórico:", historyError);
          // Não interrompe o fluxo, apenas loga o erro
        }
      }

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
