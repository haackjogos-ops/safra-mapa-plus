import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin } from "lucide-react";
import { WeatherWidget } from "@/components/dashboard/WeatherWidget";
import { WeatherForecast } from "@/components/dashboard/WeatherForecast";
import { toast } from "sonner";

interface ClimaProps {
  onMenuClick?: () => void;
}

const Clima = ({ onMenuClick }: ClimaProps) => {
  const [searchCity, setSearchCity] = useState("");
  const [currentCity, setCurrentCity] = useState(() => {
    return localStorage.getItem("selectedCity") || "São Paulo";
  });

  const handleSearch = () => {
    if (!searchCity.trim()) {
      toast.error("Por favor, digite uma cidade");
      return;
    }
    setCurrentCity(searchCity);
    localStorage.setItem("selectedCity", searchCity);
    toast.success(`Previsão atualizada para ${searchCity}`);
  };

  useEffect(() => {
    // Atualizar localStorage sempre que a cidade mudar
    localStorage.setItem("selectedCity", currentCity);
  }, [currentCity]);

  return (
    <div className="min-h-screen">
      <Header 
        title="Previsão do Tempo" 
        subtitle="Acompanhe as condições climáticas para planejar suas atividades agrícolas"
        onMenuClick={onMenuClick}
      />
      <div className="p-3 md:p-6 space-y-4 md:space-y-6">

        {/* Busca de Cidade */}
        <Card className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Digite o nome da cidade..."
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} className="sm:w-auto w-full">
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Cidade atual: <span className="font-semibold">{currentCity}</span>
          </p>
        </Card>

        {/* Clima Atual */}
        <div>
          <h2 className="text-lg md:text-2xl font-semibold mb-3 md:mb-4 text-foreground">
            Condições Atuais
          </h2>
          <WeatherWidget city={currentCity} />
        </div>

        {/* Previsão Estendida */}
        <div>
          <h2 className="text-lg md:text-2xl font-semibold mb-3 md:mb-4 text-foreground">
            Previsão para os Próximos Dias
          </h2>
          <WeatherForecast city={currentCity} />
        </div>

        {/* Dicas Agrícolas */}
        <Card className="p-4 md:p-6 bg-primary/5 border-primary/20">
          <h3 className="text-base md:text-lg font-semibold mb-3 text-foreground">
            Dicas para Atividades Agrícolas
          </h3>
          <ul className="space-y-2 text-xs md:text-sm text-muted-foreground">
            <li>• Evite pulverização com ventos acima de 10 km/h</li>
            <li>• Temperatura ideal para aplicações: 15°C a 30°C</li>
            <li>• Umidade relativa ideal: 50% a 90%</li>
            <li>• Não realize aplicações com previsão de chuva em 24h</li>
            <li>• Monitore o orvalho da manhã antes de iniciar atividades</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default Clima;
