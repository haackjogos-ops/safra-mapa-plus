import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ForecastItem {
  supply_id: string;
  supply_name: string;
  categoria: string;
  unidade_medida: string;
  current_stock: number;
  avg_monthly_usage: number;
  estimated_months_remaining: number;
  next_purchase_recommended: string;
  estimated_quantity_needed: number;
}

const SupplyUsageForecast = () => {
  const [forecasts, setForecasts] = useState<ForecastItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateForecasts();
  }, []);

  const calculateForecasts = async () => {
    try {
      // Buscar todos os insumos
      const { data: supplies, error: suppliesError } = await supabase
        .from("supplies")
        .select("*");

      if (suppliesError) throw suppliesError;

      // Buscar histórico de uso dos últimos 6 meses
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data: usageData, error: usageError } = await supabase
        .from("supply_usage")
        .select("supply_id, quantidade_usada, data_uso")
        .gte("data_uso", sixMonthsAgo.toISOString().split("T")[0]);

      if (usageError) throw usageError;

      // Calcular previsões
      const forecasts: ForecastItem[] = [];

      for (const supply of supplies || []) {
        const usageRecords = usageData?.filter(u => u.supply_id === supply.id) || [];
        
        if (usageRecords.length === 0) continue;

        // Calcular uso médio mensal
        const totalUsage = usageRecords.reduce((acc, record) => acc + record.quantidade_usada, 0);
        const monthsWithData = Math.max(1, usageRecords.length / 4); // Estimativa de meses
        const avgMonthlyUsage = totalUsage / monthsWithData;

        // Calcular meses restantes de estoque
        const monthsRemaining = avgMonthlyUsage > 0 
          ? supply.quantidade_estoque / avgMonthlyUsage 
          : 999;

        // Recomendar compra quando restar 1 mês de estoque
        const daysUntilPurchase = Math.max(0, (monthsRemaining - 1) * 30);
        const nextPurchaseDate = new Date();
        nextPurchaseDate.setDate(nextPurchaseDate.getDate() + daysUntilPurchase);

        // Quantidade recomendada (3 meses de uso)
        const estimatedQuantityNeeded = avgMonthlyUsage * 3;

        forecasts.push({
          supply_id: supply.id,
          supply_name: supply.nome,
          categoria: supply.categoria,
          unidade_medida: supply.unidade_medida,
          current_stock: supply.quantidade_estoque,
          avg_monthly_usage: avgMonthlyUsage,
          estimated_months_remaining: monthsRemaining,
          next_purchase_recommended: nextPurchaseDate.toISOString().split("T")[0],
          estimated_quantity_needed: estimatedQuantityNeeded,
        });
      }

      // Ordenar por meses restantes (mais urgente primeiro)
      forecasts.sort((a, b) => a.estimated_months_remaining - b.estimated_months_remaining);
      
      setForecasts(forecasts);
    } catch (error) {
      console.error("Erro ao calcular previsões:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyBadge = (monthsRemaining: number) => {
    if (monthsRemaining < 1) {
      return <Badge variant="destructive">Urgente</Badge>;
    } else if (monthsRemaining < 2) {
      return <Badge className="bg-orange-500">Atenção</Badge>;
    } else {
      return <Badge variant="outline">Normal</Badge>;
    }
  };

  if (loading) {
    return <div>Carregando previsões...</div>;
  }

  if (forecasts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Previsão de Necessidades
          </CardTitle>
          <CardDescription>
            Não há dados de uso suficientes para gerar previsões
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Previsão de Necessidades de Insumos
        </CardTitle>
        <CardDescription>
          Baseado no histórico de uso dos últimos 6 meses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Insumo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Estoque Atual</TableHead>
                <TableHead>Uso Médio/Mês</TableHead>
                <TableHead>Meses Restantes</TableHead>
                <TableHead>Próxima Compra</TableHead>
                <TableHead>Qtd Recomendada</TableHead>
                <TableHead>Urgência</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {forecasts.map((forecast) => (
                <TableRow key={forecast.supply_id}>
                  <TableCell className="font-medium">{forecast.supply_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{forecast.categoria}</Badge>
                  </TableCell>
                  <TableCell>
                    {forecast.current_stock.toFixed(2)} {forecast.unidade_medida}
                  </TableCell>
                  <TableCell>
                    {forecast.avg_monthly_usage.toFixed(2)} {forecast.unidade_medida}
                  </TableCell>
                  <TableCell>
                    <span className={forecast.estimated_months_remaining < 1 ? "text-destructive font-bold" : ""}>
                      {forecast.estimated_months_remaining < 999 
                        ? `${forecast.estimated_months_remaining.toFixed(1)} meses`
                        : "Sem uso"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {forecast.estimated_months_remaining < 999
                      ? new Date(forecast.next_purchase_recommended).toLocaleDateString("pt-BR")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {forecast.estimated_quantity_needed.toFixed(2)} {forecast.unidade_medida}
                  </TableCell>
                  <TableCell>
                    {getUrgencyBadge(forecast.estimated_months_remaining)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 p-4 bg-muted rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="text-sm text-muted-foreground space-y-1">
            <p className="font-medium">Como funciona a previsão:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Uso médio mensal calculado com base nos últimos 6 meses</li>
              <li>Recomendação de compra quando restar aproximadamente 1 mês de estoque</li>
              <li>Quantidade recomendada equivale a 3 meses de uso</li>
              <li>Previsões são atualizadas automaticamente conforme o uso</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupplyUsageForecast;
