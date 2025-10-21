import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp } from "lucide-react";

interface SupplyUsage {
  supply_name: string;
  total_used: number;
  total_area: number;
  total_cost: number;
  applications_count: number;
}

interface AreaUsage {
  area_name: string;
  cultura: string;
  total_product: number;
  applications_count: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const ApplicationReports = () => {
  const [supplyUsage, setSupplyUsage] = useState<SupplyUsage[]>([]);
  const [areaUsage, setAreaUsage] = useState<AreaUsage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      // Load applications with related data
      const { data: applications, error } = await supabase
        .from("applications")
        .select(`
          *,
          supplies(nome, preco_unitario),
          planting_areas(nome, cultura)
        `);

      if (error) throw error;

      // Process supply usage
      const supplyMap = new Map<string, SupplyUsage>();
      applications?.forEach(app => {
        const supplyName = app.supplies?.nome || 'Desconhecido';
        const existing = supplyMap.get(supplyName) || {
          supply_name: supplyName,
          total_used: 0,
          total_area: 0,
          total_cost: 0,
          applications_count: 0
        };
        
        existing.total_used += app.total_product_used || 0;
        existing.total_area += app.area_applied || 0;
        existing.total_cost += app.application_cost || 0;
        existing.applications_count += 1;
        
        supplyMap.set(supplyName, existing);
      });

      // Process area usage
      const areaMap = new Map<string, AreaUsage>();
      applications?.forEach(app => {
        const areaName = app.planting_areas?.nome || 'Desconhecido';
        const existing = areaMap.get(areaName) || {
          area_name: areaName,
          cultura: app.planting_areas?.cultura || '',
          total_product: 0,
          applications_count: 0
        };
        
        existing.total_product += app.total_product_used || 0;
        existing.applications_count += 1;
        
        areaMap.set(areaName, existing);
      });

      setSupplyUsage(Array.from(supplyMap.values()));
      setAreaUsage(Array.from(areaMap.values()));
    } catch (error) {
      console.error("Erro ao carregar relatórios:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Carregando relatórios...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Uso de Insumos por Produto
          </CardTitle>
        </CardHeader>
        <CardContent>
          {supplyUsage.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum dado disponível ainda.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={supplyUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="supply_name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total_used" fill="hsl(var(--primary))" name="Volume Usado (L)" />
                <Bar dataKey="total_area" fill="hsl(var(--secondary))" name="Área Aplicada (ha)" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Aplicações por Talhão</CardTitle>
        </CardHeader>
        <CardContent>
          {areaUsage.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum dado disponível ainda.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={areaUsage}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.area_name}: ${entry.applications_count}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="applications_count"
                >
                  {areaUsage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resumo por Produto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {supplyUsage.map((item, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">{item.supply_name}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Volume Usado</p>
                    <p className="font-medium">{item.total_used.toFixed(2)} L</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Área Total</p>
                    <p className="font-medium">{item.total_area.toFixed(2)} ha</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Aplicações</p>
                    <p className="font-medium">{item.applications_count}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Custo Total</p>
                    <p className="font-medium">R$ {item.total_cost.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplicationReports;
