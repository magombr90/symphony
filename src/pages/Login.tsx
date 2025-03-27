
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log("Tentando fazer login com:", email);
      
      // Try to sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      console.log("Login successful:", data);
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo ao sistema.",
      });
      
      navigate("/");
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Mensagem de erro mais específica
      let errorMessage = "Verifique suas credenciais e tente novamente.";
      if (error.message) {
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Credenciais inválidas. Verifique seu email e senha.";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Email não confirmado. Verifique sua caixa de entrada.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Erro ao fazer login",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para criar usuário administrador diretamente na tela de login (para facilitar o primeiro acesso)
  const createAdminUser = async () => {
    setLoading(true);
    try {
      const response = await supabase.functions.invoke('create-user', {
        body: {
          email: 'mailton@tfsinformatica.com.br',
          password: '29786015',
          name: 'Mailton',
          role: 'admin'
        }
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      // Preencher automaticamente os campos
      setEmail('mailton@tfsinformatica.com.br');
      setPassword('29786015');
      
      toast({
        title: "Usuário administrador criado com sucesso",
        description: "Agora você pode fazer login"
      });
    } catch (error: any) {
      console.error("Error creating admin user:", error);
      toast({
        title: "Erro ao criar usuário administrador",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Symphony</CardTitle>
          <CardDescription className="text-center">
            Entre com suas credenciais para acessar o sistema
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Senha</label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full mt-2" 
              onClick={createAdminUser}
              disabled={loading}
            >
              Criar Usuário Admin
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
