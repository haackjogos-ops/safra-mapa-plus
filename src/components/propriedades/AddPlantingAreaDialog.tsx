import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";

interface AddPlantingAreaDialogProps {
  properties: any[];
  polygon: google.maps.Polygon | null;
  onAreaAdded: () => void;
  onClose: () => void;
  onOpenPropertyDialog: () => void;
}

const AddPlantingAreaDialog = ({ properties, polygon, onAreaAdded, onClose, onOpenPropertyDialog }: AddPlantingAreaDialogProps) => {
  const [open, setOpen] = useState(true);
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [nome, setNome] = useState("");
  const [cultura, setCultura] = useState("");
  const [areaHectares, setAreaHectares] = useState("");
  const [cor, setCor] = useState("#22c55e");
  const [observacoes, setObservacoes] = useState("");
  const { toast } = useToast();

  // Calcular área automaticamente ao abrir o dialog
  useEffect(() => {
    if (polygon && window.google) {
      const path = polygon.getPath();
      const areaMeters = window.google.maps.geometry.spherical.computeArea(path);
      const areaHa = (areaMeters / 10000).toFixed(2);
      setAreaHectares(areaHa);
    }
    
    // Selecionar a primeira propriedade por padrão
    if (properties.length > 0) {
      setSelectedPropertyId(properties[0].id);
    }
  }, [polygon, properties]);

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
    if (!nome || !cultura || !polygon || !selectedPropertyId) {
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

      const area = parseFloat(areaHectares);

      const { error } = await supabase
        .from("planting_areas")
        .insert({
          property_id: selectedPropertyId,
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
    setSelectedPropertyId("");
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
            <Label>Propriedade *</Label>
            <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a propriedade" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((prop) => (
                  <SelectItem key={prop.id} value={prop.id}>
                    {prop.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Nome do Talhão *</Label>
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
            <Label>Área (hectares) *</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="Calculado automaticamente"
              value={areaHectares}
              onChange={(e) => setAreaHectares(e.target.value)}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Área calculada automaticamente com base no desenho
            </p>
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
