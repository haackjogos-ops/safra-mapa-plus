import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, Droplets, Wind, Gauge, Eye, Sunrise, Sunset } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface WeatherWidgetProps {
  city?: string;
  lat?: number;
  lon?: number;
}

export const WeatherWidget = ({ city = "São Paulo", lat, lon }: WeatherWidgetProps) => {
  const { data: weatherData, isLoading } = useQuery({
    queryKey: ["weather-current", city, lat, lon],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("get-weather-data", {
        body: { city, lat, lon },
      });
      if (error) throw error;
      return data;
    },
    staleTime: 1800000, // Considera dados atualizados por 30 minutos
    enabled: !!city || (!!lat && !!lon), // Só busca se tiver cidade ou coordenadas
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Clima
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!weatherData?.current) {
    return null;
  }

  const { current } = weatherData;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          Clima - {current.city}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-4xl font-bold">{Math.round(current.temperature)}°C</div>
            <div className="text-sm text-muted-foreground capitalize">{current.description}</div>
            <div className="text-xs text-muted-foreground">Sensação: {Math.round(current.feels_like)}°C</div>
          </div>
          <img
            src={`https://openweathermap.org/img/wn/${current.icon}@2x.png`}
            alt={current.description}
            className="w-20 h-20"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-blue-500" />
            <div>
              <div className="font-medium">Umidade</div>
              <div className="text-muted-foreground">{current.humidity}%</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-gray-500" />
            <div>
              <div className="font-medium">Vento</div>
              <div className="text-muted-foreground">{(current.wind_speed * 3.6).toFixed(1)} km/h</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-orange-500" />
            <div>
              <div className="font-medium">Pressão</div>
              <div className="text-muted-foreground">{current.pressure} hPa</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-purple-500" />
            <div>
              <div className="font-medium">Visibilidade</div>
              <div className="text-muted-foreground">{(current.visibility / 1000).toFixed(1)} km</div>
            </div>
          </div>
        </div>

        {current.rain > 0 && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <Droplets className="h-5 w-5 text-blue-600" />
            <div>
              <div className="font-medium text-sm">Precipitação</div>
              <div className="text-sm text-muted-foreground">{current.rain} mm na última hora</div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1">
            <Sunrise className="h-3 w-3" />
            {format(new Date(current.sunrise * 1000), "HH:mm", { locale: ptBR })}
          </div>
          <div className="flex items-center gap-1">
            <Sunset className="h-3 w-3" />
            {format(new Date(current.sunset * 1000), "HH:mm", { locale: ptBR })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
