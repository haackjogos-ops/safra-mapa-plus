import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CloudRain, Sun, AlertTriangle, Droplets, Bug, Leaf } from "lucide-react";

interface HealthAnalysisProps {
  safra: any;
}

const HealthAnalysis = ({ safra }: HealthAnalysisProps) => {
  // Simulação de análise climática e recomendações
  const getHealthStatus = () => {
    const progresso = safra.progresso;
    
    // Análises baseadas no progresso da cultura
    const analyses = [];

    // Análise de irrigação
    if (safra.irrigacao !== "Sequeiro" && progresso < 70) {
      analyses.push({
        icon: <Droplets className="h-4 w-4" />,
        tipo: "Irrigação",
        nivel: "normal",
        recomendacao: "Manter irrigação regular conforme cronograma. Período crítico para desenvolvimento vegetativo."
      });
    }

    // Análise climática simulada
    const temp = 28 + Math.random() * 5;
    const umidade = 60 + Math.random() * 20;
    
    if (temp > 32) {
      analyses.push({
        icon: <Sun className="h-4 w-4" />,
        tipo: "Temperatura",
        nivel: "alerta",
        recomendacao: "Temperatura elevada detectada. Considere aumentar frequência de irrigação e monitorar estresse hídrico."
      });
    }

    if (umidade < 60) {
      analyses.push({
        icon: <CloudRain className="h-4 w-4" />,
        tipo: "Umidade",
        nivel: "atencao",
        recomendacao: "Baixa umidade do ar. Recomenda-se irrigação suplementar e monitoramento de pragas."
      });
    }

    // Análise de pragas baseada na fase
    if (safra.fase === "Desenvolvimento Vegetativo" || safra.fase === "Floração") {
      analyses.push({
        icon: <Bug className="h-4 w-4" />,
        tipo: "Controle de Pragas",
        nivel: "atencao",
        recomendacao: `Fase crítica para ${safra.cultura}. Realizar monitoramento de pragas e doenças. Aplicar defensivos preventivos se necessário.`
      });
    }

    // Análise de adubação
    if (progresso > 30 && progresso < 60) {
      analyses.push({
        icon: <Leaf className="h-4 w-4" />,
        tipo: "Nutrição",
        nivel: "normal",
        recomendacao: "Período ideal para adubação de cobertura. Avaliar necessidade nutricional com análise foliar."
      });
    }

    return analyses;
  };

  const analyses = getHealthStatus();

  const getNivelColor = (nivel: string) => {
    const colors = {
      normal: "bg-primary/10 text-primary border-primary/20",
      atencao: "bg-accent/10 text-accent-foreground border-accent/20",
      alerta: "bg-destructive/10 text-destructive border-destructive/20"
    };
    return colors[nivel as keyof typeof colors] || colors.normal;
  };

  const getNivelText = (nivel: string) => {
    const texts = {
      normal: "Normal",
      atencao: "Atenção",
      alerta: "Alerta"
    };
    return texts[nivel as keyof typeof texts] || "Normal";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Análise de Saúde da Cultura
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {analyses.map((analysis, idx) => (
          <Alert key={idx} className="border-border">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{analysis.icon}</div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-semibold text-sm text-foreground">{analysis.tipo}</h4>
                  <Badge variant="outline" className={getNivelColor(analysis.nivel)}>
                    {getNivelText(analysis.nivel)}
                  </Badge>
                </div>
                <AlertDescription className="text-sm">
                  {analysis.recomendacao}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        ))}
        
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            * Recomendações baseadas em dados meteorológicos e fase de desenvolvimento da cultura.
            Sempre consulte um agrônomo para decisões críticas.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthAnalysis;
