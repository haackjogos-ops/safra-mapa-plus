import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";

const AnnualComparison = () => {
  const [data, setData] = useState<any[]>([]);
  const [startYear, setStartYear] = useState(new Date().getFullYear() - 2);
  const [endYear, setEndYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadData();
  }, [startYear, endYear]);

  const loadData = async () => {
    try {
      const { data: result, error } = await supabase
        .rpc('get_annual_comparison', {
          year_start: startYear,
          year_end: endYear
        });

      if (error) throw error;

      const formatted = (result || []).map((item: any) => ({
        ano: item.ano.toString(),
        receitas: parseFloat(item.total_receitas || 0),
        despesas: parseFloat(item.total_despesas || 0),
        lucro: parseFloat(item.lucro || 0),
        transacoes: parseInt(item.num_transacoes || 0)
      }));

      setData(formatted);
    } catch (error) {
      console.error("Erro ao carregar comparação anual:", error);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Configurar Período
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ano Inicial</Label>
              <Input
                type="number"
                value={startYear}
                onChange={(e) => setStartYear(parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Ano Final</Label>
              <Input
                type="number"
                value={endYear}
                onChange={(e) => setEndYear(parseInt(e.target.value))}
              />
            </div>
          </div>
          <Button onClick={loadData} className="w-full mt-4">
            Atualizar Comparação
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comparativo de Receitas e Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="ano" stroke="hsl(var(--foreground))" />
              <YAxis stroke="hsl(var(--foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
                formatter={(value: number) => `R$ ${value.toFixed(2)}`}
              />
              <Legend />
              <Bar dataKey="receitas" name="Receitas" fill="#22c55e" />
              <Bar dataKey="despesas" name="Despesas" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Evolução do Lucro</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="ano" stroke="hsl(var(--foreground))" />
              <YAxis stroke="hsl(var(--foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
                formatter={(value: number) => `R$ ${value.toFixed(2)}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="lucro"
                name="Lucro"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo do Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.map((item) => (
                <div key={item.ano} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="font-semibold text-foreground">Ano {item.ano}</p>
                    <p className="text-sm text-muted-foreground">{item.transacoes} transações</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Receitas: R$ {item.receitas.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">Despesas: R$ {item.despesas.toFixed(2)}</p>
                    <p className={`font-bold ${item.lucro >= 0 ? 'text-primary' : 'text-destructive'}`}>
                      Lucro: R$ {item.lucro.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnnualComparison;
