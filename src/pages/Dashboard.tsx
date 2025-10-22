import Header from "@/components/layout/Header";
import StatCard from "@/components/dashboard/StatCard";
import CultureCard from "@/components/dashboard/CultureCard";
import { WeatherWidget } from "@/components/dashboard/WeatherWidget";
import { WeatherForecast } from "@/components/dashboard/WeatherForecast";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Sprout, TrendingUp, DollarSign, Droplets, Search, ListTodo, Beaker, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface DashboardProps {
  onMenuClick?: () => void;
}

const Dashboard = ({ onMenuClick }: DashboardProps) => {
  const [city, setCity] = useState(() => {
    return localStorage.getItem("selectedCity") || "São Paulo";
  });
  const [searchCity, setSearchCity] = useState(() => {
    return localStorage.getItem("selectedCity") || "São Paulo";
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const savedCity = localStorage.getItem("selectedCity");
      if (savedCity) {
        setCity(savedCity);
        setSearchCity(savedCity);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    
    // Verificar mudanças a cada segundo (fallback para quando storage event não dispara)
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);
  
  const cultures: any[] = [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <Header
        title="Dashboard" 
        subtitle="Visão geral da sua produção agrícola"
        onMenuClick={onMenuClick}
      />
      
      <div className="p-4 md:p-6 space-y-6">
        {/* Quick Actions - Mobile App Style */}
        <div className="grid grid-cols-2 gap-3 md:hidden animate-slide-up">
          <Link to="/tarefas">
            <Card className="p-4 text-center gradient-accent hover:scale-105 active:scale-95 transition-all cursor-pointer border-0 shadow-md">
              <ListTodo className="h-10 w-10 mx-auto mb-2 text-primary" />
              <p className="font-bold text-sm">Tarefas</p>
              <p className="text-xs text-muted-foreground">Cadastre</p>
            </Card>
          </Link>
          <Link to="/safras">
            <Card className="p-4 text-center gradient-accent hover:scale-105 active:scale-95 transition-all cursor-pointer border-0 shadow-md">
              <Sprout className="h-10 w-10 mx-auto mb-2 text-primary" />
              <p className="font-bold text-sm">Safras</p>
              <p className="text-xs text-muted-foreground">Cadastre</p>
            </Card>
          </Link>
          <Link to="/agronomo">
            <Card className="p-4 text-center gradient-accent hover:scale-105 active:scale-95 transition-all cursor-pointer border-0 shadow-md">
              <Beaker className="h-10 w-10 mx-auto mb-2 text-primary" />
              <p className="font-bold text-sm">Agrônomo</p>
              <p className="text-xs text-muted-foreground">Controle IA</p>
            </Card>
          </Link>
          <Link to="/clima">
            <Card className="p-4 text-center gradient-accent hover:scale-105 active:scale-95 transition-all cursor-pointer border-0 shadow-md">
              <Cloud className="h-10 w-10 mx-auto mb-2 text-primary" />
              <p className="font-bold text-sm">Clima</p>
              <p className="text-xs text-muted-foreground">Previsão 5d</p>
            </Card>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4 animate-slide-up">
          <StatCard
            title="Área Total Plantada"
            value="0 ha"
            subtitle="Cadastre suas safras"
            icon={Sprout}
            gradient="primary"
          />
          <StatCard
            title="Produtividade Média"
            value="-"
            subtitle="Aguardando dados"
            icon={TrendingUp}
            gradient="harvest"
          />
          <StatCard
            title="Receita Estimada"
            value="R$ 0"
            subtitle="Baseado na safra atual"
            icon={DollarSign}
            gradient="earth"
          />
          <StatCard
            title="Irrigação Eficiente"
            value="-"
            subtitle="Sem dados"
            icon={Droplets}
            gradient="primary"
          />
        </div>

        {/* Cultures Grid */}
        {cultures.length > 0 && (
          <div>
            <h3 className="text-base md:text-lg font-semibold text-foreground mb-3 md:mb-4">Safras em Andamento</h3>
            <div className="grid gap-3 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {cultures.map((culture) => (
                <CultureCard key={culture.name} {...culture} />
              ))}
            </div>
          </div>
        )}

        {/* Weather Section */}
        <div>
          <div className="mb-3 md:mb-4 flex gap-2">
            <Input
              type="text"
              placeholder="Digite o nome da cidade..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setSearchCity(city)}
              className="max-w-xs"
            />
            <Button onClick={() => setSearchCity(city)} size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid gap-3 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <WeatherWidget city={searchCity} />
            
            <WeatherForecast city={searchCity} />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Estoque Crítico</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum alerta de estoque no momento
              </p>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
