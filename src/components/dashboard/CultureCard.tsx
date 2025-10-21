import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface CultureCardProps {
  name: string;
  area: string;
  status: string;
  progress: number;
  nextTask: string;
  image: string;
}

const CultureCard = ({ name, area, status, progress, nextTask, image }: CultureCardProps) => {
  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      "Plantio": "bg-secondary text-secondary-foreground",
      "Crescimento": "bg-primary text-primary-foreground",
      "Manutenção": "bg-accent text-accent-foreground",
      "Colheita": "bg-secondary text-secondary-foreground",
    };
    return statusMap[status] || "bg-muted text-muted-foreground";
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="h-32 overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
        <div className="h-full w-full flex items-center justify-center text-6xl">
          {image}
        </div>
      </div>
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">{name}</CardTitle>
          <Badge className={getStatusColor(status)}>{status}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{area}</p>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Progresso</span>
              <span className="text-sm font-bold text-primary">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <div className="pt-2 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground">Próxima Tarefa:</p>
            <p className="text-sm font-medium text-foreground mt-1">{nextTask}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CultureCard;
