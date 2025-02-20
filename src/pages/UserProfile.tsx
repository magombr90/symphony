
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, User, Shield } from "lucide-react";

export default function UserProfile() {
  const { currentUser } = useAuth();

  return (
    <div className="fade-in space-y-8">
      <h1 className="text-3xl font-bold">Perfil do Usuário</h1>

      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">{currentUser?.name}</h2>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{currentUser?.email}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="font-medium">Função:</span>
              <span className="capitalize">{currentUser?.role}</span>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="outline">Editar Perfil</Button>
              <Button variant="outline">Alterar Senha</Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
