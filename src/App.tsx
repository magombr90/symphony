
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Clients from "./pages/Clients";
import Tickets from "./pages/Tickets";
import SystemUsers from "./pages/SystemUsers";
import Dashboard from "./pages/Dashboard";
import Equipments from "./pages/Equipments";
import UserProfile from "./pages/UserProfile";
import ClientPortal from "./pages/ClientPortal";
import ClientTicketForm from "./pages/ClientTicketForm";
import ClientTicketSuccess from "./pages/ClientTicketSuccess";
import Login from "./pages/Login";
import { useAuth } from "./hooks/use-auth";

const queryClient = new QueryClient();

// Componente para proteger rotas que requerem autenticação
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Mostra um indicador de carregamento enquanto verifica a autenticação
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }
  
  // Redireciona para login se não estiver autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // Renderiza o conteúdo se estiver autenticado
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota de Login - Não requer autenticação */}
        <Route path="/login" element={<Login />} />
        
        {/* Client Portal Routes - Não requer autenticação */}
        <Route path="/client-portal" element={<ClientPortal />} />
        <Route path="/client-ticket-form" element={<ClientTicketForm />} />
        <Route path="/client-ticket-success" element={<ClientTicketSuccess />} />
        
        {/* Admin App Routes - Requer autenticação */}
        <Route path="/" element={
          <ProtectedRoute>
            <AppLayout><Dashboard /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/clients" element={
          <ProtectedRoute>
            <AppLayout><Clients /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/tickets" element={
          <ProtectedRoute>
            <AppLayout><Tickets /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/system-users" element={
          <ProtectedRoute>
            <AppLayout><SystemUsers /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/equipments" element={
          <ProtectedRoute>
            <AppLayout><Equipments /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <AppLayout><UserProfile /></AppLayout>
          </ProtectedRoute>
        } />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRoutes />
    </QueryClientProvider>
  );
}

export default App;
