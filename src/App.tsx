
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Clients from "./pages/Clients";
import Tickets from "./pages/Tickets";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/clients" element={<Clients />} />
            <Route path="/tickets" element={<Tickets />} />
          </Routes>
        </AppLayout>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
