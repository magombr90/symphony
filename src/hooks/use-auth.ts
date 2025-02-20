
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export function useAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from("system_users")
        .select("*")
        .eq("id", user.id)
        .single();

      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!isLoading && !currentUser && location.pathname !== "/auth") {
      navigate("/auth");
    }
  }, [currentUser, isLoading, navigate, location]);

  const isAdmin = Boolean(currentUser?.role === "admin");

  return {
    currentUser,
    isAdmin,
    isLoading,
  };
}
