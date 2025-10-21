import Header from "@/components/layout/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Calendar, DollarSign } from "lucide-react";
import AnnualComparison from "@/components/relatorios/AnnualComparison";
import QuarterlyComparison from "@/components/relatorios/QuarterlyComparison";
import HarvestForecast from "@/components/relatorios/HarvestForecast";

const Relatorios = () => {
  return (
    <div className="min-h-screen">
      <Header 
        title="Relatórios e Análises" 
        subtitle="Análise detalhada da produção e finanças"
      />
      
      <div className="p-6 space-y-6">
        {/* Cards de Resumo */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Tipos de Relatórios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">4</p>
              <p className="text-xs text-muted-foreground mt-1">Disponíveis</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Comparações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">Anual/Trimestral</p>
              <p className="text-xs text-muted-foreground mt-1">Análise temporal</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Previsões
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-secondary">Colheita</p>
              <p className="text-xs text-muted-foreground mt-1">Estimativas de lucro</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Análise Financeira
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-accent">Completa</p>
              <p className="text-xs text-muted-foreground mt-1">Custos e receitas</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de Relatórios */}
        <Tabs defaultValue="anual" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="anual" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Comparação Anual
            </TabsTrigger>
            <TabsTrigger value="trimestral" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Comparação Trimestral
            </TabsTrigger>
            <TabsTrigger value="previsao" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Previsão de Colheita
            </TabsTrigger>
          </TabsList>

          <TabsContent value="anual" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Relatório de Comparação Anual</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Compare o desempenho financeiro da propriedade ao longo dos anos
                </p>
              </CardHeader>
              <CardContent>
                <AnnualComparison />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trimestral" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Relatório de Comparação Trimestral</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Analise o desempenho financeiro por trimestre do ano
                </p>
              </CardHeader>
              <CardContent>
                <QuarterlyComparison />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="previsao" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Relatório de Previsão de Colheita e Lucros</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Estimativas de produção e retorno financeiro baseadas em preços de mercado
                </p>
              </CardHeader>
              <CardContent>
                <HarvestForecast />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Informações Adicionais */}
        <Card>
          <CardHeader>
            <CardTitle>Como Usar os Relatórios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Comparação Anual</h4>
                <p className="text-sm text-muted-foreground">
                  Visualize a evolução de receitas, despesas e lucros ao longo dos anos. Configure o período desejado e analise tendências.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Comparação Trimestral</h4>
                <p className="text-sm text-muted-foreground">
                  Acompanhe a sazonalidade do seu negócio analisando o desempenho por trimestre. Identifique períodos de maior e menor rentabilidade.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Previsão de Colheita</h4>
                <p className="text-sm text-muted-foreground">
                  Estime a produção e o retorno financeiro de cada safra com base nos preços de mercado atuais. Planeje suas vendas e investimentos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Relatorios;
