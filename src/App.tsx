import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Auth from "./pages/Auth";
import Sidebar from "./components/layout/Sidebar";
import MobileNav from "./components/layout/MobileNav";
import MobileDrawer from "./components/layout/MobileDrawer";
import Dashboard from "./pages/Dashboard";
import DashboardAgricultor from "./pages/DashboardAgricultor";
import MinhasFotos from "./pages/MinhasFotos";
import MinhasRecomendacoes from "./pages/MinhasRecomendacoes";
import Propriedades from "./pages/Propriedades";
import Safras from "./pages/Safras";
import Tarefas from "./pages/Tarefas";
import Agronomo from "./pages/Agronomo";
import Relatorios from "./pages/Relatorios";
import Insumos from "./pages/Insumos";
import Financeiro from "./pages/Financeiro";
import Equipamentos from "./pages/Equipamentos";
import Clima from "./pages/Clima";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Rota pública de autenticação */}
              <Route path="/auth" element={<Auth />} />
              
              {/* Rotas protegidas */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen">
                      {/* Desktop Sidebar */}
                      <div className="hidden md:block">
                        <Sidebar />
                      </div>

                      {/* Mobile Drawer */}
                      <MobileDrawer open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />

                      {/* Main Content */}
                      <main className="flex-1 md:ml-64 pb-16 md:pb-0">
                        <Routes>
                          <Route path="/" element={<Dashboard onMenuClick={() => setMobileMenuOpen(true)} />} />
                          <Route path="/propriedades" element={<Propriedades onMenuClick={() => setMobileMenuOpen(true)} />} />
                          <Route path="/safras" element={<Safras onMenuClick={() => setMobileMenuOpen(true)} />} />
                          <Route path="/tarefas" element={<Tarefas onMenuClick={() => setMobileMenuOpen(true)} />} />
                          <Route path="/agronomo" element={<Agronomo onMenuClick={() => setMobileMenuOpen(true)} />} />
                          <Route path="/relatorios" element={<Relatorios onMenuClick={() => setMobileMenuOpen(true)} />} />
                          <Route path="/insumos" element={<Insumos onMenuClick={() => setMobileMenuOpen(true)} />} />
                          <Route path="/financeiro" element={<Financeiro onMenuClick={() => setMobileMenuOpen(true)} />} />
                          <Route path="/equipamentos" element={<Equipamentos onMenuClick={() => setMobileMenuOpen(true)} />} />
                          <Route path="/clima" element={<Clima onMenuClick={() => setMobileMenuOpen(true)} />} />
                          <Route path="/agricultor" element={<DashboardAgricultor onMenuClick={() => setMobileMenuOpen(true)} />} />
                          <Route path="/minhas-fotos" element={<MinhasFotos onMenuClick={() => setMobileMenuOpen(true)} />} />
                          <Route path="/minhas-recomendacoes" element={<MinhasRecomendacoes onMenuClick={() => setMobileMenuOpen(true)} />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </main>

                      {/* Mobile Bottom Navigation */}
                      <MobileNav />
                    </div>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
