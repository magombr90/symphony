
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
import bcrypt from "bcryptjs";

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const password = String(formData.get("password"));
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = {
      name: String(formData.get("name")),
      email: String(formData.get("email")),
      role: selectedRole,
      password_hash: passwordHash,
    };

    const { error } = await supabase.from("system_users").insert(newUser);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar usuário",
        description: error.message,
      });
      return;
    }

    toast({
      title: "Usuário criado com sucesso!",
    });
    setOpen(false);
    refetch();
  };

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Usuários do Sistema</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Usuário</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input id="name" name="name" required />
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input id="password" name="password" type="password" required />
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
              <Button type="submit" className="w-full">
                Salvar
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
                    <Button variant="outline" size="sm">
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
