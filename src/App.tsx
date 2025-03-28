
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
import { AuthProvider, useAuth } from "./hooks/use-auth";

const queryClient = new QueryClient();

// Auth guard component to protect routes
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/client-portal" element={<ClientPortal />} />
            <Route path="/client-ticket-form" element={<ClientTicketForm />} />
            <Route path="/client-ticket-success" element={<ClientTicketSuccess />} />
            
            {/* Protected Routes */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <AppLayout><Dashboard /></AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/clients" 
              element={
                <ProtectedRoute>
                  <AppLayout><Clients /></AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tickets" 
              element={
                <ProtectedRoute>
                  <AppLayout><Tickets /></AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/system-users" 
              element={
                <ProtectedRoute>
                  <AppLayout><SystemUsers /></AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/equipments" 
              element={
                <ProtectedRoute>
                  <AppLayout><Equipments /></AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <AppLayout><UserProfile /></AppLayout>
                </ProtectedRoute>
              } 
            />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
