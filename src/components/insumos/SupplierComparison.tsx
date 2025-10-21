import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingDown, TrendingUp, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SupplierStats {
  fornecedor: string;
  total_compras: number;
  valor_total: number;
  preco_medio: number;
  ultima_compra: string;
  num_notas_fiscais: number;
}

const SupplierComparison = () => {
  const [suppliers, setSuppliers] = useState<SupplierStats[]>([]);
  const [selectedSupply, setSelectedSupply] = useState<string>("all");
  const [supplyOptions, setSupplyOptions] = useState<Array<{ id: string; nome: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSupplies();
  }, []);

  useEffect(() => {
    fetchSupplierStats();
  }, [selectedSupply]);

  const fetchSupplies = async () => {
    const { data } = await supabase
      .from("supplies")
      .select("id, nome")
      .order("nome");
    
    setSupplyOptions(data || []);
  };

  const fetchSupplierStats = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("supply_purchases")
        .select("fornecedor, quantidade, preco_unitario, valor_total, data_compra, nota_fiscal, supply_id");

      if (selectedSupply !== "all") {
        query = query.eq("supply_id", selectedSupply);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Agrupar por fornecedor
      const supplierMap = new Map<string, SupplierStats>();

      data?.forEach((purchase) => {
        const current = supplierMap.get(purchase.fornecedor) || {
          fornecedor: purchase.fornecedor,
          total_compras: 0,
          valor_total: 0,
          preco_medio: 0,
          ultima_compra: purchase.data_compra,
          num_notas_fiscais: 0,
        };

        current.total_compras += 1;
        current.valor_total += purchase.valor_total;
        if (purchase.nota_fiscal) current.num_notas_fiscais += 1;
        
        if (new Date(purchase.data_compra) > new Date(current.ultima_compra)) {
          current.ultima_compra = purchase.data_compra;
        }

        supplierMap.set(purchase.fornecedor, current);
      });

      // Calcular preço médio
      const stats = Array.from(supplierMap.values()).map(stat => ({
        ...stat,
        preco_medio: stat.valor_total / stat.total_compras,
      }));

      // Ordenar por valor total (maiores fornecedores primeiro)
      stats.sort((a, b) => b.valor_total - a.valor_total);

      setSuppliers(stats);
    } catch (error) {
      console.error("Erro ao buscar estatísticas de fornecedores:", error);
    } finally {
      setLoading(false);
    }
  };

  const getBestPriceSupplier = () => {
    if (suppliers.length === 0) return null;
    return suppliers.reduce((best, current) => 
      current.preco_medio < best.preco_medio ? current : best
    );
  };

  const bestSupplier = getBestPriceSupplier();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Comparação de Fornecedores
        </CardTitle>
        <CardDescription>
          Analise preços e histórico de compras por fornecedor
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Filtrar por insumo:</label>
          <Select value={selectedSupply} onValueChange={setSelectedSupply}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Selecione um insumo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os insumos</SelectItem>
              {supplyOptions.map((supply) => (
                <SelectItem key={supply.id} value={supply.id}>
                  {supply.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div>Carregando...</div>
        ) : suppliers.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            Nenhuma compra registrada
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Total de Compras</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Preço Médio</TableHead>
                  <TableHead>Última Compra</TableHead>
                  <TableHead>NFs Emitidas</TableHead>
                  <TableHead>Custo-Benefício</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((supplier) => (
                  <TableRow key={supplier.fornecedor}>
                    <TableCell className="font-medium">
                      {supplier.fornecedor}
                      {supplier.fornecedor === bestSupplier?.fornecedor && (
                        <Badge className="ml-2 bg-green-500">Melhor Preço</Badge>
                      )}
                    </TableCell>
                    <TableCell>{supplier.total_compras}</TableCell>
                    <TableCell>
                      R$ {supplier.valor_total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="font-bold">
                      R$ {supplier.preco_medio.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      {new Date(supplier.ultima_compra).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      {supplier.num_notas_fiscais}/{supplier.total_compras}
                    </TableCell>
                    <TableCell>
                      {bestSupplier && supplier.fornecedor === bestSupplier.fornecedor ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <TrendingDown className="h-4 w-4" />
                          <span className="text-sm font-medium">Econômico</span>
                        </div>
                      ) : bestSupplier && supplier.preco_medio > bestSupplier.preco_medio * 1.2 ? (
                        <div className="flex items-center gap-1 text-red-600">
                          <TrendingUp className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            +{((supplier.preco_medio / bestSupplier.preco_medio - 1) * 100).toFixed(0)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Normal</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SupplierComparison;
