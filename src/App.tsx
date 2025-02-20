
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
import Auth from "./pages/Auth";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route element={<AppLayout>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/system-users" element={<SystemUsers />} />
            <Route path="/equipments" element={<Equipments />} />
          </Route>
        </Routes>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
