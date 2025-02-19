
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const identifier = String(formData.get("identifier"));
    const password = String(formData.get("password"));

    try {
      // Se não for um email, busca o email associado ao username
      let loginEmail = identifier;
      
      if (!identifier.includes('@')) {
        const { data: userData, error: userError } = await supabase
          .from("system_users")
          .select("email")
          .eq("username", identifier)
          .maybeSingle();

        if (userError) {
          console.error("Erro ao buscar usuário:", userError);
          throw new Error("Erro ao buscar usuário");
        }

        if (!userData) {
          throw new Error("Usuário não encontrado");
        }

        loginEmail = userData.email;
      }

      // Tenta fazer login com o email
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });

      if (authError) {
        console.error("Erro de autenticação:", authError);
        throw new Error("Credenciais inválidas");
      }

      navigate("/");
      
      toast({
        title: "Login realizado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: error instanceof Error ? error.message : "Erro desconhecido",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">E-mail ou Nome de Usuário</Label>
              <Input
                id="identifier"
                name="identifier"
                type="text"
                required
                disabled={isLoading}
                placeholder="Digite seu e-mail ou nome de usuário"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                disabled={isLoading}
                placeholder="Digite sua senha"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
