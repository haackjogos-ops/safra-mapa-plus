import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TrendingUp, TrendingDown, Plus, DollarSign, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface MarketPrice {
  id: string;
  cultura: string;
  preco_medio: number;
  unidade: string;
  data_referencia: string;
  fonte: string | null;
  observacoes: string | null;
}

const MarketPrices = () => {
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAiSearchOpen, setIsAiSearchOpen] = useState(false);
  const [aiSearchProduct, setAiSearchProduct] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [formData, setFormData] = useState({
    cultura: "",
    preco_medio: "",
    unidade: "kg",
    fonte: "",
    observacoes: "",
  });
  const { toast } = useToast();

  const fetchPrices = async () => {
    const { data, error } = await supabase
      .from("market_prices")
      .select("*")
      .order("data_referencia", { ascending: false })
      .limit(50);

    if (error) {
      toast({
        title: "Erro ao carregar preços",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setPrices(data || []);
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  const handleAiSearch = async () => {
    if (!aiSearchProduct.trim()) {
      toast({
        title: "Digite um produto",
        description: "Informe o nome do insumo para buscar",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);

    try {
      const { data, error } = await supabase.functions.invoke('search-market-prices', {
        body: { produto: aiSearchProduct }
      });

      if (error) throw error;

      if (data?.success && data?.data) {
        const priceData = data.data;
        
        // Inserir no banco de dados
        const { error: insertError } = await supabase.from("market_prices").insert({
          cultura: priceData.produto,
          preco_medio: priceData.preco_medio,
          unidade: priceData.unidade,
          data_referencia: priceData.data_referencia,
          fonte: priceData.fonte || "OpenAI Search",
          observacoes: priceData.observacoes || null,
        });

        if (insertError) throw insertError;

        toast({
          title: "Preço encontrado!",
          description: `${priceData.produto}: R$ ${priceData.preco_medio.toFixed(2)}/${priceData.unidade}`,
        });

        setAiSearchProduct("");
        setIsAiSearchOpen(false);
        fetchPrices();
      }
    } catch (error: any) {
      console.error('Error searching prices:', error);
      toast({
        title: "Erro na busca",
        description: error.message || "Não foi possível buscar o preço",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("market_prices").insert({
      cultura: formData.cultura,
      preco_medio: parseFloat(formData.preco_medio),
      unidade: formData.unidade,
      data_referencia: new Date().toISOString().split("T")[0],
      fonte: formData.fonte || null,
      observacoes: formData.observacoes || null,
    });

    if (error) {
      toast({
        title: "Erro ao adicionar preço",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Preço adicionado",
      description: "Preço de mercado registrado com sucesso",
    });

    setFormData({
      cultura: "",
      preco_medio: "",
      unidade: "kg",
      fonte: "",
      observacoes: "",
    });
    setIsDialogOpen(false);
    fetchPrices();
  };

  const getPriceTrend = (cultura: string) => {
    const culturaPrices = prices.filter((p) => p.cultura === cultura).slice(0, 2);
    if (culturaPrices.length < 2) return null;

    const diff = culturaPrices[0].preco_medio - culturaPrices[1].preco_medio;
    const percentage = (diff / culturaPrices[1].preco_medio) * 100;

    return {
      direction: diff > 0 ? "up" : "down",
      percentage: Math.abs(percentage),
    };
  };

  const groupedPrices = prices.reduce((acc, price) => {
    if (!acc[price.cultura]) {
      acc[price.cultura] = [];
    }
    acc[price.cultura].push(price);
    return acc;
  }, {} as Record<string, MarketPrice[]>);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
            Preços de Mercado
            </CardTitle>
            <CardDescription>
              Acompanhe os preços de insumos no mercado
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Dialog open={isAiSearchOpen} onOpenChange={setIsAiSearchOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Buscar com IA
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Buscar Preços com IA
                  </DialogTitle>
                  <DialogDescription>
                    Use inteligência artificial para buscar preços atualizados de mercado
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="ai-search">Nome do Produto/Insumo</Label>
                    <Input
                      id="ai-search"
                      placeholder="Ex: Ureia, NPK 20-05-20, Glifosato..."
                      value={aiSearchProduct}
                      onChange={(e) => setAiSearchProduct(e.target.value)}
                      disabled={isSearching}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAiSearch} disabled={isSearching}>
                    {isSearching ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Buscando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Buscar
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Preço
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Preço de Mercado</DialogTitle>
                <DialogDescription>
                  Adicione informações sobre preços atualizados
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cultura">Produto/Insumo</Label>
                    <Input
                      id="cultura"
                      value={formData.cultura}
                      onChange={(e) =>
                        setFormData({ ...formData, cultura: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="preco_medio">Preço Médio</Label>
                      <Input
                        id="preco_medio"
                        type="number"
                        step="0.01"
                        value={formData.preco_medio}
                        onChange={(e) =>
                          setFormData({ ...formData, preco_medio: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="unidade">Unidade</Label>
                      <select
                        id="unidade"
                        className="w-full border rounded-md px-3 py-2"
                        value={formData.unidade}
                        onChange={(e) =>
                          setFormData({ ...formData, unidade: e.target.value })
                        }
                      >
                        <option value="kg">kg</option>
                        <option value="litro">litro</option>
                        <option value="saco">saco</option>
                        <option value="tonelada">tonelada</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="fonte">Fonte</Label>
                    <Input
                      id="fonte"
                      value={formData.fonte}
                      onChange={(e) =>
                        setFormData({ ...formData, fonte: e.target.value })
                      }
                      placeholder="Ex: CEPEA, ESALQ, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="observacoes">Observações</Label>
                    <Input
                      id="observacoes"
                      value={formData.observacoes}
                      onChange={(e) =>
                        setFormData({ ...formData, observacoes: e.target.value })
                      }
                    />
                  </div>
                </div>
                <DialogFooter className="mt-4">
                  <Button type="submit">Salvar</Button>
                </DialogFooter>
              </form>
            </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto/Insumo</TableHead>
                <TableHead>Preço Médio</TableHead>
                <TableHead>Tendência</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Fonte</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(groupedPrices).map(([cultura, culturaPrices]) => {
                const latestPrice = culturaPrices[0];
                const trend = getPriceTrend(cultura);

                return (
                  <TableRow key={cultura}>
                    <TableCell className="font-medium">{cultura}</TableCell>
                    <TableCell>
                      R$ {latestPrice.preco_medio.toFixed(2)}/{latestPrice.unidade}
                    </TableCell>
                    <TableCell>
                      {trend && (
                        <div className="flex items-center gap-1">
                          {trend.direction === "up" ? (
                            <TrendingUp className="h-4 w-4 text-destructive" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-green-600" />
                          )}
                          <span
                            className={
                              trend.direction === "up"
                                ? "text-destructive"
                                : "text-green-600"
                            }
                          >
                            {trend.percentage.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(latestPrice.data_referencia), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell>
                      {latestPrice.fonte ? (
                        <Badge variant="outline">{latestPrice.fonte}</Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketPrices;
