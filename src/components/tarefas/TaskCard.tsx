import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Calendar, User, CheckSquare, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ChecklistItem {
  id: string;
  titulo: string;
  concluido: boolean;
  ordem: number;
}

interface TaskCardProps {
  task: any;
  checklistItems: ChecklistItem[];
  safra?: any;
  onUpdate: () => void;
}

const TaskCard = ({ task, checklistItems, safra, onUpdate }: TaskCardProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const getPrioridadeColor = (prioridade: string) => {
    const colors = {
      baixa: "bg-primary/10 text-primary border-primary/20",
      media: "bg-accent/10 text-accent-foreground border-accent/20",
      alta: "bg-destructive/10 text-destructive border-destructive/20"
    };
    return colors[prioridade as keyof typeof colors] || colors.baixa;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pendente: "bg-secondary/10 text-secondary-foreground border-secondary/20",
      em_andamento: "bg-primary/10 text-primary border-primary/20",
      concluida: "bg-primary/10 text-primary border-primary/20",
      atrasada: "bg-destructive/10 text-destructive border-destructive/20"
    };
    return colors[status as keyof typeof colors] || colors.pendente;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pendente: "Pendente",
      em_andamento: "Em Andamento",
      concluida: "Concluída",
      atrasada: "Atrasada"
    };
    return labels[status as keyof typeof labels] || status;
  };

  const handleChecklistToggle = async (itemId: string, currentValue: boolean) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("checklist_items")
        .update({ concluido: !currentValue })
        .eq("id", itemId);

      if (error) throw error;

      // Verificar se todos os itens estão concluídos
      const updatedItems = checklistItems.map(item =>
        item.id === itemId ? { ...item, concluido: !currentValue } : item
      );
      
      const allCompleted = updatedItems.every(item => item.concluido);
      
      if (allCompleted && task.status !== "concluida") {
        await handleCompleteTask();
      }

      onUpdate();
    } catch (error) {
      console.error("Erro ao atualizar checklist:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar item do checklist.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCompleteTask = async () => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          status: "concluida",
          data_conclusao: new Date().toISOString()
        })
        .eq("id", task.id);

      if (error) throw error;

      toast({
        title: "Tarefa concluída",
        description: "Tarefa marcada como concluída!"
      });

      onUpdate();
    } catch (error) {
      console.error("Erro ao concluir tarefa:", error);
      toast({
        title: "Erro",
        description: "Erro ao concluir tarefa.",
        variant: "destructive"
      });
    }
  };

  const handleStartTask = async () => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ status: "em_andamento" })
        .eq("id", task.id);

      if (error) throw error;

      toast({
        title: "Tarefa iniciada",
        description: "Tarefa marcada como em andamento!"
      });

      onUpdate();
    } catch (error) {
      console.error("Erro ao iniciar tarefa:", error);
    }
  };

  const completedCount = checklistItems.filter(item => item.concluido).length;
  const totalCount = checklistItems.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const isOverdue = new Date(task.data_prevista) < new Date() && task.status !== "concluida";

  return (
    <Card className={`hover:shadow-lg transition-shadow duration-300 ${isOverdue ? 'border-destructive' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{task.titulo}</CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className={getPrioridadeColor(task.prioridade)}>
              {task.prioridade}
            </Badge>
            <Badge variant="outline" className={getStatusColor(task.status)}>
              {getStatusLabel(task.status)}
            </Badge>
          </div>
        </div>
        {task.descricao && (
          <p className="text-sm text-muted-foreground mt-2">{task.descricao}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Previsto: {format(new Date(task.data_prevista), "dd/MM/yyyy")}</span>
            {isOverdue && (
              <AlertCircle className="h-3 w-3 text-destructive ml-2" />
            )}
          </div>

          {task.responsavel && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-3 w-3" />
              <span>{task.responsavel}</span>
            </div>
          )}

          {safra && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {safra.cultura} - {safra.area}
              </Badge>
            </div>
          )}

          <div className="flex items-center gap-2 text-muted-foreground">
            <CheckSquare className="h-3 w-3" />
            <span>{task.categoria}</span>
          </div>
        </div>

        {checklistItems.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Checklist</span>
              <span className="text-sm text-muted-foreground">
                {completedCount}/{totalCount}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="space-y-2">
              {checklistItems.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={item.concluido}
                    onCheckedChange={() => handleChecklistToggle(item.id, item.concluido)}
                    disabled={isUpdating || task.status === "concluida"}
                  />
                  <span className={`text-sm ${item.concluido ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {item.titulo}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {task.status === "pendente" && (
          <Button
            variant="outline"
            className="w-full"
            size="sm"
            onClick={handleStartTask}
          >
            Iniciar Tarefa
          </Button>
        )}

        {task.status === "em_andamento" && totalCount === 0 && (
          <Button
            className="w-full"
            size="sm"
            onClick={handleCompleteTask}
          >
            Marcar como Concluída
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskCard;
