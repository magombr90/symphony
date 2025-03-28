
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Client Portal Routes - No AppLayout */}
          <Route path="/client-portal" element={<ClientPortal />} />
          <Route path="/client-ticket-form" element={<ClientTicketForm />} />
          <Route path="/client-ticket-success" element={<ClientTicketSuccess />} />
          
          {/* Admin App Routes */}
          <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/clients" element={<AppLayout><Clients /></AppLayout>} />
          <Route path="/tickets" element={<AppLayout><Tickets /></AppLayout>} />
          <Route path="/system-users" element={<AppLayout><SystemUsers /></AppLayout>} />
          <Route path="/equipments" element={<AppLayout><Equipments /></AppLayout>} />
          <Route path="/profile" element={<AppLayout><UserProfile /></AppLayout>} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
