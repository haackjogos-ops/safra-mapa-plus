import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Maximize2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MapAreaSelectorProps {
  plantingAreas: any[];
  selectedArea: string;
  onAreaSelect: (areaId: string) => void;
}

const MapAreaSelector = ({ plantingAreas, selectedArea, onAreaSelect }: MapAreaSelectorProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const polygonsRef = useRef<google.maps.Polygon[]>([]);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [apiKeyLoaded, setApiKeyLoaded] = useState(false);

  useEffect(() => {
    loadApiKey();
  }, []);

  useEffect(() => {
    if (apiKeyLoaded && mapRef.current && !mapInstanceRef.current) {
      initializeMap();
    }
  }, [apiKeyLoaded]);

  useEffect(() => {
    if (mapInstanceRef.current && plantingAreas.length > 0) {
      loadPlantingAreas(mapInstanceRef.current);
    }
  }, [plantingAreas, apiKeyLoaded]);

  useEffect(() => {
    // Highlight selected area
    polygonsRef.current.forEach(polygon => {
      const areaId = polygon.get("areaId");
      if (areaId === selectedArea) {
        polygon.setOptions({
          strokeWeight: 4,
          strokeOpacity: 1,
          fillOpacity: 0.5,
        });
      } else {
        polygon.setOptions({
          strokeWeight: 2,
          strokeOpacity: 0.8,
          fillOpacity: 0.3,
        });
      }
    });
  }, [selectedArea]);

  const loadApiKey = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-maps-key');
      
      if (error || !data?.apiKey) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar o Google Maps.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Carregar script do Google Maps
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setApiKeyLoaded(true);
        setIsLoading(false);
      };
      script.onerror = () => {
        toast({
          title: "Erro",
          description: "Erro ao carregar Google Maps.",
          variant: "destructive"
        });
        setIsLoading(false);
      };
      document.head.appendChild(script);
    } catch (error) {
      console.error("Erro ao carregar API key:", error);
      setIsLoading(false);
    }
  };

  const initializeMap = () => {
    if (!mapRef.current) return;

    const map = new google.maps.Map(mapRef.current, {
      center: { lat: -23.5505, lng: -46.6333 }, // Default: São Paulo
      zoom: 12,
      mapTypeId: google.maps.MapTypeId.SATELLITE,
      mapTypeControl: true,
      streetViewControl: false,
    });

    mapInstanceRef.current = map;
    
    // Load planting areas as polygons
    if (plantingAreas.length > 0) {
      loadPlantingAreas(map);
    }
  };

  const loadPlantingAreas = (map: google.maps.Map) => {
    // Clear existing polygons
    polygonsRef.current.forEach(polygon => polygon.setMap(null));
    polygonsRef.current = [];

    const bounds = new google.maps.LatLngBounds();

    plantingAreas.forEach(area => {
      if (!area.polygon_coords || !area.polygon_coords.coordinates) return;

      const coordinates = area.polygon_coords.coordinates[0].map((coord: number[]) => ({
        lat: coord[1],
        lng: coord[0]
      }));

      const polygon = new google.maps.Polygon({
        paths: coordinates,
        strokeColor: area.cor || "#22c55e",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: area.cor || "#22c55e",
        fillOpacity: 0.3,
        map: map,
        clickable: true,
      });

      polygon.set("areaId", area.id);
      polygon.set("areaName", area.nome);

      // Add click listener
      polygon.addListener("click", () => {
        onAreaSelect(area.id);
        toast({
          title: "Área Selecionada",
          description: `${area.nome} - ${area.cultura} (${area.area_hectares} ha)`,
        });
      });

      // Add info window on hover
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 4px 0; font-weight: bold;">${area.nome}</h3>
            <p style="margin: 0; font-size: 12px;">${area.cultura}</p>
            <p style="margin: 0; font-size: 12px;">${area.area_hectares} hectares</p>
          </div>
        `
      });

      polygon.addListener("mouseover", (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          infoWindow.setPosition(event.latLng);
          infoWindow.open(map);
        }
      });

      polygon.addListener("mouseout", () => {
        infoWindow.close();
      });

      polygonsRef.current.push(polygon);

      // Extend bounds
      coordinates.forEach(coord => bounds.extend(coord));
    });

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds);
    }
  };

  const centerOnSelectedArea = () => {
    if (!mapInstanceRef.current || !selectedArea) return;

    const area = plantingAreas.find(a => a.id === selectedArea);
    if (!area || !area.polygon_coords?.coordinates) return;

    const coordinates = area.polygon_coords.coordinates[0].map((coord: number[]) => ({
      lat: coord[1],
      lng: coord[0]
    }));

    const bounds = new google.maps.LatLngBounds();
    coordinates.forEach((coord: any) => bounds.extend(coord));
    mapInstanceRef.current.fitBounds(bounds);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Mapa de Talhões
          </CardTitle>
          {selectedArea && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={centerOnSelectedArea}
            >
              <Maximize2 className="h-4 w-4 mr-2" />
              Centralizar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div 
          ref={mapRef} 
          className="w-full h-[400px] rounded-lg overflow-hidden relative"
          style={{ minHeight: "400px" }}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="text-center space-y-2">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="text-sm text-muted-foreground">Carregando mapa...</p>
              </div>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Clique em um talhão no mapa para selecioná-lo
        </p>
      </CardContent>
    </Card>
  );
};

export default MapAreaSelector;
