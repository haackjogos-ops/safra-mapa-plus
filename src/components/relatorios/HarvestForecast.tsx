import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const HarvestForecast = () => {
  const [forecasts, setForecasts] = useState<any[]>([]);
  const [marketPrices, setMarketPrices] = useState<any[]>([]);
  const [safras] = useState([
    { id: 1, cultura: "Soja", area: "150 ha", producaoEstimada: 180 },
    { id: 2, cultura: "Milho", area: "200 ha", producaoEstimada: 300 },
    { id: 3, cultura: "Arroz", area: "80 ha", producaoEstimada: 100 }
  ]);
  const { toast } = useToast();

  useEffect(() => {
    loadMarketPrices();
    loadForecasts();
  }, []);

  const loadMarketPrices = async () => {
    try {
      const { data, error } = await supabase
        .from("market_prices")
        .select("*")
        .order("data_referencia", { ascending: false });

      if (error) throw error;
      setMarketPrices(data || []);
    } catch (error) {
      console.error("Erro ao carregar preços:", error);
    }
  };

  const loadForecasts = async () => {
    try {
      const { data, error } = await supabase
        .from("harvest_forecasts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setForecasts(data || []);
    } catch (error) {
      console.error("Erro ao carregar previsões:", error);
    }
  };

  const generateForecasts = async () => {
    try {
      const newForecasts = safras.map(safra => {
        const price = marketPrices.find(p => p.cultura === safra.cultura);
        const producao = safra.producaoEstimada;
        
        // Estimativas simplificadas
        const custoHectare = 5000; // R$ 5000 por hectare
        const areaNumero = parseFloat(safra.area);
        const custoTotal = custoHectare * areaNumero;
        
        let receitaEstimada = 0;
        if (price) {
          // Conversão simplificada para toneladas
          if (price.unidade.includes('saca')) {
            const sacas = (producao * 1000) / 60; // Convertendo toneladas para sacas de 60kg
            receitaEstimada = sacas * parseFloat(price.preco_medio);
          } else {
            receitaEstimada = producao * 1000 * parseFloat(price.preco_medio);
          }
        }
        
        const lucroEstimado = receitaEstimada - custoTotal;

        return {
          safra_id: safra.id,
          producao_estimada: producao,
          unidade: 'toneladas',
          custo_total_estimado: custoTotal,
          receita_estimada: receitaEstimada,
          lucro_estimado: lucroEstimado,
          data_previsao: new Date().toISOString().split('T')[0],
          observacoes: `Previsão baseada em preço de mercado de R$ ${price?.preco_medio || 0}/${price?.unidade || 'kg'}`
        };
      });

      const { error } = await supabase
        .from("harvest_forecasts")
        .insert(newForecasts);

      if (error) throw error;

      toast({
        title: "Previsões geradas",
        description: "Previsões de colheita atualizadas com sucesso!"
      });

      loadForecasts();
    } catch (error) {
      console.error("Erro ao gerar previsões:", error);
      toast({
        title: "Erro",
        description: "Erro ao gerar previsões.",
        variant: "destructive"
      });
    }
  };

  const getSafraByCultura = (safraId: number) => {
    return safras.find(s => s.id === safraId);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Previsão de Colheita e Lucros</CardTitle>
            <Button onClick={generateForecasts}>
              Gerar Novas Previsões
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Estimativas baseadas em preços de mercado atuais e produção esperada
          </p>
          
          <div className="space-y-4">
            {forecasts.slice(0, 6).map((forecast) => {
              const safra = getSafraByCultura(forecast.safra_id);
              if (!safra) return null;

              return (
                <div key={forecast.id} className="p-4 border border-border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">{safra.cultura}</h3>
                      <p className="text-sm text-muted-foreground">{safra.area}</p>
                    </div>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {new Date(forecast.data_previsao).toLocaleDateString('pt-BR')}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Package className="h-3 w-3" />
                        <span className="text-xs">Produção Estimada</span>
                      </div>
                      <p className="font-semibold text-foreground">
                        {parseFloat(forecast.producao_estimada).toFixed(1)} {forecast.unidade}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <DollarSign className="h-3 w-3" />
                        <span className="text-xs">Receita Estimada</span>
                      </div>
                      <p className="font-semibold text-primary">
                        R$ {parseFloat(forecast.receita_estimada || 0).toFixed(2)}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <TrendingUp className="h-3 w-3" />
                        <span className="text-xs">Lucro Estimado</span>
                      </div>
                      <p className={`font-bold ${parseFloat(forecast.lucro_estimado || 0) >= 0 ? 'text-primary' : 'text-destructive'}`}>
                        R$ {parseFloat(forecast.lucro_estimado || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground">{forecast.observacoes}</p>
                  </div>
                </div>
              );
            })}

            {forecasts.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Nenhuma previsão gerada ainda.</p>
                <Button onClick={generateForecasts}>
                  Gerar Primeira Previsão
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preços de Mercado Atuais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {marketPrices.map((price) => (
              <div key={price.id} className="p-3 border border-border rounded-lg">
                <h4 className="font-semibold text-foreground">{price.cultura}</h4>
                <p className="text-lg font-bold text-primary">
                  R$ {parseFloat(price.preco_medio).toFixed(2)} / {price.unidade}
                </p>
                <p className="text-xs text-muted-foreground">
                  Fonte: {price.fonte} - {new Date(price.data_referencia).toLocaleDateString('pt-BR')}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HarvestForecast;
