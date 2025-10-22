import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Plus, Search, Edit, Map } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import MapComponent from "@/components/propriedades/MapComponent";
import AddPlantingAreaDialog from "@/components/propriedades/AddPlantingAreaDialog";
import DeletePropertyButton from "@/components/propriedades/DeletePropertyButton";

interface PropriedadesProps {
  onMenuClick?: () => void;
}

const Propriedades = ({ onMenuClick }: PropriedadesProps) => {
  const [properties, setProperties] = useState<any[]>([]);
  const [plantingAreas, setPlantingAreas] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [drawingMode, setDrawingMode] = useState(false);
  const [currentPolygon, setCurrentPolygon] = useState<google.maps.Polygon | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([loadProperties(), loadPlantingAreas()]);
  };

  const loadProperties = async () => {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("nome");

      if (error) throw error;
      setProperties(data || []);
      
      if (data && data.length > 0) {
        setSelectedProperty(data[0].id);
      }
    } catch (error) {
      console.error("Erro ao carregar propriedades:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar propriedades.",
        variant: "destructive"
      });
    }
  };

  const loadPlantingAreas = async () => {
    try {
      const { data, error } = await supabase
        .from("planting_areas")
        .select("*");

      if (error) throw error;
      setPlantingAreas(data || []);
    } catch (error) {
      console.error("Erro ao carregar áreas:", error);
    }
  };

  const filteredProperties = properties.filter(p =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDrawComplete = (polygon: google.maps.Polygon) => {
    setCurrentPolygon(polygon);
    setDrawingMode(false);
  };

  const handleAreaAdded = () => {
    setCurrentPolygon(null);
    loadPlantingAreas();
  };

  return (
    <div className="min-h-screen">
      <Header 
        title="Mapas" 
        subtitle="Mapeamento de áreas e talhões"
        onMenuClick={onMenuClick}
      />
      
      <div className="p-6 space-y-6">
        {/* Search and Add */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar propriedade..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant={drawingMode ? "default" : "outline"}
              onClick={() => setDrawingMode(!drawingMode)}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              {drawingMode ? "Cancelar Desenho" : "Desenhar Área"}
            </Button>
          </div>
        </div>

        {/* Map Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5" />
              Mapa de Propriedades e Áreas de Plantio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MapComponent
              properties={properties}
              plantingAreas={plantingAreas}
              drawingMode={drawingMode}
              onDrawComplete={handleDrawComplete}
            />
          </CardContent>
        </Card>

        {/* Properties List */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Suas Propriedades</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProperties.map((prop) => {
              const areas = plantingAreas.filter(a => a.property_id === prop.id);
              const totalAreaPlantio = areas.reduce((sum, a) => sum + parseFloat(a.area_hectares || 0), 0);

              return (
                <Card key={prop.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{prop.nome}</CardTitle>
                        {prop.endereco && (
                          <p className="text-sm text-muted-foreground mt-1">{prop.endereco}</p>
                        )}
                      </div>
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Área Total:</span>
                      <span className="font-semibold text-foreground">{prop.area_total} ha</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Áreas de Plantio:</span>
                      <span className="font-medium text-primary">{areas.length} áreas</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Área Cultivada:</span>
                      <span className="font-medium text-foreground">{totalAreaPlantio.toFixed(1)} ha</span>
                    </div>
                    {prop.observacoes && (
                      <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                        {prop.observacoes}
                      </p>
                    )}
                    
                    <div className="pt-3 border-t border-border">
                      <DeletePropertyButton
                        property={prop}
                        plantingAreasCount={areas.length}
                        onDeleted={loadData}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {filteredProperties.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="py-12">
                  <div className="text-center space-y-2">
                    <MapPin className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">Nenhuma propriedade encontrada.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Planting Areas List */}
        {plantingAreas.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Áreas de Plantio</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {plantingAreas.map((area) => (
                <Card key={area.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full border border-border" 
                        style={{ backgroundColor: area.cor }}
                      />
                      {area.nome}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Cultura:</span>
                      <span className="font-semibold text-foreground">{area.cultura}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Área:</span>
                      <span className="font-medium text-primary">{parseFloat(area.area_hectares || 0).toFixed(2)} ha</span>
                    </div>
                    {area.observacoes && (
                      <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                        {area.observacoes}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Dialog para adicionar área */}
      {currentPolygon && (
        <AddPlantingAreaDialog
          properties={properties}
          polygon={currentPolygon}
          onAreaAdded={handleAreaAdded}
          onClose={() => setCurrentPolygon(null)}
        />
      )}
    </div>
  );
};

export default Propriedades;
