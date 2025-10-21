import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Droplets } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface WeatherForecastProps {
  city?: string;
  lat?: number;
  lon?: number;
}

export const WeatherForecast = ({ city = "São Paulo", lat, lon }: WeatherForecastProps) => {
  const { data: weatherData, isLoading } = useQuery({
    queryKey: ["weather", city, lat, lon],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("get-weather-data", {
        body: { city, lat, lon },
      });
      if (error) throw error;
      return data;
    },
    refetchInterval: 1800000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Previsão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-16 bg-muted rounded"></div>
            <div className="h-16 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!weatherData?.forecast || weatherData.forecast.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Previsão para 24h
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {weatherData.forecast.map((item: any, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <img
                  src={`https://openweathermap.org/img/wn/${item.icon}.png`}
                  alt={item.description}
                  className="w-10 h-10"
                />
                <div>
                  <div className="text-sm font-medium">
                    {format(new Date(item.dt * 1000), "HH:mm", { locale: ptBR })}
                  </div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {item.description}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-lg font-bold">{Math.round(item.temperature)}°C</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Droplets className="h-3 w-3" />
                    {item.humidity}%
                  </div>
                </div>
                {item.rain > 0 && (
                  <div className="text-xs text-blue-600 dark:text-blue-400">
                    {item.rain}mm
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
