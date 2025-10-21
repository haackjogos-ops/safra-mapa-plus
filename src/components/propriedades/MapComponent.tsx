import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MapComponentProps {
  properties: any[];
  plantingAreas: any[];
  onAreaClick?: (area: any) => void;
  onDrawComplete?: (polygon: google.maps.Polygon) => void;
  drawingMode?: boolean;
}

const MapComponent = ({ 
  properties, 
  plantingAreas, 
  onAreaClick,
  onDrawComplete,
  drawingMode = false 
}: MapComponentProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(null);
  const [polygons, setPolygons] = useState<google.maps.Polygon[]>([]);
  const [apiKeyLoaded, setApiKeyLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadApiKey();
  }, []);

  useEffect(() => {
    if (apiKeyLoaded && !map) {
      initializeMap();
    }
  }, [apiKeyLoaded]);

  useEffect(() => {
    if (map && drawingManager) {
      drawingManager.setDrawingMode(
        drawingMode ? google.maps.drawing.OverlayType.POLYGON : null
      );
    }
  }, [drawingMode, map, drawingManager]);

  useEffect(() => {
    if (map) {
      renderPlantingAreas();
    }
  }, [map, plantingAreas]);

  const loadApiKey = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-maps-key');
      
      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar o Google Maps.",
          variant: "destructive"
        });
        return;
      }

      // Carregar script do Google Maps
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&libraries=drawing,places,geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => setApiKeyLoaded(true);
      script.onerror = () => {
        toast({
          title: "Erro",
          description: "Erro ao carregar Google Maps.",
          variant: "destructive"
        });
      };
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    } catch (error) {
      console.error("Erro ao buscar API key:", error);
    }
  };

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    const centerLat = properties.length > 0 ? properties[0].latitude : -29.6883;
    const centerLng = properties.length > 0 ? properties[0].longitude : -51.1281;

    const mapInstance = new google.maps.Map(mapRef.current, {
      center: { lat: centerLat, lng: centerLng },
      zoom: 14,
      mapTypeId: google.maps.MapTypeId.SATELLITE,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
    });

    setMap(mapInstance);

    // Configurar Drawing Manager
    const drawingManagerInstance = new google.maps.drawing.DrawingManager({
      drawingMode: null,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [
          google.maps.drawing.OverlayType.POLYGON,
        ],
      },
      polygonOptions: {
        fillColor: '#22c55e',
        fillOpacity: 0.3,
        strokeWeight: 2,
        strokeColor: '#22c55e',
        clickable: true,
        editable: true,
        zIndex: 1,
      },
    });

    drawingManagerInstance.setMap(mapInstance);
    setDrawingManager(drawingManagerInstance);

    // Event listener para polígono completo
    google.maps.event.addListener(
      drawingManagerInstance,
      'polygoncomplete',
      (polygon: google.maps.Polygon) => {
        if (onDrawComplete) {
          onDrawComplete(polygon);
        }
        setPolygons(prev => [...prev, polygon]);
      }
    );

    // Adicionar marcadores das propriedades
    properties.forEach(property => {
      if (property.latitude && property.longitude) {
        new google.maps.Marker({
          position: { lat: property.latitude, lng: property.longitude },
          map: mapInstance,
          title: property.nome,
          icon: {
            url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
          }
        });
      }
    });
  };

  const renderPlantingAreas = () => {
    if (!map) return;

    // Limpar polígonos anteriores
    polygons.forEach(p => p.setMap(null));
    setPolygons([]);

    const newPolygons: google.maps.Polygon[] = [];

    plantingAreas.forEach(area => {
      try {
        const coords = typeof area.polygon_coords === 'string' 
          ? JSON.parse(area.polygon_coords) 
          : area.polygon_coords;

        const polygon = new google.maps.Polygon({
          paths: coords,
          strokeColor: area.cor || '#22c55e',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: area.cor || '#22c55e',
          fillOpacity: 0.35,
          clickable: true,
          map: map
        });

        // InfoWindow para mostrar informações
        const infoWindow = new google.maps.InfoWindow();
        
        polygon.addListener('click', (event: any) => {
          const content = `
            <div style="padding: 10px;">
              <h3 style="font-weight: bold; margin-bottom: 5px;">${area.nome}</h3>
              <p style="margin: 3px 0;"><strong>Cultura:</strong> ${area.cultura}</p>
              <p style="margin: 3px 0;"><strong>Área:</strong> ${area.area_hectares} ha</p>
              ${area.observacoes ? `<p style="margin: 3px 0;">${area.observacoes}</p>` : ''}
            </div>
          `;
          
          infoWindow.setContent(content);
          infoWindow.setPosition(event.latLng);
          infoWindow.open(map);
          
          if (onAreaClick) {
            onAreaClick(area);
          }
        });

        newPolygons.push(polygon);
      } catch (error) {
        console.error("Erro ao renderizar área:", error);
      }
    });

    setPolygons(newPolygons);
  };

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden border border-border shadow-lg">
      <div ref={mapRef} className="w-full h-full" />
      {!map && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <p className="text-muted-foreground">Carregando mapa...</p>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
