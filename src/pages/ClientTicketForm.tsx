
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type ClientSession = {
  clientId: string;
  clientName: string;
  email: string;
  timestamp: string;
};

export default function ClientTicketForm() {
  const [description, setDescription] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [clientSession, setClientSession] = useState<ClientSession | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if client is authenticated
  useEffect(() => {
    const session = localStorage.getItem("clientPortalSession");
    if (!session) {
      toast({
        variant: "destructive",
        title: "Acesso não autorizado",
        description: "Você precisa fazer login para acessar esta página.",
      });
      navigate("/client-portal");
      return;
    }

    try {
      const parsedSession = JSON.parse(session) as ClientSession;
      // Check if session is expired (24 hours)
      const sessionTime = new Date(parsedSession.timestamp).getTime();
      const currentTime = new Date().getTime();
      const sessionAge = (currentTime - sessionTime) / (1000 * 60 * 60); // in hours
      
      if (sessionAge > 24) {
        localStorage.removeItem("clientPortalSession");
        toast({
          variant: "destructive",
          title: "Sessão expirada",
          description: "Sua sessão expirou. Por favor, faça login novamente.",
        });
        navigate("/client-portal");
        return;
      }
      
      setClientSession(parsedSession);
    } catch (error) {
      localStorage.removeItem("clientPortalSession");
      navigate("/client-portal");
    }
  }, [navigate, toast]);

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientSession) {
      toast({
        variant: "destructive",
        title: "Erro ao enviar ticket",
        description: "Sessão inválida. Por favor, faça login novamente.",
      });
      navigate("/client-portal");
      return;
    }
    
    setLoading(true);

    try {
      // Get a system user for the client tickets
      const { data: systemUser } = await supabase
        .from("system_users")
        .select("id")
        .eq("role", "admin")
        .eq("active", true)
        .limit(1)
        .single();

      if (!systemUser) {
        throw new Error("Não foi possível encontrar um administrador ativo");
      }

      // Create a new ticket
      // Using .insert().select().single() so the trigger can generate the codigo
      const { data, error } = await supabase
        .from("tickets")
        .insert({
          client_id: clientSession.clientId,
          description: description,
          scheduled_for: new Date(scheduledDate).toISOString(),
          created_by: systemUser.id,
          status: "PENDENTE",
          // Add a temporary codigo that will be replaced by the trigger
          codigo: "TEMP-" + new Date().getTime()
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Ticket enviado com sucesso",
        description: `Seu ticket foi criado com o código ${data.codigo}.`,
      });
      
      // Clear form
      setDescription("");
      setScheduledDate("");

      // Redirect to success page
      navigate("/client-ticket-success");
    } catch (error) {
      console.error("Erro ao criar ticket:", error);
      toast({
        variant: "destructive",
        title: "Erro ao enviar ticket",
        description: "Não foi possível criar o ticket. Por favor, tente novamente mais tarde.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("clientPortalSession");
    navigate("/client-portal");
  };

  if (!clientSession) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col p-4">
      <div className="container mx-auto max-w-4xl flex-1">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Portal do Cliente</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Olá, <strong>{clientSession.clientName}</strong>
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Sair
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Solicitar Atendimento</CardTitle>
            <CardDescription>
              Descreva seu problema e sugerira uma data para atendimento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitTicket}>
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="description">Descrição do problema</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva detalhadamente o problema que está enfrentando"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    className="min-h-[120px]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Data sugerida para atendimento</Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Enviando..." : "Enviar solicitação"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
