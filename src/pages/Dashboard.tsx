
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, FileBox } from "lucide-react";
import { useNavigate } from "react-router-dom";

const stats = [
  {
    title: "Tickets Abertos",
    value: "12",
    icon: FileBox,
    color: "text-blue-500",
    status: "ABERTO",
  },
  {
    title: "Em Atendimento",
    value: "4",
    icon: Clock,
    color: "text-yellow-500",
    status: "ATENDENDO",
  },
  {
    title: "Encerrados Hoje",
    value: "8",
    icon: CheckCircle,
    color: "text-green-500",
    status: "FECHADO",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();

  const handleCardClick = (status: string) => {
    navigate(`/tickets?status=${status}`);
  };

  return (
    <div className="fade-in">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card 
            key={stat.title} 
            className="slide-in cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleCardClick(stat.status)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
