
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, createContext, useContext, ReactNode } from "react";

// Define types for our auth context
type AuthContextType = {
  currentUser: any;
  isAdmin: boolean;
  clientData: {
    clientId: string;
    clientName: string;
    email: string;
    cnpj: string;
  } | null;
  clientAuth: (clientId: string, clientName: string, email: string, cnpj: string) => Promise<boolean>;
  clientLogout: () => void;
  isClientAuthenticated: boolean;
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook for consuming the context
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}

// Main auth hook implementation
export function useAuth() {
  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from("system_users")
        .select("*")
        .eq("id", user.id)
        .single();

      console.log("Current user data:", data); 
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Client authentication state
  const [clientData, setClientData] = useState<{
    clientId: string;
    clientName: string;
    email: string;
    cnpj: string;
  } | null>(() => {
    const storedData = localStorage.getItem("clientPortalSession");
    return storedData ? JSON.parse(storedData) : null;
  });

  // Check for existing client session on mount
  useEffect(() => {
    const storedData = localStorage.getItem("clientPortalSession");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setClientData({
          clientId: parsedData.clientId,
          clientName: parsedData.clientName,
          email: parsedData.email,
          cnpj: parsedData.cnpj
        });
      } catch (error) {
        console.error("Error parsing client session:", error);
        localStorage.removeItem("clientPortalSession");
      }
    }
  }, []);

  // Client authentication function
  const clientAuth = async (clientId: string, clientName: string, email: string, cnpj: string) => {
    // Store client information in localStorage for the portal session
    const clientSession = {
      clientId,
      clientName,
      email,
      cnpj,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem("clientPortalSession", JSON.stringify(clientSession));
    setClientData({
      clientId,
      clientName,
      email,
      cnpj
    });
    
    return true;
  };

  // Client logout function
  const clientLogout = () => {
    localStorage.removeItem("clientPortalSession");
    setClientData(null);
  };

  // Verify explicitly if the user has admin role, handling undefined case
  const isAdmin = Boolean(currentUser?.role === "admin");
  console.log("Is admin:", isAdmin, "User role:", currentUser?.role);

  return {
    currentUser,
    isAdmin,
    clientData,
    clientAuth,
    clientLogout,
    isClientAuthenticated: Boolean(clientData)
  };
}
