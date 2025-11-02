import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/layout/Header';
import { ListTodo, CheckCircle2, Clock, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MinhasRecomendacoesProps {
  onMenuClick?: () => void;
}

const MinhasRecomendacoes = ({ onMenuClick }: MinhasRecomendacoesProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [recomendacoes, setRecomendacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchRecomendacoes();
    }
  }, [user]);

  const fetchRecomendacoes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('recomendacoes')
        .select('*')
        .eq('agricultor_id', user?.id)
        .order('data_recomendacao', { ascending: false });

      if (error) throw error;
      setRecomendacoes(data || []);
    } catch (error) {
      console.error('Erro ao buscar recomendações:', error);
      toast({
        title: 'Erro ao carregar recomendações',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      if (newStatus === 'concluida') {
        updateData.data_conclusao = new Date().toISOString();
      }

      const { error } = await supabase
        .from('recomendacoes')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Status atualizado!',
        description: `Recomendação marcada como ${newStatus}`,
      });
      fetchRecomendacoes();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: 'Erro ao atualizar',
        variant: 'destructive',
      });
    }
  };

  const getPrioridadeBadge = (prioridade: string) => {
    const config: Record<string, { className: string; label: string }> = {
      urgente: { className: 'bg-destructive text-destructive-foreground', label: '🔴 Urgente' },
      alta: { className: 'bg-orange-500 text-white', label: '🟠 Alta' },
      media: { className: 'bg-yellow-500 text-white', label: '🟡 Média' },
      baixa: { className: 'bg-primary/10 text-primary', label: '🟢 Baixa' },
    };
    return config[prioridade] || config.media;
  };

  const getTipoIcon = (tipo: string) => {
    const icons: Record<string, string> = {
      aplicacao_defensivo: '🛡️',
      adubacao: '🌱',
      irrigacao: '💧',
      colheita: '🌾',
      plantio: '🌱',
      poda: '✂️',
      analise_solo: '🔬',
      outro: '📋',
    };
    return icons[tipo] || '📋';
  };

  const filterByStatus = (status: string[]) => {
    return recomendacoes.filter((rec) => status.includes(rec.status));
  };

  const RecommendationCard = ({ rec }: { rec: any }) => (
    <Card key={rec.id} className="mb-4">
      <CardContent className="pt-6 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-2xl">{getTipoIcon(rec.tipo)}</span>
              <Badge className={getPrioridadeBadge(rec.prioridade).className}>
                {getPrioridadeBadge(rec.prioridade).label}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {new Date(rec.data_recomendacao).toLocaleDateString('pt-BR')}
              </span>
            </div>
            <h3 className="font-semibold text-lg text-foreground">{rec.titulo}</h3>
            <p className="text-sm text-muted-foreground">{rec.descricao}</p>
            
            {rec.produto_recomendado && (
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm">
                  <strong>Produto:</strong> {rec.produto_recomendado}
                </p>
                {rec.dosagem && (
                  <p className="text-sm">
                    <strong>Dosagem:</strong> {rec.dosagem}
                  </p>
                )}
                {rec.area_aplicacao && (
                  <p className="text-sm">
                    <strong>Área:</strong> {rec.area_aplicacao}
                  </p>
                )}
              </div>
            )}

            {rec.data_prevista_execucao && (
              <p className="text-sm text-muted-foreground">
                <strong>Prazo:</strong> {new Date(rec.data_prevista_execucao).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {rec.status === 'pendente' && (
            <Button
              size="sm"
              onClick={() => handleStatusUpdate(rec.id, 'em_andamento')}
            >
              <Clock className="mr-2 h-4 w-4" />
              Iniciar
            </Button>
          )}
          {(rec.status === 'pendente' || rec.status === 'em_andamento') && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusUpdate(rec.id, 'concluida')}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Concluir
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header title="Minhas Recomendações" onMenuClick={onMenuClick} />
      
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Minhas Recomendações</h1>
          <ListTodo className="h-8 w-8 text-primary" />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="pendentes" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pendentes">
                Pendentes ({filterByStatus(['pendente', 'visualizada']).length})
              </TabsTrigger>
              <TabsTrigger value="em-andamento">
                Em Andamento ({filterByStatus(['em_andamento']).length})
              </TabsTrigger>
              <TabsTrigger value="concluidas">
                Concluídas ({filterByStatus(['concluida']).length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pendentes" className="mt-6">
              {filterByStatus(['pendente', 'visualizada']).length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <ListTodo className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma recomendação pendente</p>
                  </CardContent>
                </Card>
              ) : (
                filterByStatus(['pendente', 'visualizada']).map((rec) => (
                  <RecommendationCard key={rec.id} rec={rec} />
                ))
              )}
            </TabsContent>

            <TabsContent value="em-andamento" className="mt-6">
              {filterByStatus(['em_andamento']).length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma atividade em andamento</p>
                  </CardContent>
                </Card>
              ) : (
                filterByStatus(['em_andamento']).map((rec) => (
                  <RecommendationCard key={rec.id} rec={rec} />
                ))
              )}
            </TabsContent>

            <TabsContent value="concluidas" className="mt-6">
              {filterByStatus(['concluida']).length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma recomendação concluída</p>
                  </CardContent>
                </Card>
              ) : (
                filterByStatus(['concluida']).map((rec) => (
                  <Card key={rec.id} className="mb-4 opacity-75">
                    <CardContent className="pt-6 space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <h3 className="font-semibold text-foreground">{rec.titulo}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Concluída em: {new Date(rec.data_conclusao).toLocaleDateString('pt-BR')}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default MinhasRecomendacoes;
