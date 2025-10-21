import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CultureConsumption {
  cultura: string;
  supply_nome: string;
  categoria: string;
  total_quantidade: number;
  unidade: string;
  num_aplicacoes: number;
  custo_total: number;
}

const ConsumptionByCulture = () => {
  const [consumptionData, setConsumptionData] = useState<CultureConsumption[]>([]);
  const { toast } = useToast();

  const fetchConsumption = async () => {
    // Buscar uso de insumos com informações de área de plantio e insumos
    const { data: usageData, error: usageError } = await supabase
      .from("supply_usage")
      .select(`
        *,
        supplies (nome, categoria, unidade_medida, preco_unitario),
        planting_areas (cultura)
      `);

    if (usageError) {
      toast({
        title: "Erro ao carregar dados",
        description: usageError.message,
        variant: "destructive",
      });
      return;
    }

    // Agrupar por cultura e insumo
    const grouped = usageData.reduce((acc: any[], item: any) => {
      if (!item.planting_areas || !item.supplies) return acc;

      const key = `${item.planting_areas.cultura}-${item.supplies.nome}`;
      const existing = acc.find(
        (x) =>
          x.cultura === item.planting_areas.cultura &&
          x.supply_nome === item.supplies.nome
      );

      if (existing) {
        existing.total_quantidade += item.quantidade_usada;
        existing.num_aplicacoes += 1;
        existing.custo_total += item.quantidade_usada * item.supplies.preco_unitario;
      } else {
        acc.push({
          cultura: item.planting_areas.cultura,
          supply_nome: item.supplies.nome,
          categoria: item.supplies.categoria,
          total_quantidade: item.quantidade_usada,
          unidade: item.supplies.unidade_medida,
          num_aplicacoes: 1,
          custo_total: item.quantidade_usada * item.supplies.preco_unitario,
        });
      }

      return acc;
    }, []);

    setConsumptionData(grouped);
  };

  useEffect(() => {
    fetchConsumption();
  }, []);

  // Agrupar por cultura
  const groupedByCulture = consumptionData.reduce((acc, item) => {
    if (!acc[item.cultura]) {
      acc[item.cultura] = [];
    }
    acc[item.cultura].push(item);
    return acc;
  }, {} as Record<string, CultureConsumption[]>);

  return (
    <div className="space-y-4">
      {Object.entries(groupedByCulture).map(([cultura, items]) => {
        const totalCost = items.reduce((sum, item) => sum + item.custo_total, 0);

        return (
          <Card key={cultura}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    {cultura}
                  </CardTitle>
                  <CardDescription>
                    Consumo total de insumos para esta cultura
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    R$ {totalCost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-muted-foreground">Custo total</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Insumo</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Quantidade Total</TableHead>
                      <TableHead>Aplicações</TableHead>
                      <TableHead>Custo Total</TableHead>
                      <TableHead>Custo Médio/Aplicação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.supply_nome}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.categoria}</Badge>
                        </TableCell>
                        <TableCell>
                          {item.total_quantidade.toFixed(2)} {item.unidade}
                        </TableCell>
                        <TableCell>{item.num_aplicacoes}</TableCell>
                        <TableCell className="font-bold">
                          R$ {item.custo_total.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          R$ {(item.custo_total / item.num_aplicacoes).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        );
      })}
      {Object.keys(groupedByCulture).length === 0 && (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              Nenhum dado de consumo registrado ainda
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ConsumptionByCulture;
