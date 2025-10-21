import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, TrendingDown, Wallet, ArrowUpDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AddTransactionDialog from "@/components/financeiro/AddTransactionDialog";
import FinancialCharts from "@/components/financeiro/FinancialCharts";
import BankImport from "@/components/financeiro/BankImport";
import { format } from "date-fns";

interface FinanceiroProps {
  onMenuClick?: () => void;
}

const Financeiro = ({ onMenuClick }: FinanceiroProps) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [safras, setSafras] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([loadTransactions(), loadCategories(), loadSafras()]);
    setLoading(false);
  };

  const loadTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from("financial_transactions")
        .select("*")
        .order("data_transacao", { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error("Erro ao carregar transações:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar transações.",
        variant: "destructive"
      });
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("financial_categories")
        .select("*");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    }
  };

  const loadSafras = async () => {
    setSafras([
      { id: 1, cultura: "Soja", area: "150 ha" },
      { id: 2, cultura: "Milho", area: "200 ha" },
      { id: 3, cultura: "Arroz", area: "80 ha" }
    ]);
  };

  const filteredTransactions = transactions.filter(t =>
    t.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTransactionsByType = (tipo: 'receita' | 'despesa') => {
    return filteredTransactions.filter(t => t.tipo === tipo);
  };

  // Calcular estatísticas
  const totalReceitas = transactions
    .filter(t => t.tipo === 'receita' && t.status === 'pago')
    .reduce((sum, t) => sum + parseFloat(t.valor), 0);

  const totalDespesas = transactions
    .filter(t => t.tipo === 'despesa' && t.status === 'pago')
    .reduce((sum, t) => sum + parseFloat(t.valor), 0);

  const saldo = totalReceitas - totalDespesas;

  const receitasPendentes = transactions
    .filter(t => t.tipo === 'receita' && t.status === 'pendente')
    .reduce((sum, t) => sum + parseFloat(t.valor), 0);

  const despesasPendentes = transactions
    .filter(t => t.tipo === 'despesa' && t.status === 'pendente')
    .reduce((sum, t) => sum + parseFloat(t.valor), 0);

  const getStatusColor = (status: string) => {
    const colors = {
      pendente: "bg-secondary/10 text-secondary-foreground border-secondary/20",
      pago: "bg-primary/10 text-primary border-primary/20",
      atrasado: "bg-destructive/10 text-destructive border-destructive/20"
    };
    return colors[status as keyof typeof colors] || colors.pendente;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pendente: "Pendente",
      pago: "Pago",
      atrasado: "Atrasado",
      cancelado: "Cancelado"
    };
    return labels[status as keyof typeof labels] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header title="Gestão Financeira" subtitle="Controle de receitas e despesas" />
        <div className="p-6">
          <p className="text-center text-muted-foreground">Carregando dados financeiros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header title="Gestão Financeira" subtitle="Controle de receitas e despesas" onMenuClick={onMenuClick} />
      
      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Total Receitas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">R$ {totalReceitas.toFixed(2)}</p>
              {receitasPendentes > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  + R$ {receitasPendentes.toFixed(2)} pendentes
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                Total Despesas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-destructive">R$ {totalDespesas.toFixed(2)}</p>
              {despesasPendentes > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  + R$ {despesasPendentes.toFixed(2)} pendentes
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Saldo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-primary' : 'text-destructive'}`}>
                R$ {saldo.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Receitas - Despesas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4" />
                Transações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{transactions.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Total registradas</p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <FinancialCharts transactions={transactions} categories={categories} />

        {/* Importação de Extratos */}
        <BankImport onImportComplete={loadTransactions} />

        {/* Lista de Transações */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar transação..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <AddTransactionDialog
              categories={categories}
              safras={safras}
              onTransactionAdded={loadTransactions}
            />
          </div>

          <Tabs defaultValue="todas" className="space-y-4">
            <TabsList>
              <TabsTrigger value="todas">Todas</TabsTrigger>
              <TabsTrigger value="receitas">Receitas</TabsTrigger>
              <TabsTrigger value="despesas">Despesas</TabsTrigger>
            </TabsList>

            <TabsContent value="todas">
              <Card>
                <CardHeader>
                  <CardTitle>Todas as Transações</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/5 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-foreground">{transaction.descricao}</h4>
                            <Badge variant="outline" className={getStatusColor(transaction.status)}>
                              {getStatusLabel(transaction.status)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{transaction.categoria}</span>
                            <span>•</span>
                            <span>{format(new Date(transaction.data_transacao), "dd/MM/yyyy")}</span>
                            {transaction.forma_pagamento && (
                              <>
                                <span>•</span>
                                <span>{transaction.forma_pagamento}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${
                            transaction.tipo === 'receita' ? 'text-primary' : 'text-destructive'
                          }`}>
                            {transaction.tipo === 'receita' ? '+' : '-'} R$ {parseFloat(transaction.valor).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {filteredTransactions.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        Nenhuma transação encontrada.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="receitas">
              <Card>
                <CardHeader>
                  <CardTitle>Receitas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getTransactionsByType('receita').map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/5 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-foreground">{transaction.descricao}</h4>
                            <Badge variant="outline" className={getStatusColor(transaction.status)}>
                              {getStatusLabel(transaction.status)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{transaction.categoria}</span>
                            <span>•</span>
                            <span>{format(new Date(transaction.data_transacao), "dd/MM/yyyy")}</span>
                          </div>
                        </div>
                        <p className="text-lg font-bold text-primary">
                          + R$ {parseFloat(transaction.valor).toFixed(2)}
                        </p>
                      </div>
                    ))}
                    {getTransactionsByType('receita').length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        Nenhuma receita encontrada.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="despesas">
              <Card>
                <CardHeader>
                  <CardTitle>Despesas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getTransactionsByType('despesa').map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/5 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-foreground">{transaction.descricao}</h4>
                            <Badge variant="outline" className={getStatusColor(transaction.status)}>
                              {getStatusLabel(transaction.status)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{transaction.categoria}</span>
                            <span>•</span>
                            <span>{format(new Date(transaction.data_transacao), "dd/MM/yyyy")}</span>
                          </div>
                        </div>
                        <p className="text-lg font-bold text-destructive">
                          - R$ {parseFloat(transaction.valor).toFixed(2)}
                        </p>
                      </div>
                    ))}
                    {getTransactionsByType('despesa').length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        Nenhuma despesa encontrada.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Financeiro;
