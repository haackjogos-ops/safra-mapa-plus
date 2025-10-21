import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Package, Search, AlertTriangle, TrendingUp, DollarSign, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AddSupplyDialog from "@/components/insumos/AddSupplyDialog";
import AddPurchaseDialog from "@/components/insumos/AddPurchaseDialog";
import SupplyStockAlert from "@/components/insumos/SupplyStockAlert";
import NFXmlUpload from "@/components/insumos/NFXmlUpload";
import SupplyUsageForecast from "@/components/insumos/SupplyUsageForecast";
import SupplierComparison from "@/components/insumos/SupplierComparison";
import MarketPrices from "@/components/insumos/MarketPrices";
import ConsumptionByCulture from "@/components/insumos/ConsumptionByCulture";
import DirectPurchase from "@/components/insumos/DirectPurchase";
import StockOverview from "@/components/insumos/StockOverview";
import EditableSupplyTable from "@/components/insumos/EditableSupplyTable";
import PurchaseCalendar from "@/components/insumos/PurchaseCalendar";
import { format } from "date-fns";

interface Supply {
  id: string;
  nome: string;
  categoria: string;
  quantidade_estoque: number;
  unidade_medida: string;
  preco_unitario: number;
  fornecedor: string | null;
  fornecedor_contato: string | null;
  data_validade: string | null;
  local_armazenamento: string | null;
  estoque_minimo: number;
  observacoes: string | null;
}

interface Purchase {
  id: string;
  supply_id: string;
  data_compra: string;
  quantidade: number;
  preco_unitario: number;
  valor_total: number;
  fornecedor: string;
  nota_fiscal: string | null;
  supplies: { nome: string };
}

interface InsumosProps {
  onMenuClick?: () => void;
}

const Insumos = ({ onMenuClick }: InsumosProps) => {
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
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

  const fetchPurchases = async () => {
    const { data, error } = await supabase
      .from("supply_purchases")
      .select("*, supplies(nome)")
      .order("data_compra", { ascending: false })
      .limit(50);

    if (error) {
      toast({
        title: "Erro ao carregar histórico",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setPurchases(data || []);
  };

  useEffect(() => {
    fetchSupplies();
    fetchPurchases();
  }, []);

  const filteredSupplies = supplies.filter((supply) => {
    const matchesSearch = supply.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supply.categoria.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || supply.categoria === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(supplies.map((s) => s.categoria)));

  const totalValue = supplies.reduce(
    (acc, supply) => acc + supply.quantidade_estoque * supply.preco_unitario,
    0
  );

  const lowStockCount = supplies.filter(
    (supply) => supply.quantidade_estoque <= supply.estoque_minimo
  ).length;

  return (
    <div className="min-h-screen">
      <Header
        title="Inventário de Insumos"
        subtitle="Controle de estoque e fornecedores"
        onMenuClick={onMenuClick}
      />
      <div className="p-6 space-y-6">
        <SupplyStockAlert supplies={supplies} />
        
        <NFXmlUpload onImportComplete={() => {
          fetchSupplies();
          fetchPurchases();
        }} />

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total em Estoque</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{supplies.length}</div>
              <p className="text-xs text-muted-foreground">
                tipos de insumos cadastrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                valor total do estoque
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Alertas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{lowStockCount}</div>
              <p className="text-xs text-muted-foreground">
                insumos com estoque baixo
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="inventory">Estoque</TabsTrigger>
            <TabsTrigger value="calendar">Calendário</TabsTrigger>
            <TabsTrigger value="purchases">Histórico</TabsTrigger>
            <TabsTrigger value="forecast">Previsões</TabsTrigger>
            <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
            <TabsTrigger value="market">Mercado</TabsTrigger>
            <TabsTrigger value="consumption">Consumo</TabsTrigger>
            <TabsTrigger value="purchase">Compra Direta</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <StockOverview />
          </TabsContent>

          <TabsContent value="calendar">
            <PurchaseCalendar />
          </TabsContent>

          <TabsContent value="inventory">
            <EditableSupplyTable />
          </TabsContent>

          <TabsContent value="purchases" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Histórico de Compras
                </CardTitle>
                <CardDescription>
                  Últimas 50 compras registradas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Insumo</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Preço Unit.</TableHead>
                        <TableHead>Valor Total</TableHead>
                        <TableHead>Fornecedor</TableHead>
                        <TableHead>NF</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchases.map((purchase) => (
                        <TableRow key={purchase.id}>
                          <TableCell>
                            {format(new Date(purchase.data_compra), "dd/MM/yyyy")}
                          </TableCell>
                          <TableCell className="font-medium">
                            {purchase.supplies.nome}
                          </TableCell>
                          <TableCell>{purchase.quantidade}</TableCell>
                          <TableCell>R$ {purchase.preco_unitario.toFixed(2)}</TableCell>
                          <TableCell className="font-bold">
                            R$ {purchase.valor_total.toFixed(2)}
                          </TableCell>
                          <TableCell>{purchase.fornecedor}</TableCell>
                          <TableCell>{purchase.nota_fiscal || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forecast">
            <SupplyUsageForecast />
          </TabsContent>

          <TabsContent value="suppliers">
            <SupplierComparison />
          </TabsContent>

          <TabsContent value="market">
            <MarketPrices />
          </TabsContent>

          <TabsContent value="consumption">
            <ConsumptionByCulture />
          </TabsContent>

          <TabsContent value="purchase">
            <DirectPurchase />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Insumos;
