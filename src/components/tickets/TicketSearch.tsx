
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TicketSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string | null;
  onStatusFilterChange: (value: string | null) => void;
  onSearch: () => void;
}

export function TicketSearch({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onSearch,
}: TicketSearchProps) {
  const statusOptions = [
    { value: "PENDENTE", label: "Pendente" },
    { value: "EM_ANDAMENTO", label: "Em Andamento" },
    { value: "CONCLUIDO", label: "Concluído" },
    { value: "CANCELADO", label: "Cancelado" },
    { value: "FATURADO", label: "Faturado" },
  ];

  return (
    <div className="flex gap-4 items-end">
      <div className="flex-1">
        <Input
          placeholder="Buscar por cliente ou código do ticket..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full"
        />
      </div>
      <Select
        value={statusFilter || "all"}
        onValueChange={(value) => onStatusFilterChange(value === "all" ? null : value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filtrar por status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          {statusOptions.map((status) => (
            <SelectItem key={status.value} value={status.value}>
              {status.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={onSearch}>
        <Search className="h-4 w-4 mr-2" />
        Buscar
      </Button>
    </div>
  );
}
