
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Ticket } from "@/types/ticket";

interface ReasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTicket: Ticket | null;
  reason: string;
  onReasonChange: (reason: string) => void;
  onSubmit: () => void;
}

export function ReasonDialog({
  open,
  onOpenChange,
  editingTicket,
  reason,
  onReasonChange,
  onSubmit,
}: ReasonDialogProps) {
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
            {editingTicket?.status === "CANCELADO"
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
