import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Supply {
  id: string;
  nome: string;
  categoria: string;
  quantidade_estoque: number;
  unidade_medida: string;
  preco_unitario: number;
  estoque_minimo: number;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const StockOverview = () => {
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const { toast } = useToast();

  const fetchSupplies = async () => {
    const { data, error } = await supabase
      .from("supplies")
      .select("*")
      .order("nome");

    if (error) {
      toast({
        title: "Erro ao carregar insumos",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setSupplies(data || []);
  };

  useEffect(() => {
    fetchSupplies();
  }, []);

  // Dados por categoria
  const categoryData = supplies.reduce((acc, supply) => {
    const existing = acc.find((item) => item.categoria === supply.categoria);
    const value = supply.quantidade_estoque * supply.preco_unitario;

    if (existing) {
      existing.valor += value;
      existing.quantidade += supply.quantidade_estoque;
    } else {
      acc.push({
        categoria: supply.categoria,
        valor: value,
        quantidade: supply.quantidade_estoque,
      });
    }
    return acc;
  }, [] as { categoria: string; valor: number; quantidade: number }[]);

  // Top 10 insumos por valor
  const topSuppliesByValue = [...supplies]
    .map((supply) => ({
      nome: supply.nome,
      valor: supply.quantidade_estoque * supply.preco_unitario,
    }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 10);

  // Insumos com estoque baixo
  const lowStockSupplies = supplies.filter(
    (supply) => supply.quantidade_estoque <= supply.estoque_minimo
  );

  const lowStockData = lowStockSupplies.map((supply) => ({
    nome: supply.nome.length > 15 ? supply.nome.substring(0, 15) + "..." : supply.nome,
    estoque: supply.quantidade_estoque,
    minimo: supply.estoque_minimo,
  }));

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Estoque por Categoria</CardTitle>
            <CardDescription>Valor total em estoque por categoria</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ categoria, percent }) =>
                    `${categoria} (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="valor"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) =>
                    `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top 10 Insumos por Valor
            </CardTitle>
            <CardDescription>Maiores valores em estoque</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topSuppliesByValue} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="nome" type="category" width={100} />
                <Tooltip
                  formatter={(value: number) =>
                    `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                  }
                />
                <Bar dataKey="valor" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {lowStockData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Alertas de Estoque Baixo</CardTitle>
            <CardDescription>
              Insumos que atingiram ou estão abaixo do estoque mínimo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={lowStockData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="estoque" fill="#ef4444" name="Estoque Atual" />
                <Bar dataKey="minimo" fill="#f59e0b" name="Estoque Mínimo" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StockOverview;
