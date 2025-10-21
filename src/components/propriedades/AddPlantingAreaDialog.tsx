import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AddPlantingAreaDialogProps {
  propertyId: string;
  polygon: google.maps.Polygon | null;
  onAreaAdded: () => void;
  onClose: () => void;
}

const AddPlantingAreaDialog = ({ propertyId, polygon, onAreaAdded, onClose }: AddPlantingAreaDialogProps) => {
  const [open, setOpen] = useState(!!polygon);
  const [nome, setNome] = useState("");
  const [cultura, setCultura] = useState("");
  const [areaHectares, setAreaHectares] = useState("");
  const [cor, setCor] = useState("#22c55e");
  const [observacoes, setObservacoes] = useState("");
  const { toast } = useToast();

  const culturas = ["Soja", "Milho", "Arroz", "Fumo", "Mandioca", "Banana"];
  
  const cores = [
    { valor: "#22c55e", nome: "Verde" },
    { valor: "#eab308", nome: "Amarelo" },
    { valor: "#ef4444", nome: "Vermelho" },
    { valor: "#3b82f6", nome: "Azul" },
    { valor: "#8b5cf6", nome: "Roxo" },
    { valor: "#ec4899", nome: "Rosa" }
  ];

  const handleSubmit = async () => {
    if (!nome || !cultura || !polygon) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    try {
      const path = polygon.getPath();
      const coords = [];
      
      for (let i = 0; i < path.getLength(); i++) {
        const point = path.getAt(i);
        coords.push({
          lat: point.lat(),
          lng: point.lng()
        });
      }

      // Calcular área aproximada se não fornecida
      let area = parseFloat(areaHectares);
      if (!area && window.google) {
        const areaMeters = window.google.maps.geometry.spherical.computeArea(path);
        area = areaMeters / 10000; // Converter para hectares
      }

      const { error } = await supabase
        .from("planting_areas")
        .insert({
          property_id: propertyId,
          nome,
          cultura,
          area_hectares: area,
          polygon_coords: coords,
          cor,
          observacoes: observacoes || null
        });

      if (error) throw error;

      toast({
        title: "Área cadastrada",
        description: "Área de plantio adicionada com sucesso!"
      });

      onAreaAdded();
      resetForm();
      setOpen(false);
      onClose();
    } catch (error) {
      console.error("Erro ao cadastrar área:", error);
      toast({
        title: "Erro",
        description: "Erro ao cadastrar área de plantio.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setNome("");
    setCultura("");
    setAreaHectares("");
    setCor("#22c55e");
    setObservacoes("");
  };

  const handleClose = () => {
    if (polygon) {
      polygon.setMap(null);
    }
    setOpen(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Área de Plantio</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nome da Área *</Label>
            <Input
              placeholder="Ex: Talhão Norte"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Cultura *</Label>
            <Select value={cultura} onValueChange={setCultura}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a cultura" />
              </SelectTrigger>
              <SelectContent>
                {culturas.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Área (hectares)</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="Calculado automaticamente"
              value={areaHectares}
              onChange={(e) => setAreaHectares(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Cor no Mapa *</Label>
            <Select value={cor} onValueChange={setCor}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cores.map((c) => (
                  <SelectItem key={c.valor} value={c.valor}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full border border-border" 
                        style={{ backgroundColor: c.valor }}
                      />
                      <span>{c.nome}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              placeholder="Informações adicionais sobre a área..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSubmit} className="flex-1">
              Salvar Área
            </Button>
            <Button onClick={handleClose} variant="outline">
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddPlantingAreaDialog;
