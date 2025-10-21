import Header from "@/components/layout/Header";
import StatCard from "@/components/dashboard/StatCard";
import CultureCard from "@/components/dashboard/CultureCard";
import { WeatherWidget } from "@/components/dashboard/WeatherWidget";
import { WeatherForecast } from "@/components/dashboard/WeatherForecast";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Sprout, TrendingUp, DollarSign, Droplets, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  const [city, setCity] = useState("São Paulo");
  const [searchCity, setSearchCity] = useState("São Paulo");
  
  const cultures = [
    { name: "Soja", area: "150 hectares", status: "Crescimento", progress: 65, nextTask: "Aplicação de defensivos", image: "🌱" },
    { name: "Milho", area: "200 hectares", status: "Manutenção", progress: 45, nextTask: "Irrigação programada", image: "🌽" },
    { name: "Arroz", area: "80 hectares", status: "Plantio", progress: 20, nextTask: "Preparo do solo", image: "🌾" },
    { name: "Fumo", area: "50 hectares", status: "Colheita", progress: 90, nextTask: "Colheita seletiva", image: "🍃" },
  ];

  return (
    <div className="min-h-screen">
      <Header
        title="Dashboard" 
        subtitle="Visão geral da sua produção agrícola"
      />
      
      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Área Total Plantada"
            value="480 ha"
            subtitle="Distribuídos em 4 culturas"
            icon={Sprout}
            trend="up"
            trendValue="12%"
            gradient="primary"
          />
          <StatCard
            title="Produtividade Média"
            value="3.2 t/ha"
            subtitle="Acima da média regional"
            icon={TrendingUp}
            trend="up"
            trendValue="8%"
            gradient="harvest"
          />
          <StatCard
            title="Receita Estimada"
            value="R$ 2.4M"
            subtitle="Baseado na safra atual"
            icon={DollarSign}
            trend="up"
            trendValue="15%"
            gradient="earth"
          />
          <StatCard
            title="Irrigação Eficiente"
            value="92%"
            subtitle="Economia de 15% de água"
            icon={Droplets}
            gradient="primary"
          />
        </div>

        {/* Cultures Grid */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Safras em Andamento</h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {cultures.map((culture) => (
              <CultureCard key={culture.name} {...culture} />
            ))}
          </div>
        </div>

        {/* Weather Section */}
        <div>
          <div className="mb-4 flex gap-2">
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
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <WeatherWidget city={searchCity} />
            
            <WeatherForecast city={searchCity} />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Estoque Crítico</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center justify-between p-2 rounded-lg bg-destructive/10">
                  <span className="text-sm">Fertilizante NPK</span>
                  <span className="text-xs font-medium text-destructive">5% restante</span>
                </li>
                <li className="flex items-center justify-between p-2 rounded-lg bg-accent/10">
                  <span className="text-sm">Defensivo Foliar</span>
                  <span className="text-xs font-medium text-accent">15% restante</span>
                </li>
                <li className="flex items-center justify-between p-2 rounded-lg bg-primary/10">
                  <span className="text-sm">Sementes Milho</span>
                  <span className="text-xs font-medium text-primary">Estoque OK</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
