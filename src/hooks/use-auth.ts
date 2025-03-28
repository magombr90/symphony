
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const queryClient = useQueryClient();

  // Configurar o ouvinte de mudança de estado de autenticação
  useEffect(() => {
    // Primeiro configurar o listener para alterações no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state change event:", event);
        setSession(newSession);
        
        // Invalidar a consulta para garantir que os dados do usuário sejam atualizados
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          queryClient.invalidateQueries({ queryKey: ["current-user"] });
        } else if (event === 'SIGNED_OUT') {
          queryClient.setQueryData(["current-user"], null);
        }
      }
    );

    // Em seguida, verificar se já existe uma sessão
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const { data: currentUser, isLoading } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      if (!session?.user) return null;

      const { data, error } = await supabase
        .from("system_users")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Erro ao buscar dados do usuário:", error);
        return null;
      }

      console.log("Current user data:", data);
      return data;
    },
    enabled: !!session?.user,
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
  });

  // Verificar explicitamente se o usuário tem role admin
  const isAdmin = Boolean(currentUser?.role === "admin");
  console.log("Is admin:", isAdmin, "User role:", currentUser?.role);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return {
    currentUser,
    isAdmin,
    isAuthenticated: !!session,
    isLoading,
    signOut,
  };
}
