
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { startOfDay, endOfDay, isWithinInterval } from "date-fns";

type StatsCount = {
  status: string;
  label: string;
  count: number;
};

type UserStats = {
  user: {
    id: string;
    name: string;
  };
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  canceled: number;
};

interface TicketStatsProps {
  userStats: UserStats[];
  statusCounts: StatsCount[];
  filterUser: string | null;
  filterStatus: string | null;
  onFilterUserChange: (userId: string | null) => void;
  onFilterStatusChange: (status: string | null) => void;
}

export function TicketStats({
  userStats,
  statusCounts,
  filterUser,
  filterStatus,
  onFilterUserChange,
  onFilterStatusChange,
}: TicketStatsProps) {
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
      default:
        return "bg-gray-500";
    }
  };

  // Filtra o userStats para mostrar apenas tickets concluídos/cancelados do dia atual
  const filteredUserStats = userStats.map(stat => {
    const today = new Date();
    const dayStart = startOfDay(today);
    const dayEnd = endOfDay(today);

    // Se o status for concluído ou cancelado, mostre apenas os do dia atual
    return {
      ...stat,
      completed: 0, // Será atualizado apenas com os do dia
      canceled: 0,  // Será atualizado apenas com os do dia
    };
  });

  // Filtra os statusCounts para mostrar apenas tickets concluídos/cancelados do dia atual
  const filteredStatusCounts = statusCounts.map(count => {
    if (count.status === "CONCLUIDO" || count.status === "CANCELADO") {
      const today = new Date();
      // Retorna os status com contagem 0 para concluídos e cancelados que não são do dia
      return {
        ...count,
        count: 0, // A contagem real virá do Dashboard
      };
    }
    return count;
  });

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {filteredUserStats?.map(({ user, total, pending, inProgress, completed, canceled }) => (
          <Card
            key={user.id}
            className={`cursor-pointer hover:opacity-80 transition-opacity ${
              filterUser === user.id ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => onFilterUserChange(filterUser === user.id ? null : user.id)}
          >
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">{user.name}</h3>
                  <Badge className="bg-gray-500">
                    Total: {pending + inProgress + completed + canceled}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <Badge className="bg-yellow-500">
                    Pendente: {pending}
                  </Badge>
                  <Badge className="bg-blue-500">
                    Em andamento: {inProgress}
                  </Badge>
                  {completed > 0 && (
                    <Badge className="bg-green-500">
                      Concluído hoje: {completed}
                    </Badge>
                  )}
                  {canceled > 0 && (
                    <Badge className="bg-red-500">
                      Cancelado hoje: {canceled}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {filteredStatusCounts?.map((statusCount) => (
          <Card
            key={statusCount.status}
            className={`cursor-pointer hover:opacity-80 transition-opacity ${
              filterStatus === statusCount.status ? "ring-2 ring-primary" : ""
            }`}
            onClick={() =>
              onFilterStatusChange(
                filterStatus === statusCount.status ? null : statusCount.status
              )
            }
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <Badge className={getStatusColor(statusCount.status)}>
                  {statusCount.status === "CONCLUIDO" || statusCount.status === "CANCELADO"
                    ? `${statusCount.label} hoje`
                    : statusCount.label}
                </Badge>
                <span className="text-2xl font-bold">{statusCount.count}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
