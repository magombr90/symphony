
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Trash2 } from "lucide-react";

interface DeleteEquipmentDialogProps {
  equipmentId: string;
  equipmentCode: string;
  onSuccess: () => void;
}

export function DeleteEquipmentDialog({ 
  equipmentId,
  equipmentCode,
  onSuccess 
}: DeleteEquipmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("equipamentos")
        .delete()
        .eq("id", equipmentId);

      if (error) throw error;

      toast({
        title: "Equipamento excluído com sucesso",
        description: `Equipamento ${equipmentCode} foi removido`,
      });
      
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error("Erro ao excluir equipamento:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir equipamento",
        description: error instanceof Error ? error.message : "Não foi possível excluir este equipamento. Talvez ele esteja associado a um ticket.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button 
        variant="ghost"
        size="icon"
        className="hover:bg-red-100 hover:text-red-700"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir Equipamento</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir o equipamento {equipmentCode}?
            Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Excluindo..." : "Excluir Equipamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
