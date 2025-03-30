
import { useAuthContext } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";

export function useAuth() {
  const { user, session, signOut } = useAuthContext();
  
  // Client authentication state (mantendo compatibilidade com código existente)
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
  const isAdmin = Boolean(user?.role === "admin");
  
  return {
    currentUser: user,
    isAdmin,
    clientData,
    clientAuth,
    clientLogout,
    isClientAuthenticated: Boolean(clientData),
    signOut
  };
}
