
import { useState, useEffect } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { ClientOption } from "@/types/client";

interface ClientSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function ClientSearch({ value, onChange }: ClientSearchProps) {
  const [open, setOpen] = useState(false);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const selectedClient = clients.find(client => client.id === value);

  const searchClients = async (query: string) => {
    if (query.length < 2) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("id, razao_social, nome_fantasia, cnpj")
        .or(`razao_social.ilike.%${query}%,nome_fantasia.ilike.%${query}%,cnpj.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error("Error searching clients:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Load initial clients
    const loadClients = async () => {
      setIsLoading(true);
      try {
        const { data } = await supabase
          .from("clients")
          .select("id, razao_social, nome_fantasia, cnpj")
          .limit(10);
        setClients(data || []);
      } catch (error) {
        console.error("Error loading clients:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadClients();
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchClients(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedClient ? (
            <span className="truncate">
              {selectedClient.nome_fantasia || selectedClient.razao_social}
            </span>
          ) : (
            "Selecione um cliente..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput 
            placeholder="Buscar cliente..." 
            value={searchQuery} 
            onValueChange={setSearchQuery}
          />
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
              <CommandGroup>
                {clients.map((client) => (
                  <CommandItem
                    key={client.id}
                    value={client.id}
                    onSelect={() => {
                      onChange(client.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === client.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {client.nome_fantasia || client.razao_social}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        CNPJ: {client.cnpj}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
