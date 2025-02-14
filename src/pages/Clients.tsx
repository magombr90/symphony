
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
import { Plus } from "lucide-react";

const mockClients = [
  {
    id: 1,
    cnpj: "12.345.678/0001-90",
    razaoSocial: "Empresa Exemplo Ltda",
    endereco: "Rua Exemplo, 123",
    telefone: "(11) 1234-5678",
    email: "contato@exemplo.com",
  },
];

export default function Clients() {
  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Clientes</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      <Card className="slide-in">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CNPJ</TableHead>
                <TableHead>Razão Social</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>{client.cnpj}</TableCell>
                  <TableCell>{client.razaoSocial}</TableCell>
                  <TableCell>{client.telefone}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      Ver Histórico
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
