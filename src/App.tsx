
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Clients from "./pages/Clients";
import Tickets from "./pages/Tickets";
import SystemUsers from "./pages/SystemUsers";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";

// Criar o queryClient fora do componente para manter uma única instância
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/system-users" element={<SystemUsers />} />
          </Routes>
        </AppLayout>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
