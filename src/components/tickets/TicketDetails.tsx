import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Ticket, TicketHistory } from "@/types/ticket";
import { TicketProgress } from "@/components/ui/ticket-progress";

interface TicketDetailsProps {
  ticket: Ticket | null;
  history: TicketHistory[];
  onClose: () => void;
}

const statusOptions = [
  { value: "PENDENTE", label: "Pendente" },
  { value: "EM_ANDAMENTO", label: "Em Andamento" },
  { value: "CONCLUIDO", label: "Concluído" },
  { value: "CANCELADO", label: "Cancelado" },
  { value: "FATURADO", label: "Faturado" },
];

export function TicketDetails({ ticket, history, onClose }: TicketDetailsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDENTE":
        return "bg-yellow-500";
      case "EM_ANDAMENTO":
        return "bg-blue-500";
      case "CONCLUIDO":
        return "bg-green-500";
      case "CANCELADO":
        return "bg-red-500";
      case "FATURADO":
        return "bg-green-700";
      default:
        return "bg-gray-500";
    }
  };

  const getHistoryText = (item: TicketHistory) => {
    if (item.action_type === 'USER_ASSIGNMENT') {
      const previousUser = item.previous_assigned_to ? 
        `${item.previous_assigned_to_user?.name}` : 
        "Nenhum usuário";
      const newUser = item.new_assigned_to_user?.name;
      return `Ticket reatribuído de ${previousUser} para ${newUser}`;
    } else {
      return `Status alterado para ${statusOptions.find(s => s.value === item.status)?.label}`;
    }
  };

  return (
    <Sheet open={!!ticket} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            Detalhes do Ticket - {ticket?.codigo}
          </SheetTitle>
        </SheetHeader>
        {ticket && (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Cliente</Label>
                <p className="mt-1">{ticket.client.razao_social}</p>
              </div>
              <div>
                <Label>Responsável</Label>
                <p className="mt-1">{ticket.assigned_user?.name}</p>
              </div>
              <div>
                <Label>Data Agendada</Label>
                <p className="mt-1">
                  {format(new Date(ticket.scheduled_for), "dd/MM/yyyy HH:mm")}
                </p>
              </div>
              <div>
                <Label>Status Atual</Label>
                <Badge className={`mt-1 ${getStatusColor(ticket.status)}`}>
                  {statusOptions.find((s) => s.value === ticket.status)?.label}
                </Badge>
              </div>
            </div>

            <div>
              <Label>Descrição</Label>
              <p className="mt-1">{ticket.description}</p>
            </div>

            <div className="flex justify-end">
              <TicketProgress
                ticket={ticket}
                onSuccess={() => {
                  onClose();
                  // Aqui você deve atualizar a lista de tickets
                }}
              />
            </div>

            <div>
              <Label className="mb-2 block">Histórico</Label>
              {history.length > 0 ? (
                <div className="space-y-4">
                  {history.map((item) => (
                    <div key={item.id} className="border p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            {getHistoryText(item)}
                          </p>
                          {item.reason && (
                            <p className="mt-2 text-sm text-gray-600">
                              Motivo: {item.reason}
                            </p>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          <p>{format(new Date(item.created_at), "dd/MM/yyyy HH:mm")}</p>
                          <p className="text-right">por {item.created_by_user.name}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Nenhuma alteração registrada.</p>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
