
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
      // Primeiro, tenta fazer login direto com o email
      let { error: authError } = await supabase.auth.signInWithPassword({
        email: identifier,
        password,
      });

      // Se falhar e o identificador não parece ser um email, tenta buscar o usuário pelo username
      if (authError && !identifier.includes('@')) {
        const { data: userData, error: userError } = await supabase
          .from("system_users")
          .select("email")
          .eq("username", identifier)
          .eq("active", true)
          .single();

        if (userError || !userData) {
          throw new Error("Usuário não encontrado ou inativo");
        }

        // Tenta fazer login com o email encontrado
        const { error: secondAuthError } = await supabase.auth.signInWithPassword({
          email: userData.email,
          password,
        });

        if (secondAuthError) {
          throw new Error("Credenciais inválidas");
        }
      } else if (authError) {
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
