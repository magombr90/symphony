
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ReasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason: string;
  onReasonChange: (reason: string) => void;
  onSubmit: () => void;
  status?: string;
  editingTicket?: { status: string } | null;
}

export function ReasonDialog({
  open,
  onOpenChange,
  reason,
  onReasonChange,
  onSubmit,
  status,
  editingTicket,
}: ReasonDialogProps) {
  // Determinar o status do ticket, primeiro verificando o prop status direto,
  // depois tentando obter de editingTicket se disponível
  const ticketStatus = status || (editingTicket?.status);

  const getDialogTitle = () => {
    if (ticketStatus === "CANCELADO") {
      return "Motivo do Cancelamento";
    } else if (ticketStatus === "CONCLUIDO") {
      return "Motivo da Conclusão";
    }
    return "Adicionar Motivo";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim()) {
      onSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Motivo</Label>
            <Textarea
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder="Digite o motivo..."
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={!reason.trim()}
          >
            Salvar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
