import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface AddSafraDialogProps {
  onAdd: (safra: any) => void;
}

const AddSafraDialog = ({ onAdd }: AddSafraDialogProps) => {
  const [open, setOpen] = useState(false);
  const [cultura, setCultura] = useState("");
  const [variedade, setVariedade] = useState("");
  const [area, setArea] = useState("");
  const [dataPlantio, setDataPlantio] = useState<Date>();
  const [irrigacao, setIrrigacao] = useState("");
  const { toast } = useToast();

  const culturas = [
    { value: "Soja", icon: "🌱" },
    { value: "Milho", icon: "🌽" },
    { value: "Arroz", icon: "🌾" },
    { value: "Fumo", icon: "🍃" },
    { value: "Mandioca", icon: "🥔" },
    { value: "Banana", icon: "🍌" }
  ];

  const irrigacaoOptions = [
    "Sistema pivô central",
    "Gotejamento",
    "Inundação",
    "Aspersão",
    "Sequeiro"
  ];

  const handleSubmit = () => {
    if (!cultura || !variedade || !area || !dataPlantio || !irrigacao) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    const ciclos: Record<string, number> = {
      "Soja": 120,
      "Milho": 120,
      "Arroz": 120,
      "Fumo": 180,
      "Mandioca": 365,
      "Banana": 365
    };

    const previsaoColheita = new Date(dataPlantio);
    previsaoColheita.setDate(previsaoColheita.getDate() + (ciclos[cultura] || 120));

    onAdd({
      cultura,
      variedade,
      area,
      dataPlantio: format(dataPlantio, "dd/MM/yyyy"),
      previsaoColheita: format(previsaoColheita, "dd/MM/yyyy"),
      irrigacao,
      fase: "Estabelecimento",
      progresso: 10
    });

    toast({
      title: "Safra cadastrada",
      description: `${cultura} cadastrada com sucesso!`
    });

    setOpen(false);
    setCultura("");
    setVariedade("");
    setArea("");
    setDataPlantio(undefined);
    setIrrigacao("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Safra
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cadastrar Nova Safra</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Cultura</Label>
            <Select value={cultura} onValueChange={setCultura}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a cultura" />
              </SelectTrigger>
              <SelectContent>
                {culturas.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    <span className="flex items-center gap-2">
                      <span>{c.icon}</span>
                      <span>{c.value}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Variedade</Label>
            <Input
              placeholder="Ex: TMG 7062"
              value={variedade}
              onChange={(e) => setVariedade(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Área (hectares)</Label>
            <Input
              placeholder="Ex: 150"
              value={area}
              onChange={(e) => setArea(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Data de Plantio</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dataPlantio && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dataPlantio ? format(dataPlantio, "dd/MM/yyyy") : "Selecione a data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dataPlantio}
                  onSelect={setDataPlantio}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Sistema de Irrigação</Label>
            <Select value={irrigacao} onValueChange={setIrrigacao}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o sistema" />
              </SelectTrigger>
              <SelectContent>
                {irrigacaoOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSubmit} className="w-full">
            Cadastrar Safra
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddSafraDialog;
