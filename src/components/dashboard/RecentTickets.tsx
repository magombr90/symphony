
import { Card } from "@/components/ui/card";
import { TicketsTable } from "@/components/tickets/TicketsTable";
import { Ticket } from "@/types/ticket";

interface RecentTicketsProps {
  tickets: Ticket[];
  onViewDetails: (ticket: Ticket) => void;
  onAssign: (ticket: Ticket) => void;
}

export function RecentTickets({ tickets, onViewDetails, onAssign }: RecentTicketsProps) {
  return (
    <Card>
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">
          Tickets Recentes
          {tickets.length === 0 && (
            <span className="text-sm font-normal text-muted-foreground ml-2">
              (Filtrados)
            </span>
          )}
        </h2>
        <TicketsTable 
          tickets={tickets} 
          onStatusChange={() => {}} 
          onViewDetails={onViewDetails}
          onAssign={onAssign}
        />
      </div>
    </Card>
  );
}
