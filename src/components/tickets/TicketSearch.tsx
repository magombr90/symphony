
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRange } from "react-day-picker";

interface TicketSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string | null;
  onStatusFilterChange: (value: string | null) => void;
  dateFilter: DateRange | undefined;
  onDateFilterChange: (date: DateRange | undefined) => void;
  onSearch: () => void;
}

export function TicketSearch({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  dateFilter,
  onDateFilterChange,
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
          placeholder="Buscar por cliente, código do ticket ou responsável..."
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
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !dateFilter && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateFilter?.from ? (
              dateFilter.to ? (
                <>
                  {format(dateFilter.from, "dd/MM/yyyy")} -{" "}
                  {format(dateFilter.to, "dd/MM/yyyy")}
                </>
              ) : (
                format(dateFilter.from, "dd/MM/yyyy")
              )
            ) : (
              "Período de criação"
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateFilter?.from}
            selected={dateFilter}
            onSelect={onDateFilterChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
      <Button onClick={onSearch} className="whitespace-nowrap">
        <Search className="h-4 w-4 mr-2" />
        Buscar
      </Button>
    </div>
  );
}
