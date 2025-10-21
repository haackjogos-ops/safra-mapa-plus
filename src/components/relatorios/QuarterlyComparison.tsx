import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";

const QuarterlyComparison = () => {
  const [data, setData] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadData();
  }, [selectedYear]);

  const loadData = async () => {
    try {
      const { data: result, error } = await supabase
        .rpc('get_quarterly_comparison', {
          year_param: selectedYear
        });

      if (error) throw error;

      const formatted = (result || []).map((item: any) => ({
        trimestre: `${item.trimestre}º Tri`,
        receitas: parseFloat(item.total_receitas || 0),
        despesas: parseFloat(item.total_despesas || 0),
        lucro: parseFloat(item.lucro || 0)
      }));

      setData(formatted);
    } catch (error) {
      console.error("Erro ao carregar comparação trimestral:", error);
    }
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Selecionar Ano
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Ano de Referência</Label>
            <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Desempenho Trimestral - {selectedYear}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="trimestre" stroke="hsl(var(--foreground))" />
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
              <Bar dataKey="lucro" name="Lucro" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detalhamento Trimestral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {data.map((item) => (
                <div key={item.trimestre} className="p-4 border border-border rounded-lg space-y-2">
                  <h3 className="font-semibold text-lg text-foreground">{item.trimestre}</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Receitas:</span>
                      <span className="font-medium text-primary">R$ {item.receitas.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Despesas:</span>
                      <span className="font-medium text-destructive">R$ {item.despesas.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-border">
                      <span className="font-medium text-foreground">Lucro:</span>
                      <span className={`font-bold ${item.lucro >= 0 ? 'text-primary' : 'text-destructive'}`}>
                        R$ {item.lucro.toFixed(2)}
                      </span>
                    </div>
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

export default QuarterlyComparison;
