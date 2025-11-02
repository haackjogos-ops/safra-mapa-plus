import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/layout/Header';
import { Camera, ListTodo, Sprout, CloudRain, MessageSquare, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface DashboardAgricultorProps {
  onMenuClick?: () => void;
}

const DashboardAgricultor = ({ onMenuClick }: DashboardAgricultorProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    recomendacoesPendentes: 0,
    safrasAtivas: 0,
    fotosEnviadas: 0,
  });
  const [recomendacoesUrgentes, setRecomendacoesUrgentes] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Buscar estatísticas
      const { data: recomendacoes } = await supabase
        .from('recomendacoes')
        .select('*')
        .eq('agricultor_id', user?.id)
        .eq('status', 'pendente');

      const { data: safras } = await supabase
        .from('safras')
        .select('*');

      const { data: fotos } = await supabase
        .from('lavoura_fotos')
        .select('*')
        .eq('agricultor_id', user?.id);

      setStats({
        recomendacoesPendentes: recomendacoes?.length || 0,
        safrasAtivas: safras?.length || 0,
        fotosEnviadas: fotos?.length || 0,
      });

      // Buscar recomendações urgentes
      const { data: urgentes } = await supabase
        .from('recomendacoes')
        .select('*')
        .eq('agricultor_id', user?.id)
        .in('prioridade', ['urgente', 'alta'])
        .in('status', ['pendente', 'visualizada'])
        .order('data_recomendacao', { ascending: false })
        .limit(5);

      setRecomendacoesUrgentes(urgentes || []);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  };

  const getPrioridadeBadge = (prioridade: string) => {
    const colors: Record<string, string> = {
      urgente: 'bg-destructive text-destructive-foreground',
      alta: 'bg-orange-500 text-white',
      media: 'bg-yellow-500 text-white',
      baixa: 'bg-primary/10 text-primary',
    };
    return colors[prioridade] || colors.media;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Dashboard Agricultor" onMenuClick={onMenuClick} />
      
      <div className="p-4 md:p-6 space-y-6">
        {/* Cabeçalho de Boas-Vindas */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Olá! 👋
          </h1>
          <p className="text-muted-foreground">
            Gerencie sua lavoura de forma simples e prática
          </p>
        </div>

        {/* Cards Principais - Grid Responsivo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate('/minhas-fotos')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Enviar Foto</CardTitle>
              <Camera className="h-8 w-8 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.fotosEnviadas}</div>
              <p className="text-xs text-muted-foreground">Fotos enviadas</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate('/minhas-recomendacoes')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Recomendações</CardTitle>
              <ListTodo className="h-8 w-8 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recomendacoesPendentes}</div>
              <p className="text-xs text-muted-foreground">Pendentes</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate('/safras')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Minhas Safras</CardTitle>
              <Sprout className="h-8 w-8 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.safrasAtivas}</div>
              <p className="text-xs text-muted-foreground">Safras ativas</p>
            </CardContent>
          </Card>
        </div>

        {/* Seção: O que fazer hoje? */}
        {recomendacoesUrgentes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                O que fazer hoje?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recomendacoesUrgentes.map((rec) => (
                <div key={rec.id} className="p-4 border border-border rounded-lg space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getPrioridadeBadge(rec.prioridade)}>
                          {rec.prioridade.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(rec.data_recomendacao).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <h4 className="font-semibold text-foreground">{rec.titulo}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{rec.descricao}</p>
                      {rec.produto_recomendado && (
                        <p className="text-sm text-foreground mt-2">
                          <strong>Produto:</strong> {rec.produto_recomendado} - {rec.dosagem}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        supabase
                          .from('recomendacoes')
                          .update({ status: 'em_andamento' })
                          .eq('id', rec.id)
                          .then(() => {
                            toast({ title: 'Atividade iniciada!' });
                            fetchDashboardData();
                          });
                      }}
                    >
                      Iniciar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate('/minhas-recomendacoes')}
                    >
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Acesso Rápido ao Sistema Completo */}
        <Card>
          <CardHeader>
            <CardTitle>Precisa de mais recursos?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground mb-4">
              Acesse o sistema completo para gerenciar propriedades, insumos, equipamentos e mais.
            </p>
            <Button onClick={() => navigate('/dashboard')} className="w-full">
              Ir para Sistema Completo
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardAgricultor;
