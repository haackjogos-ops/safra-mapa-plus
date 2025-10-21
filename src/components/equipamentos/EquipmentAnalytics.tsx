import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Activity, DollarSign, Wrench, TrendingUp } from "lucide-react";

export const EquipmentAnalytics = () => {
  const { data: equipamentos } = useQuery({
    queryKey: ["equipamentos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("equipamentos").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: manutencoes } = useQuery({
    queryKey: ["manutencoes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("manutencoes").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: escala } = useQuery({
    queryKey: ["escala_trabalho"],
    queryFn: async () => {
      const { data, error } = await supabase.from("escala_trabalho").select("*");
      if (error) throw error;
      return data;
    },
  });

  // Estatísticas gerais
  const totalEquipamentos = equipamentos?.length || 0;
  const equipamentosDisponiveis = equipamentos?.filter(e => e.status === 'disponivel').length || 0;
  const totalManutencoes = manutencoes?.length || 0;
  const custoManutencao = manutencoes?.reduce((acc, m) => acc + (m.custo || 0), 0) || 0;

  // Dados por tipo de equipamento
  const equipamentosPorTipo = equipamentos?.reduce((acc: any, equip) => {
    const tipo = equip.tipo || 'outros';
    acc[tipo] = (acc[tipo] || 0) + 1;
    return acc;
  }, {});

  const tipoData = Object.entries(equipamentosPorTipo || {}).map(([name, value]) => ({
    name,
    value,
  }));

  // Dados de status
  const statusData = [
    { name: 'Disponível', value: equipamentos?.filter(e => e.status === 'disponivel').length || 0 },
    { name: 'Em Uso', value: equipamentos?.filter(e => e.status === 'em_uso').length || 0 },
    { name: 'Manutenção', value: equipamentos?.filter(e => e.status === 'manutencao').length || 0 },
    { name: 'Inativo', value: equipamentos?.filter(e => e.status === 'inativo').length || 0 },
  ];

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Equipamentos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEquipamentos}</div>
            <p className="text-xs text-muted-foreground">
              {equipamentosDisponiveis} disponíveis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Manutenções</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalManutencoes}</div>
            <p className="text-xs text-muted-foreground">Total registradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Custo de Manutenção</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {custoManutencao.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">Total acumulado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Operações</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{escala?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Registros de trabalho</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Equipamentos por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tipoData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status dos Equipamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
