
import { Card } from "@/components/ui/card";
import { TicketsTable } from "@/components/tickets/TicketsTable";
import { TicketStats } from "@/components/tickets/TicketStats";
import { useTickets } from "@/hooks/use-tickets";
import { Ticket } from "@/types/ticket";

export default function Dashboard() {
  const { tickets } = useTickets();

  const recentTickets = tickets?.slice(0, 5) || [];

  return (
    <div className="fade-in space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      <div className="grid gap-4">
        <TicketStats tickets={tickets || []} />
        
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Tickets Recentes</h2>
            <TicketsTable 
              tickets={recentTickets} 
              onStatusChange={() => {}} 
              onViewDetails={() => {}}
              onAssign={() => {}} // Adicionando a propriedade que faltava
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
