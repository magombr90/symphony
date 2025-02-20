
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { SystemUser } from "@/types/ticket";

interface TicketProgressProps {
  ticket: {
    id: string;
    status: string;
  } | null;
  onSuccess: () => void;
}

export function TicketProgress({ ticket, onSuccess }: TicketProgressProps) {
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState("");
  const { toast } = useToast();

  const { data: currentUser } = useQuery({
    queryKey: ["system-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_users")
        .select("*")
        .limit(1);
      if (error) throw error;
      return data[0] as SystemUser;
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!ticket || !currentUser) return;

    const historyData = {
      ticket_id: ticket.id,
      status: "EM_ANDAMENTO",
      reason: progress,
      created_by: currentUser.id,
    };

    const { error: historyError } = await supabase
      .from("ticket_history")
      .insert([historyData]);

    if (historyError) {
      toast({
        variant: "destructive",
        title: "Erro ao registrar andamento",
        description: historyError.message,
      });
      return;
    }

    // Atualiza o status do ticket para EM_ANDAMENTO
    const { error: updateError } = await supabase
      .from("tickets")
      .update({ status: "EM_ANDAMENTO" })
      .eq("id", ticket.id);

    if (updateError) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar status",
        description: updateError.message,
      });
      return;
    }

    toast({
      title: "Andamento registrado com sucesso!",
    });
    setOpen(false);
    setProgress("");
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button 
        variant="outline" 
        onClick={() => setOpen(true)}
      >
        Registrar Andamento
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Andamento do Ticket</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Descrição do Andamento</Label>
            <Textarea
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
              placeholder="Descreva o andamento do ticket..."
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Salvar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
