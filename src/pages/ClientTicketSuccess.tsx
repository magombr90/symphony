
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export default function ClientTicketSuccess() {
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated in client portal
    const session = localStorage.getItem("clientPortalSession");
    if (!session) {
      navigate("/client-portal");
      return;
    }

    // Start countdown for redirection
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/client-ticket-form");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleNewTicket = () => {
    navigate("/client-ticket-form");
  };

  const handleLogout = () => {
    localStorage.removeItem("clientPortalSession");
    navigate("/client-portal");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Ticket Enviado!</CardTitle>
          <CardDescription className="text-center">
            Sua solicitação foi enviada com sucesso e será analisada pela nossa equipe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Você será redirecionado para a página de tickets em {countdown} segundos...
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button onClick={handleNewTicket} className="w-full">
            Criar outra solicitação
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            Sair do Portal
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
