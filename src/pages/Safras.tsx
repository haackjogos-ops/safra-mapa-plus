import { useState } from "react";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, Droplets } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import AddSafraDialog from "@/components/safras/AddSafraDialog";
import SafraCalendar from "@/components/safras/SafraCalendar";
import HealthAnalysis from "@/components/safras/HealthAnalysis";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface SafrasProps {
  onMenuClick?: () => void;
}

const Safras = ({ onMenuClick }: SafrasProps) => {
  const [safras, setSafras] = useState([
    {
      id: 1,
      cultura: "Soja",
      variedade: "TMG 7062",
      area: "150 ha",
      dataPlantio: "15/10/2024",
      previsaoColheita: "15/02/2025",
      fase: "Desenvolvimento Vegetativo",
      progresso: 45,
      irrigacao: "Sistema pivô central",
      proximaAtividade: "Aplicação herbicida"
    },
    {
      id: 2,
      cultura: "Milho",
      variedade: "Pioneer 30F53",
      area: "200 ha",
      dataPlantio: "20/09/2024",
      previsaoColheita: "20/01/2025",
      fase: "Floração",
      progresso: 65,
      irrigacao: "Gotejamento",
      proximaAtividade: "Adubação de cobertura"
    },
    {
      id: 3,
      cultura: "Arroz",
      variedade: "IRGA 424",
      area: "80 ha",
      dataPlantio: "01/11/2024",
      previsaoColheita: "01/03/2025",
      fase: "Estabelecimento",
      progresso: 25,
      irrigacao: "Inundação",
      proximaAtividade: "Controle de plantas daninhas"
    },
  ]);

  const [selectedSafra, setSelectedSafra] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleAddSafra = (novaSafra: any) => {
    const newId = safras.length > 0 ? Math.max(...safras.map(s => s.id)) + 1 : 1;
    setSafras([...safras, { 
      id: newId, 
      ...novaSafra,
      proximaAtividade: "Monitoramento inicial"
    }]);
  };

  const filteredSafras = safras.filter(safra =>
    safra.cultura.toLowerCase().includes(searchTerm.toLowerCase()) ||
    safra.variedade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCulturaIcon = (cultura: string) => {
    const icons: Record<string, string> = {
      "Soja": "🌱",
      "Milho": "🌽",
      "Arroz": "🌾",
      "Fumo": "🍃",
      "Mandioca": "🥔",
      "Banana": "🍌"
    };
    return icons[cultura] || "🌿";
  };

  return (
    <div className="min-h-screen">
      <Header 
        title="Safras" 
        subtitle="Cadastro e monitoramento de culturas"
        onMenuClick={onMenuClick}
      />
      
      <div className="p-6 space-y-6">
        {/* Search and Add */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar safra..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <AddSafraDialog onAdd={handleAddSafra} />
        </div>

        {/* Calendário e Análises */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SafraCalendar safras={safras} />
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Resumo Rápido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total de Safras</span>
                  <span className="text-2xl font-bold text-primary">{safras.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Culturas Ativas</span>
                  <span className="text-2xl font-bold text-secondary">{new Set(safras.map(s => s.cultura)).size}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Área Total</span>
                  <span className="text-2xl font-bold text-accent">430 ha</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Safras Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSafras.map((safra) => (
            <Card key={safra.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{getCulturaIcon(safra.cultura)}</span>
                    <div>
                      <CardTitle className="text-lg">{safra.cultura}</CardTitle>
                      <p className="text-sm text-muted-foreground">{safra.variedade}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    {safra.area}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Plantio:
                    </span>
                    <span className="font-medium text-foreground">{safra.dataPlantio}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Colheita:
                    </span>
                    <span className="font-medium text-foreground">{safra.previsaoColheita}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Droplets className="h-3 w-3" />
                      Irrigação:
                    </span>
                    <span className="font-medium text-foreground">{safra.irrigacao}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border">
                  <Badge className="mb-2 bg-secondary/10 text-secondary-foreground border-secondary/20">
                    {safra.fase}
                  </Badge>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">Progresso</span>
                      <span className="text-sm font-bold text-primary">{safra.progresso}%</span>
                    </div>
                    <Progress value={safra.progresso} className="h-2" />
                  </div>
                </div>

                <div className="pt-3 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Próxima Atividade:</p>
                  <p className="text-sm font-medium text-foreground">{safra.proximaAtividade}</p>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="sm"
                  onClick={() => setSelectedSafra(safra)}
                >
                  Ver Detalhes
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Área Total Cultivada</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">430 ha</p>
              <p className="text-sm text-muted-foreground mt-1">Distribuídos em 3 culturas ativas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Produtividade Esperada</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-secondary">1.850 t</p>
              <p className="text-sm text-muted-foreground mt-1">Baseado nas condições atuais</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Investimento Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-accent">R$ 1.2M</p>
              <p className="text-sm text-muted-foreground mt-1">Insumos e mão de obra</p>
            </CardContent>
          </Card>
        </div>

        {/* Dialog de Detalhes */}
        <Dialog open={!!selectedSafra} onOpenChange={() => setSelectedSafra(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="text-3xl">{selectedSafra && getCulturaIcon(selectedSafra.cultura)}</span>
                <span>{selectedSafra?.cultura} - {selectedSafra?.variedade}</span>
              </DialogTitle>
            </DialogHeader>
            {selectedSafra && (
              <div className="space-y-4 py-4">
                <HealthAnalysis safra={selectedSafra} />
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Informações da Safra</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Área</p>
                        <p className="font-semibold text-foreground">{selectedSafra.area}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Fase</p>
                        <p className="font-semibold text-foreground">{selectedSafra.fase}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Data de Plantio</p>
                        <p className="font-semibold text-foreground">{selectedSafra.dataPlantio}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Previsão Colheita</p>
                        <p className="font-semibold text-foreground">{selectedSafra.previsaoColheita}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Irrigação</p>
                        <p className="font-semibold text-foreground">{selectedSafra.irrigacao}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Progresso</p>
                        <p className="font-semibold text-foreground">{selectedSafra.progresso}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Safras;
