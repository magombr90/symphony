
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function ClientPortal() {
  const [email, setEmail] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Look for a client with the given email and CNPJ
      const { data, error } = await supabase
        .from("clients")
        .select("id, razao_social")
        .eq("email", email)
        .eq("cnpj", cnpj)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        // Set client information in localStorage for the portal session
        localStorage.setItem(
          "clientPortalSession", 
          JSON.stringify({
            clientId: data.id,
            clientName: data.razao_social,
            email: email,
            timestamp: new Date().toISOString()
          })
        );
        
        toast({
          title: "Acesso com sucesso",
          description: `Bem-vindo, ${data.razao_social}!`,
        });
        
        navigate("/client-ticket-form");
      }
    } catch (error) {
      console.error("Erro ao acessar:", error);
      toast({
        variant: "destructive",
        title: "Erro ao acessar",
        description: "Email ou CNPJ incorretos. Por favor, verifique suas informações.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Portal do Cliente</CardTitle>
          <CardDescription className="text-center">
            Entre com seu email e CNPJ para acessar o portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAccess}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  type="text"
                  placeholder="00.000.000/0000-00"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Verificando..." : "Acessar"}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <p className="text-sm text-center text-muted-foreground mt-2">
            Para suporte, entre em contato conosco pelo telefone ou email.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
