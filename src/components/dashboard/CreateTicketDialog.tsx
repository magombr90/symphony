
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreateTicketForm } from "@/components/tickets/CreateTicketForm";
import { Client } from "@/types/client";
import { SystemUser } from "@/types/ticket";

interface CreateTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: Client[];
  systemUsers: SystemUser[];
  onSuccess: () => void;
}

export function CreateTicketDialog({ 
  open, 
  onOpenChange, 
  clients, 
  systemUsers, 
  onSuccess 
}: CreateTicketDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Novo Ticket</DialogTitle>
        </DialogHeader>
        <CreateTicketForm
          clients={clients}
          systemUsers={systemUsers}
          onSuccess={() => {
            onOpenChange(false);
            onSuccess();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
