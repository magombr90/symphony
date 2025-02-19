
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  inProgress: number;
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

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {userStats?.map(({ user, total, inProgress }) => (
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
                  <Badge className="bg-blue-500">
                    {inProgress} em andamento
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Total de tickets: {total}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {statusCounts?.map((statusCount) => (
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
                  {statusCount.label}
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
