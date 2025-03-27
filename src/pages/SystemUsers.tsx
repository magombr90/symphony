import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
}

// Add this function at the beginning of the SystemUsers component
const handleCreateAdminUser = async () => {
  try {
    setIsLoading(true);
    
    // Call the edge function to create the admin user
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
    
    toast({
      title: "Usuário administrador criado com sucesso",
      description: "Você já pode fazer login com esse usuário"
    });
    
    void refetchUsers();
  } catch (error) {
    console.error("Error creating admin user:", error);
    toast({
      title: "Erro ao criar usuário administrador",
      description: error.message,
      variant: "destructive"
    });
  } finally {
    setIsLoading(false);
  }
};

export default function SystemUsers() {
  const [openNewUser, setOpenNewUser] = useState(false);
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    refetchUsers();
  }, []);

  const refetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("system_users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Erro ao carregar usuários",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setUsers(data || []);
    } finally {
      setIsLoading(false);
    }
  };

  const createUser = async () => {
    setIsLoading(true);
    try {
      // Call the edge function to create the user
      const response = await supabase.functions.invoke('create-user', {
        body: {
          email,
          password,
          name,
          role
        }
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }

      toast({
        title: "Usuário criado com sucesso",
        description: `${name} foi adicionado ao sistema.`,
      });
      setOpenNewUser(false);
      void refetchUsers();
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        title: "Erro ao criar usuário",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserStatus = async (user: SystemUser) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("system_users")
        .update({ active: !user.active })
        .eq("id", user.id);

      if (error) {
        console.error("Error updating user status:", error);
        toast({
          title: "Erro ao atualizar status do usuário",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Status do usuário atualizado",
        description: `O status de ${user.name} foi alterado.`,
      });
      void refetchUsers();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Usuários do Sistema</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCreateAdminUser}
            disabled={isLoading}
          >
            Criar Admin (mailton@tfsinformatica.com.br)
          </Button>
          <Button onClick={() => setOpenNewUser(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Usuário
          </Button>
        </div>
      </div>

      <Table>
        <TableCaption>Lista de usuários do sistema.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <Switch
                  checked={user.active}
                  onCheckedChange={() => toggleUserStatus(user)}
                  disabled={isLoading}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={openNewUser} onOpenChange={setOpenNewUser}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Novo Usuário</DialogTitle>
            <DialogDescription>
              Crie um novo usuário para acessar o sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Senha
              </Label>
              <Input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select onValueChange={setRole} defaultValue={role}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione um role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={createUser} disabled={isLoading}>
            Criar Usuário
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
