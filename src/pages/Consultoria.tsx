import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Camera, FileText, Sprout, TrendingUp, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const Consultoria = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Buscar estatísticas gerais
  const { data: stats } = useQuery({
    queryKey: ['consultoria-stats', user?.id],
    queryFn: async () => {
      const [safrasRes, fotosRes, recomendacoesRes] = await Promise.all([
        supabase.from('safras').select('*', { count: 'exact' }),
        supabase.from('lavoura_fotos').select('*', { count: 'exact' }).eq('agricultor_id', user?.id),
        supabase.from('recomendacoes').select('*', { count: 'exact' }).eq('agricultor_id', user?.id).eq('status', 'pendente')
      ]);

      return {
        safras: safrasRes.count || 0,
        fotos: fotosRes.count || 0,
        recomendacoesPendentes: recomendacoesRes.count || 0
      };
    },
    enabled: !!user
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Consultoria</h1>
        <p className="text-muted-foreground">Acompanhamento completo da sua lavoura</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Safras Ativas</CardTitle>
            <Sprout className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.safras || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Fotos Enviadas</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.fotos || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recomendações Pendentes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.recomendacoesPendentes || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="safras">
            <Sprout className="h-4 w-4 mr-2" />
            Safras
          </TabsTrigger>
          <TabsTrigger value="fotos">
            <Camera className="h-4 w-4 mr-2" />
            Fotos
          </TabsTrigger>
          <TabsTrigger value="recomendacoes">
            <FileText className="h-4 w-4 mr-2" />
            Recomendações
          </TabsTrigger>
          <TabsTrigger value="evolucao">
            <TrendingUp className="h-4 w-4 mr-2" />
            Evolução
          </TabsTrigger>
          <TabsTrigger value="relatorios">
            <Calendar className="h-4 w-4 mr-2" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Visão Geral da Consultoria</CardTitle>
              <CardDescription>Resumo completo do acompanhamento da lavoura</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Esta seção mostrará gráficos e métricas consolidadas do acompanhamento.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="safras">
          <Card>
            <CardHeader>
              <CardTitle>Safras em Acompanhamento</CardTitle>
              <CardDescription>Todas as safras sendo monitoradas</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Lista de safras será exibida aqui.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fotos">
          <Card>
            <CardHeader>
              <CardTitle>Galeria de Fotos</CardTitle>
              <CardDescription>Histórico fotográfico da lavoura</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Galeria de fotos será exibida aqui.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recomendacoes">
          <Card>
            <CardHeader>
              <CardTitle>Recomendações Recebidas</CardTitle>
              <CardDescription>Orientações técnicas do agrônomo</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Lista de recomendações será exibida aqui.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evolucao">
          <Card>
            <CardHeader>
              <CardTitle>Linha do Tempo</CardTitle>
              <CardDescription>Evolução temporal do acompanhamento</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Timeline de eventos será exibida aqui.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relatorios">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios de Consultoria</CardTitle>
              <CardDescription>Documentos e análises geradas</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Relatórios disponíveis para download.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Consultoria;
