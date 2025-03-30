
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
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Client Portal Routes - No AppLayout */}
            <Route path="/client-portal" element={<ClientPortal />} />
            <Route path="/client-ticket-form" element={<ClientTicketForm />} />
            <Route path="/client-ticket-success" element={<ClientTicketSuccess />} />
            
            {/* Protected Admin App Routes */}
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
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
