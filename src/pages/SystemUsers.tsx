
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);

      const userData = {
        name: String(formData.get("name")),
        email: String(formData.get("email")),
        role: selectedRole,
        active: formData.get("active") === "true",
      };

      let error;
      if (editingUser) {
        // Atualização
        const password = formData.get("password");
        
        if (password && String(password).length > 0) {
          // If password is provided, handle it separately - using a direct query instead of rpc
          const { error: pwdError } = await supabase.from('_rpc')
            .select('*')
            .eq('name', 'update_user_password')
            .eq('args', { user_id: editingUser.id, new_password: String(password) });
          
          if (pwdError) {
            toast({
              variant: "destructive",
              title: "Erro ao atualizar senha",
              description: pwdError.message,
            });
            setIsSubmitting(false);
            return;
          }
        }
        
        // Now update the user data without password
        ({ error } = await supabase
          .from("system_users")
          .update(userData)
          .eq("id", editingUser.id));
      } else {
        // Criação - for new users
        const password = formData.get("password");
        if (!password) {
          toast({
            variant: "destructive",
            title: "Erro ao criar usuário",
            description: "Senha é obrigatória para novos usuários",
          });
          setIsSubmitting(false);
          return;
        }

        // Create user using direct query instead of rpc
        const { error: createError, data } = await supabase.from('_rpc')
          .select('*')
          .eq('name', 'create_system_user')
          .eq('args', {
            user_name: userData.name,
            user_email: userData.email,
            user_password: String(password),
            user_role: userData.role,
            user_active: userData.active
          });
        
        error = createError;
        console.log("User creation response:", data);
      }

      if (error) {
        console.error("Error operation:", error);
        toast({
          variant: "destructive",
          title: `Erro ao ${editingUser ? 'atualizar' : 'criar'} usuário`,
          description: error.message,
        });
        setIsSubmitting(false);
        return;
      }

      toast({
        title: `Usuário ${editingUser ? 'atualizado' : 'criado'} com sucesso!`,
      });
      setOpen(false);
      setEditingUser(null);
      setSelectedRole("user");
      refetch();
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        variant: "destructive",
        title: `Erro ao ${editingUser ? 'atualizar' : 'criar'} usuário`,
        description: "Ocorreu um erro inesperado. Tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
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
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : (editingUser ? "Atualizar" : "Salvar")}
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
