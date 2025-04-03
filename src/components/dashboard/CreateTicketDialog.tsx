
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Ticket
        </Button>
      </DialogTrigger>
      <DialogContent>
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
