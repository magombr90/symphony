
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

type Equipment = {
  id: string;
  codigo: string;
  equipamento: string;
  numero_serie: string | null;
  condicao: 'NOVO' | 'USADO' | 'DEFEITO';
  observacoes: string | null;
  client: {
    razao_social: string;
  };
  ticket: {
    codigo: string;
  } | null;
};

export default function Equipments() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data: equipments } = useQuery({
    queryKey: ["equipments", searchTerm],
    queryFn: async () => {
      // Primeiro, vamos logar a consulta para debug
      console.log("Iniciando consulta de equipamentos");

      let query = supabase
        .from("equipamentos")
        .select(`
          *,
          client:clients(razao_social),
          ticket:tickets(codigo)
        `);

      if (searchTerm) {
        query = query.or(`
          codigo.ilike.%${searchTerm}%,
          equipamento.ilike.%${searchTerm}%,
          numero_serie.ilike.%${searchTerm}%
        `);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) {
        console.error("Erro na consulta:", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar equipamentos",
          description: error.message,
        });
        throw error;
      }

      // Log dos dados retornados para debug
      console.log("Dados retornados:", data);

      return data as Equipment[];
    },
  });

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Equipamentos</h1>
      
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        <Input
          placeholder="Buscar por código, equipamento ou número de série..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Equipamento</TableHead>
                <TableHead>Nº Série</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Nº Ticket</TableHead>
                <TableHead>Condição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipments?.map((equipment) => {
                // Log para debug de cada equipamento
                console.log("Renderizando equipamento:", equipment);
                return (
                  <TableRow key={equipment.id}>
                    <TableCell>{equipment.codigo}</TableCell>
                    <TableCell>{equipment.equipamento}</TableCell>
                    <TableCell>{equipment.numero_serie || "-"}</TableCell>
                    <TableCell>{equipment.client.razao_social}</TableCell>
                    <TableCell>
                      {equipment.ticket?.codigo || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={
                          equipment.condicao === 'NOVO' ? 'bg-green-500' :
                          equipment.condicao === 'USADO' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }
                      >
                        {equipment.condicao}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!equipments?.length && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    Nenhum equipamento encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
