
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SystemUser, Ticket } from "@/types/ticket";

interface AssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: Ticket | null;
  users: SystemUser[];
  selectedUser: string | null;
  onUserChange: (userId: string) => void;
  onSubmit: () => void;
}

export function AssignDialog({
  open,
  onOpenChange,
  ticket,
  users = [], // Set default empty array
  selectedUser,
  onUserChange,
  onSubmit,
}: AssignDialogProps) {
  // Ensure users is always an array
  const safeUsers = Array.isArray(users) ? users : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reatribuir Ticket</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Select
              value={selectedUser || undefined}
              onValueChange={onUserChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um usuário" />
              </SelectTrigger>
              <SelectContent>
                {safeUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={onSubmit}
            className="w-full"
            disabled={!selectedUser}
          >
            Confirmar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
