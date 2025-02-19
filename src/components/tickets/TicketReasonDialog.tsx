
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TicketReasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: string;
  reason: string;
  onReasonChange: (reason: string) => void;
  onSubmit: () => void;
}

export function TicketReasonDialog({
  open,
  onOpenChange,
  status,
  reason,
  onReasonChange,
  onSubmit,
}: TicketReasonDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {status === "CANCELADO"
              ? "Motivo do Cancelamento"
              : "Motivo da Conclusão"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
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
            onClick={onSubmit}
            className="w-full"
            disabled={!reason.trim()}
          >
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
