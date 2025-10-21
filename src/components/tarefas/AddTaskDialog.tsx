import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AddTaskDialogProps {
  safras: any[];
  onTaskAdded: () => void;
}

const AddTaskDialog = ({ safras, onTaskAdded }: AddTaskDialogProps) => {
  const [open, setOpen] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("");
  const [prioridade, setPrioridade] = useState("");
  const [safraId, setSafraId] = useState("");
  const [dataPrevista, setDataPrevista] = useState<Date>();
  const [responsavel, setResponsavel] = useState("");
  const [checklistItems, setChecklistItems] = useState<string[]>([""]);
  const { toast } = useToast();

  const categorias = [
    "Irrigação",
    "Adubação",
    "Controle de Pragas",
    "Aplicação de Defensivos",
    "Colheita",
    "Plantio",
    "Manutenção",
    "Análise de Solo",
    "Outros"
  ];

  const handleAddChecklistItem = () => {
    setChecklistItems([...checklistItems, ""]);
  };

  const handleRemoveChecklistItem = (index: number) => {
    setChecklistItems(checklistItems.filter((_, i) => i !== index));
  };

  const handleChecklistItemChange = (index: number, value: string) => {
    const newItems = [...checklistItems];
    newItems[index] = value;
    setChecklistItems(newItems);
  };

  const handleSubmit = async () => {
    if (!titulo || !categoria || !prioridade || !dataPrevista) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Inserir tarefa
      const { data: taskData, error: taskError } = await supabase
        .from("tasks")
        .insert({
          titulo,
          descricao,
          categoria,
          prioridade,
          safra_id: safraId ? parseInt(safraId) : null,
          data_prevista: dataPrevista.toISOString(),
          responsavel: responsavel || null,
          status: "pendente"
        })
        .select()
        .single();

      if (taskError) throw taskError;

      // Inserir itens do checklist
      const validChecklistItems = checklistItems.filter(item => item.trim() !== "");
      if (validChecklistItems.length > 0) {
        const checklistData = validChecklistItems.map((item, index) => ({
          task_id: taskData.id,
          titulo: item,
          ordem: index
        }));

        const { error: checklistError } = await supabase
          .from("checklist_items")
          .insert(checklistData);

        if (checklistError) throw checklistError;
      }

      toast({
        title: "Tarefa criada",
        description: "Tarefa criada com sucesso!"
      });

      onTaskAdded();
      resetForm();
      setOpen(false);
    } catch (error) {
      console.error("Erro ao criar tarefa:", error);
      toast({
        title: "Erro",
        description: "Erro ao criar tarefa. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setTitulo("");
    setDescricao("");
    setCategoria("");
    setPrioridade("");
    setSafraId("");
    setDataPrevista(undefined);
    setResponsavel("");
    setChecklistItems([""]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Tarefa
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Nova Tarefa</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input
                placeholder="Ex: Irrigação da safra de soja"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Categoria *</Label>
              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              placeholder="Descreva os detalhes da tarefa..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Prioridade *</Label>
              <Select value={prioridade} onValueChange={setPrioridade}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Safra Relacionada</Label>
              <Select value={safraId} onValueChange={setSafraId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {safras.map((safra) => (
                    <SelectItem key={safra.id} value={safra.id.toString()}>
                      {safra.cultura} - {safra.area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data Prevista *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dataPrevista && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataPrevista ? format(dataPrevista, "dd/MM/yyyy") : "Selecione"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dataPrevista}
                    onSelect={setDataPrevista}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Responsável</Label>
              <Input
                placeholder="Nome do responsável"
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Checklist</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddChecklistItem}
              >
                <Plus className="h-3 w-3 mr-1" />
                Adicionar Item
              </Button>
            </div>
            <div className="space-y-2">
              {checklistItems.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Item ${index + 1}`}
                    value={item}
                    onChange={(e) => handleChecklistItemChange(index, e.target.value)}
                  />
                  {checklistItems.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveChecklistItem(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Button onClick={handleSubmit} className="w-full">
            Criar Tarefa
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddTaskDialog;
