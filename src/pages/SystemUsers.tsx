
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SystemUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  created_at: string;
};

const roleOptions = [
  { value: "admin", label: "Administrador" },
  { value: "user", label: "Usuário" },
];

export default function SystemUsers() {
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState("user");

  const { data: users, refetch } = useQuery({
    queryKey: ["system-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_users")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as SystemUser[];
    },
  });

  const handleEdit = (user: SystemUser) => {
    setEditingUser(user);
    setSelectedRole(user.role);
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const userData = {
      name: String(formData.get("name")),
      email: String(formData.get("email")),
      role: selectedRole,
      active: formData.get("active") === "true",
    };

    // Get the password value
    const password = formData.get("password");
    
    let error;
    if (editingUser) {
      // Atualização
      ({ error } = await supabase
        .from("system_users")
        .update(userData)
        .eq("id", editingUser.id));
        
      // If there's a password, we need to update it separately via a custom API call or function
      if (password && String(password).length > 0) {
        // Handle password update through a custom API endpoint or function
        // This should be implemented according to your application's auth flow
        console.log("Password update required for user", editingUser.id);
        
        toast({
          title: "Senha não pode ser alterada diretamente",
          description: "A alteração de senha precisa ser feita por outro meio.",
          variant: "destructive"
        });
      }
    } else {
      // Criação - use the Auth API instead of direct DB insert for new users
      if (!password) {
        toast({
          variant: "destructive",
          title: "Erro ao criar usuário",
          description: "Senha é obrigatória para novos usuários",
        });
        return;
      }
      
      // Use Auth signup API instead of direct insert
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: String(formData.get("email")),
        password: String(password),
        options: {
          data: {
            name: String(formData.get("name")),
            role: selectedRole
          }
        }
      });
      
      error = authError;
      
      // The trigger should handle creating the system_users record,
      // but we can update it if needed
      if (!error && authData.user) {
        // We might need to update additional fields not handled by the trigger
        if (selectedRole !== "user") {
          await supabase
            .from("system_users")
            .update({ role: selectedRole })
            .eq("id", authData.user.id);
        }
      }
    }

    if (error) {
      toast({
        variant: "destructive",
        title: `Erro ao ${editingUser ? 'atualizar' : 'criar'} usuário`,
        description: error.message,
      });
      return;
    }

    toast({
      title: `Usuário ${editingUser ? 'atualizado' : 'criado'} com sucesso!`,
    });
    setOpen(false);
    setEditingUser(null);
    refetch();
  };

  const handleClose = () => {
    setOpen(false);
    setEditingUser(null);
    setSelectedRole("user");
  };

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Usuários do Sistema</h1>
        <Dialog open={open} onOpenChange={handleClose}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingUser ? "Editar Usuário" : "Novo Usuário"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input 
                  id="name" 
                  name="name" 
                  required 
                  defaultValue={editingUser?.name || ""}
                />
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  required 
                  defaultValue={editingUser?.email || ""}
                />
              </div>
              <div>
                <Label htmlFor="password">
                  {editingUser ? "Nova Senha (opcional)" : "Senha"}
                </Label>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  required={!editingUser}
                  minLength={6}
                />
              </div>
              <div>
                <Label>Função</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {editingUser && (
                <div>
                  <Label>Status</Label>
                  <Select 
                    defaultValue={editingUser.active ? "true" : "false"} 
                    name="active"
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Ativo</SelectItem>
                      <SelectItem value="false">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Button type="submit" className="w-full">
                {editingUser ? "Atualizar" : "Salvar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {roleOptions.find((r) => r.value === user.role)?.label}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={user.active ? "bg-green-500" : "bg-red-500"}
                    >
                      {user.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(user)}
                    >
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
