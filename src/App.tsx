import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import Dashboard from "./pages/Dashboard";
import Propriedades from "./pages/Propriedades";
import Safras from "./pages/Safras";
import Tarefas from "./pages/Tarefas";
import Relatorios from "./pages/Relatorios";
import Insumos from "./pages/Insumos";
import Financeiro from "./pages/Financeiro";
import Equipamentos from "./pages/Equipamentos";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex">
          <Sidebar />
          <main className="flex-1 ml-64">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/propriedades" element={<Propriedades />} />
              <Route path="/safras" element={<Safras />} />
              <Route path="/tarefas" element={<Tarefas />} />
              <Route path="/relatorios" element={<Relatorios />} />
              <Route path="/insumos" element={<Insumos />} />
              <Route path="/financeiro" element={<Financeiro />} />
              <Route path="/equipamentos" element={<Equipamentos />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
