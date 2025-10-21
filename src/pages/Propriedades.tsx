import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Plus, Search } from "lucide-react";
import { useState } from "react";

const Propriedades = () => {
  const [mapApiKey, setMapApiKey] = useState("");
  const [showMap, setShowMap] = useState(false);

  const propriedades = [
    { id: 1, nome: "Fazenda São João", area: "500 ha", localizacao: "São Paulo, SP", culturas: 4 },
    { id: 2, nome: "Sítio Vale Verde", area: "150 ha", localizacao: "Paraná, PR", culturas: 2 },
    { id: 3, nome: "Chácara Bela Vista", area: "80 ha", localizacao: "Minas Gerais, MG", culturas: 3 },
  ];

  const handleLoadMap = () => {
    if (mapApiKey.trim()) {
      setShowMap(true);
    }
  };

  return (
    <div className="min-h-screen">
      <Header 
        title="Propriedades" 
        subtitle="Gerencie suas propriedades e áreas de cultivo"
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
            />
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Propriedade
          </Button>
        </div>

        {/* Map Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Mapa de Propriedades
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showMap ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Para visualizar o mapa interativo das suas propriedades, insira sua chave de API do Google Maps:
                </p>
                <div className="flex gap-3">
                  <Input
                    type="text"
                    placeholder="Cole aqui sua API Key do Google Maps"
                    value={mapApiKey}
                    onChange={(e) => setMapApiKey(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleLoadMap}>Carregar Mapa</Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Obtenha sua chave em:{" "}
                  <a 
                    href="https://developers.google.com/maps/documentation/javascript/get-api-key" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Google Maps Platform
                  </a>
                </p>
              </div>
            ) : (
              <div className="h-[400px] rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <MapPin className="h-12 w-12 mx-auto text-primary" />
                  <p className="text-sm font-medium">Mapa será carregado aqui</p>
                  <p className="text-xs text-muted-foreground">Com integração do Google Maps</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Properties List */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Suas Propriedades</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {propriedades.map((prop) => (
              <Card key={prop.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-lg">{prop.nome}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Área Total:</span>
                    <span className="font-semibold text-foreground">{prop.area}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Localização:</span>
                    <span className="font-medium text-foreground">{prop.localizacao}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Culturas:</span>
                    <span className="font-medium text-primary">{prop.culturas} ativas</span>
                  </div>
                  <div className="pt-3 border-t border-border">
                    <Button variant="outline" className="w-full" size="sm">
                      Ver Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Propriedades;
