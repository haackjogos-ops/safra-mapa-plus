import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface FinancialChartsProps {
  transactions: any[];
  categories: any[];
}

const FinancialCharts = ({ transactions, categories }: FinancialChartsProps) => {
  // Preparar dados para gráfico de fluxo de caixa mensal
  const getMonthlyFlowData = () => {
    const monthlyData: Record<string, { mes: string; receitas: number; despesas: number; saldo: number }> = {};

    transactions.forEach(t => {
      const date = new Date(t.data_transacao);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });

      if (!monthlyData[key]) {
        monthlyData[key] = { mes: monthName, receitas: 0, despesas: 0, saldo: 0 };
      }

      const valor = parseFloat(t.valor);
      if (t.tipo === 'receita') {
        monthlyData[key].receitas += valor;
        monthlyData[key].saldo += valor;
      } else {
        monthlyData[key].despesas += valor;
        monthlyData[key].saldo -= valor;
      }
    });

    return Object.values(monthlyData).sort((a, b) => a.mes.localeCompare(b.mes)).slice(-6);
  };

  // Preparar dados para gráfico de categorias
  const getCategoryData = (tipo: 'receita' | 'despesa') => {
    const categoryTotals: Record<string, number> = {};

    transactions
      .filter(t => t.tipo === tipo)
      .forEach(t => {
        const valor = parseFloat(t.valor);
        categoryTotals[t.categoria] = (categoryTotals[t.categoria] || 0) + valor;
      });

    return Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value,
      color: categories.find(c => c.nome === name)?.cor || '#888888'
    }));
  };

  const monthlyFlowData = getMonthlyFlowData();
  const despesasCategoryData = getCategoryData('despesa');
  const receitasCategoryData = getCategoryData('receita');

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Fluxo de Caixa Mensal */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Fluxo de Caixa Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyFlowData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="mes" stroke="hsl(var(--foreground))" />
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
                dataKey="receitas"
                name="Receitas"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ fill: '#22c55e' }}
              />
              <Line
                type="monotone"
                dataKey="despesas"
                name="Despesas"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: '#ef4444' }}
              />
              <Line
                type="monotone"
                dataKey="saldo"
                name="Saldo"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Despesas por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle>Despesas por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={despesasCategoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {despesasCategoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Receitas por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle>Receitas por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={receitasCategoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
              <YAxis stroke="hsl(var(--foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
                formatter={(value: number) => `R$ ${value.toFixed(2)}`}
              />
              <Bar dataKey="value" name="Valor">
                {receitasCategoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialCharts;
