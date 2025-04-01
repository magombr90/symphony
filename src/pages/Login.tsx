
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, LogIn, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AuthError } from "@supabase/supabase-js";

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
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        handleAuthError(error);
        return;
      }

      if (!data.user) {
        toast({
          title: "Erro de autenticação",
          description: "Usuário não encontrado",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Login realizado com sucesso",
        description: `Bem-vindo!`
      });
      
      navigate("/");
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao tentar fazer login",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAuthError = (error: AuthError) => {
    console.error("Auth error:", error);
    
    const errorMessages: Record<string, string> = {
      "Invalid login credentials": "Credenciais inválidas. Verifique seu email e senha.",
      "Email not confirmed": "Email não confirmado. Verifique sua caixa de entrada.",
      "Invalid email or password": "Email ou senha inválidos."
    };

    toast({
      title: "Erro de autenticação",
      description: errorMessages[error.message] || error.message,
      variant: "destructive"
    });
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
          <CardFooter>
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
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
