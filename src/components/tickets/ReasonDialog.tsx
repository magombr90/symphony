
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
          <DialogTitle>
            {ticketStatus === "CANCELADO"
              ? "Motivo do Cancelamento"
              : "Motivo da Conclusão"}
          </DialogTitle>
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
