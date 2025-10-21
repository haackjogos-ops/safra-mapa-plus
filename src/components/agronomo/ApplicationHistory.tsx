import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { History, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Application {
  id: string;
  equipment_type: string;
  application_date: string;
  area_applied: number;
  total_product_used: number;
  total_spray_volume: number;
  application_cost: number;
  weather_temperature: number;
  weather_humidity: number;
  weather_wind_speed: number;
  supplies: { nome: string };
  planting_areas: { nome: string; cultura: string };
  equipamentos: { nome: string };
  operadores: { nome: string };
}

const ApplicationHistory = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const { data, error } = await supabase
        .from("applications")
        .select(`
          *,
          supplies(nome),
          planting_areas(nome, cultura),
          equipamentos(nome),
          operadores(nome)
        `)
        .order("application_date", { ascending: false })
        .limit(50);

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkWeatherConditions = (app: Application) => {
    const warnings = [];
    if (app.weather_temperature && (app.weather_temperature < 15 || app.weather_temperature > 25)) {
      warnings.push("Temperatura fora do ideal");
    }
    if (app.weather_humidity && app.weather_humidity < 55) {
      warnings.push("Umidade baixa");
    }
    if (app.weather_wind_speed && app.weather_wind_speed > 10) {
      warnings.push("Vento forte");
    }
    return warnings;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Carregando histórico...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Histórico de Aplicações
        </CardTitle>
      </CardHeader>
      <CardContent>
        {applications.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhuma aplicação registrada ainda.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Talhão</TableHead>
                  <TableHead>Área (ha)</TableHead>
                  <TableHead>Produto Usado</TableHead>
                  <TableHead>Volume Total</TableHead>
                  <TableHead>Equipamento</TableHead>
                  <TableHead>Operador</TableHead>
                  <TableHead>Custo</TableHead>
                  <TableHead>Alertas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => {
                  const warnings = checkWeatherConditions(app);
                  return (
                    <TableRow key={app.id}>
                      <TableCell>{format(new Date(app.application_date), "dd/MM/yyyy")}</TableCell>
                      <TableCell className="font-medium">{app.supplies?.nome}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{app.planting_areas?.nome}</p>
                          <p className="text-xs text-muted-foreground">{app.planting_areas?.cultura}</p>
                        </div>
                      </TableCell>
                      <TableCell>{app.area_applied} ha</TableCell>
                      <TableCell>{app.total_product_used.toFixed(2)} L</TableCell>
                      <TableCell>{app.total_spray_volume.toFixed(2)} L</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {app.equipment_type === 'trator' ? 'Trator' : 'Drone'}
                        </Badge>
                        {app.equipamentos && (
                          <p className="text-xs text-muted-foreground mt-1">{app.equipamentos.nome}</p>
                        )}
                      </TableCell>
                      <TableCell>{app.operadores?.nome || '-'}</TableCell>
                      <TableCell>R$ {app.application_cost?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>
                        {warnings.length > 0 && (
                          <div className="flex items-center gap-1 text-yellow-600">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-xs">{warnings.length}</span>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApplicationHistory;
