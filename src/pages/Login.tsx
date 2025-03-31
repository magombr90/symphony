
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, LogIn, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      // Verificar se o usuário existe e está ativo na tabela system_users
      const { data: userData, error: userError } = await supabase
        .from("system_users")
        .select("*")
        .eq("email", email)
        .eq("active", true)
        .single();
      
      if (userError || !userData) {
        toast({
          title: "Erro de autenticação",
          description: "Usuário não encontrado ou inativo",
          variant: "destructive"
        });
        return;
      }

      // Verificar a senha no sistema_users antes de tentar auth
      if (userData.password !== password) {
        toast({
          title: "Erro de autenticação",
          description: "Senha incorreta",
          variant: "destructive"
        });
        return;
      }

      // Tentar fazer login via Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Erro de autenticação",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      // Sucesso no login
      toast({
        title: "Login realizado com sucesso",
        description: `Bem-vindo, ${userData.name}!`
      });
      
      navigate("/");
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao tentar fazer login",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Adicionando função para resetar a senha do usuário específico
  const resetPassword = async () => {
    try {
      setLoading(true);
      
      // Update the password in the system_users table
      const { error } = await supabase
        .from("system_users")
        .update({ password: "29786015" })
        .eq("email", "mailton@tfsinformatica.com.br");
      
      if (error) {
        toast({
          title: "Erro ao resetar senha",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Senha resetada com sucesso",
        description: "A senha foi atualizada para o usuário mailton@tfsinformatica.com.br"
      });
      
      // Preencher os campos automaticamente para facilitar o login
      setEmail("mailton@tfsinformatica.com.br");
      setPassword("29786015");
      
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao tentar resetar a senha",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>
            Entre com suas credenciais para acessar o sistema
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  placeholder="seuemail@exemplo.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  placeholder="Digite sua senha"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 top-1"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Entrando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Entrar
                </span>
              )}
            </Button>
            
            {/* Botão temporário para resetar a senha */}
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={resetPassword}
              disabled={loading}
            >
              Resetar Senha (mailton@tfsinformatica.com.br)
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
