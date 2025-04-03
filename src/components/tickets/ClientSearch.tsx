
import { useState, useEffect } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { ClientOption } from "@/types/client";
import { useToast } from "@/hooks/use-toast";

interface ClientSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function ClientSearch({ value, onChange }: ClientSearchProps) {
  const [open, setOpen] = useState(false);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const selectedClient = clients.find(client => client.id === value);

  const searchClients = async (query: string) => {
    if (query.length < 2) {
      // If query is too short, show recent/popular clients instead
      loadRecentClients();
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("id, razao_social, nome_fantasia, cnpj")
        .or(`razao_social.ilike.%${query}%,nome_fantasia.ilike.%${query}%,cnpj.ilike.%${query}%`)
        .order('razao_social', { ascending: true })
        .limit(15);

      if (error) throw error;
      setClients(data || []);
      
      // Show feedback if no results found
      if (data?.length === 0 && query.length > 2) {
        setError(`Nenhum cliente encontrado para "${query}"`);
      }
    } catch (error) {
      console.error("Error searching clients:", error);
      setError("Erro ao buscar clientes. Tente novamente.");
      toast({
        variant: "destructive",
        title: "Erro na busca",
        description: "Não foi possível buscar os clientes. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecentClients = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("id, razao_social, nome_fantasia, cnpj")
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error("Error loading recent clients:", error);
      setError("Erro ao carregar clientes recentes.");
    } finally {
      setIsLoading(false);
    }
  };

  // Load recent clients on initial render
  useEffect(() => {
    loadRecentClients();
  }, []);

  // Debounced search with 300ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (open) {
        searchClients(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, open]);

  // Clear search when popover closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-background"
          onClick={() => setOpen(true)}
        >
          {selectedClient ? (
            <div className="flex flex-col items-start text-left">
              <span className="font-medium truncate">
                {selectedClient.nome_fantasia || selectedClient.razao_social}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                CNPJ: {selectedClient.cnpj}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground">Selecione um cliente...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput 
              placeholder="Buscar por nome, razão social ou CNPJ..." 
              value={searchQuery} 
              onValueChange={setSearchQuery}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none"
            />
            {isLoading && <Loader2 className="h-4 w-4 animate-spin opacity-70" />}
          </div>
          
          {error ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {error}
              <Button 
                variant="link" 
                className="mt-2 text-xs" 
                onClick={loadRecentClients}
              >
                Ver clientes recentes
              </Button>
            </div>
          ) : (
            <CommandList>
              {isLoading && clients.length === 0 ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <CommandEmpty>
                    <div className="py-6 text-center">
                      <p className="text-sm">Nenhum cliente encontrado.</p>
                      <Button 
                        variant="link" 
                        className="mt-2 text-xs" 
                        onClick={loadRecentClients}
                      >
                        Ver clientes recentes
                      </Button>
                    </div>
                  </CommandEmpty>
                  
                  <CommandGroup className="max-h-[300px] overflow-y-auto">
                    {clients.map((client) => (
                      <CommandItem
                        key={client.id}
                        value={client.id}
                        onSelect={() => {
                          onChange(client.id);
                          setOpen(false);
                        }}
                        className="py-2"
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
            </CommandList>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
