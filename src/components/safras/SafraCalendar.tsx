import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Droplets, Sprout, Scissors } from "lucide-react";

interface CalendarEvent {
  date: string;
  type: "plantio" | "irrigacao" | "adubacao" | "colheita";
  cultura: string;
  descricao: string;
}

interface SafraCalendarProps {
  safras: any[];
}

const SafraCalendar = ({ safras }: SafraCalendarProps) => {
  const getEventIcon = (type: string) => {
    const icons = {
      plantio: <Sprout className="h-3 w-3" />,
      irrigacao: <Droplets className="h-3 w-3" />,
      adubacao: <Calendar className="h-3 w-3" />,
      colheita: <Scissors className="h-3 w-3" />
    };
    return icons[type as keyof typeof icons];
  };

  const getEventColor = (type: string) => {
    const colors = {
      plantio: "bg-primary/10 text-primary border-primary/20",
      irrigacao: "bg-secondary/10 text-secondary-foreground border-secondary/20",
      adubacao: "bg-accent/10 text-accent-foreground border-accent/20",
      colheita: "bg-primary/10 text-primary border-primary/20"
    };
    return colors[type as keyof typeof colors];
  };

  // Gerar eventos baseados nas safras
  const eventos: CalendarEvent[] = [];
  
  safras.forEach(safra => {
    eventos.push({
      date: safra.dataPlantio,
      type: "plantio",
      cultura: safra.cultura,
      descricao: `Plantio de ${safra.cultura}`
    });
    
    eventos.push({
      date: safra.previsaoColheita,
      type: "colheita",
      cultura: safra.cultura,
      descricao: `Colheita prevista de ${safra.cultura}`
    });

    // Adicionar eventos de irrigação e adubação baseados na cultura
    const dataPlantio = new Date(safra.dataPlantio.split('/').reverse().join('-'));
    
    if (safra.irrigacao !== "Sequeiro") {
      const irrigacaoDate = new Date(dataPlantio);
      irrigacaoDate.setDate(irrigacaoDate.getDate() + 30);
      eventos.push({
        date: irrigacaoDate.toLocaleDateString('pt-BR'),
        type: "irrigacao",
        cultura: safra.cultura,
        descricao: `Verificar irrigação - ${safra.cultura}`
      });
    }

    const adubacaoDate = new Date(dataPlantio);
    adubacaoDate.setDate(adubacaoDate.getDate() + 45);
    eventos.push({
      date: adubacaoDate.toLocaleDateString('pt-BR'),
      type: "adubacao",
      cultura: safra.cultura,
      descricao: `Adubação de cobertura - ${safra.cultura}`
    });
  });

  // Ordenar eventos por data
  eventos.sort((a, b) => {
    const dateA = new Date(a.date.split('/').reverse().join('-'));
    const dateB = new Date(b.date.split('/').reverse().join('-'));
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Calendário de Atividades
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {eventos.slice(0, 10).map((evento, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors"
            >
              <div className="mt-1">
                {getEventIcon(evento.type)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-sm text-foreground">{evento.descricao}</p>
                  <Badge variant="outline" className={getEventColor(evento.type)}>
                    {evento.type}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{evento.date}</p>
              </div>
            </div>
          ))}
          {eventos.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma atividade programada. Cadastre suas safras para visualizar o calendário.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SafraCalendar;
