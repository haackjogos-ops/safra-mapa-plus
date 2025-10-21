import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import { Input } from "@/components/ui/input";
import { Search, Bell } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AddTaskDialog from "@/components/tarefas/AddTaskDialog";
import TaskCard from "@/components/tarefas/TaskCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Tarefas = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [checklistItems, setChecklistItems] = useState<any[]>([]);
  const [safras, setSafras] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
    
    // Atualizar status de tarefas atrasadas
    const updateOverdueTasks = async () => {
      try {
        await supabase.rpc('update_overdue_tasks');
        await loadTasks();
      } catch (error) {
        console.error("Erro ao atualizar tarefas atrasadas:", error);
      }
    };

    updateOverdueTasks();
    const interval = setInterval(updateOverdueTasks, 60000); // Verificar a cada minuto

    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    await Promise.all([loadTasks(), loadSafras()]);
    setLoading(false);
  };

  const loadTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("data_prevista", { ascending: true });

      if (error) throw error;

      setTasks(data || []);

      // Carregar checklist items
      const { data: checklistData, error: checklistError } = await supabase
        .from("checklist_items")
        .select("*")
        .order("ordem", { ascending: true });

      if (checklistError) throw checklistError;

      setChecklistItems(checklistData || []);
    } catch (error) {
      console.error("Erro ao carregar tarefas:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar tarefas.",
        variant: "destructive"
      });
    }
  };

  const loadSafras = async () => {
    // Como safras ainda não estão no banco, vamos usar dados locais
    // Quando safras forem migradas para o banco, substituir por query do Supabase
    setSafras([
      { id: 1, cultura: "Soja", area: "150 ha" },
      { id: 2, cultura: "Milho", area: "200 ha" },
      { id: 3, cultura: "Arroz", area: "80 ha" }
    ]);
  };

  const filteredTasks = tasks.filter(task =>
    task.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTasksByCriteria = (criteria: string) => {
    switch (criteria) {
      case "pendentes":
        return filteredTasks.filter(t => t.status === "pendente");
      case "em_andamento":
        return filteredTasks.filter(t => t.status === "em_andamento");
      case "concluidas":
        return filteredTasks.filter(t => t.status === "concluida");
      case "atrasadas":
        return filteredTasks.filter(t => t.status === "atrasada");
      default:
        return filteredTasks;
    }
  };

  const getTaskChecklistItems = (taskId: string) => {
    return checklistItems.filter(item => item.task_id === taskId);
  };

  const getTaskSafra = (safraId: number | null) => {
    if (!safraId) return undefined;
    return safras.find(s => s.id === safraId);
  };

  const stats = {
    total: tasks.length,
    pendentes: tasks.filter(t => t.status === "pendente").length,
    em_andamento: tasks.filter(t => t.status === "em_andamento").length,
    atrasadas: tasks.filter(t => t.status === "atrasada").length,
    concluidas: tasks.filter(t => t.status === "concluida").length
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header title="Tarefas" subtitle="Gerenciamento de atividades agrícolas" />
        <div className="p-6">
          <p className="text-center text-muted-foreground">Carregando tarefas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header title="Tarefas" subtitle="Gerenciamento de atividades agrícolas" />
      
      <div className="p-6 space-y-6">
        {/* Search and Add */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar tarefa..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <AddTaskDialog safras={safras} onTaskAdded={loadTasks} />
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-secondary">{stats.pendentes}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Em Andamento</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">{stats.em_andamento}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Atrasadas</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <p className="text-2xl font-bold text-destructive">{stats.atrasadas}</p>
              {stats.atrasadas > 0 && <Bell className="h-4 w-4 text-destructive" />}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Concluídas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">{stats.concluidas}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tasks by Status */}
        <Tabs defaultValue="todas" className="space-y-4">
          <TabsList>
            <TabsTrigger value="todas">
              Todas ({stats.total})
            </TabsTrigger>
            <TabsTrigger value="pendentes">
              Pendentes ({stats.pendentes})
            </TabsTrigger>
            <TabsTrigger value="em_andamento">
              Em Andamento ({stats.em_andamento})
            </TabsTrigger>
            <TabsTrigger value="atrasadas">
              Atrasadas ({stats.atrasadas})
              {stats.atrasadas > 0 && (
                <Badge variant="destructive" className="ml-2">!</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="concluidas">
              Concluídas ({stats.concluidas})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="todas" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {getTasksByCriteria("todas").map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  checklistItems={getTaskChecklistItems(task.id)}
                  safra={getTaskSafra(task.safra_id)}
                  onUpdate={loadTasks}
                />
              ))}
            </div>
            {getTasksByCriteria("todas").length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma tarefa encontrada. Crie sua primeira tarefa!
              </p>
            )}
          </TabsContent>

          <TabsContent value="pendentes" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {getTasksByCriteria("pendentes").map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  checklistItems={getTaskChecklistItems(task.id)}
                  safra={getTaskSafra(task.safra_id)}
                  onUpdate={loadTasks}
                />
              ))}
            </div>
            {getTasksByCriteria("pendentes").length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma tarefa pendente.
              </p>
            )}
          </TabsContent>

          <TabsContent value="em_andamento" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {getTasksByCriteria("em_andamento").map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  checklistItems={getTaskChecklistItems(task.id)}
                  safra={getTaskSafra(task.safra_id)}
                  onUpdate={loadTasks}
                />
              ))}
            </div>
            {getTasksByCriteria("em_andamento").length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma tarefa em andamento.
              </p>
            )}
          </TabsContent>

          <TabsContent value="atrasadas" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {getTasksByCriteria("atrasadas").map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  checklistItems={getTaskChecklistItems(task.id)}
                  safra={getTaskSafra(task.safra_id)}
                  onUpdate={loadTasks}
                />
              ))}
            </div>
            {getTasksByCriteria("atrasadas").length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma tarefa atrasada. Ótimo trabalho!
              </p>
            )}
          </TabsContent>

          <TabsContent value="concluidas" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {getTasksByCriteria("concluidas").map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  checklistItems={getTaskChecklistItems(task.id)}
                  safra={getTaskSafra(task.safra_id)}
                  onUpdate={loadTasks}
                />
              ))}
            </div>
            {getTasksByCriteria("concluidas").length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma tarefa concluída ainda.
              </p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Tarefas;
