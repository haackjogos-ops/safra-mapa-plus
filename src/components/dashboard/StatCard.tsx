import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  trend?: "up" | "down";
  trendValue?: string;
  gradient?: "primary" | "earth" | "harvest";
}

const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendValue,
  gradient = "primary" 
}: StatCardProps) => {
  const gradientClasses = {
    primary: "from-primary/10 to-primary/5",
    earth: "from-accent/10 to-accent/5",
    harvest: "from-secondary/10 to-secondary/5",
  };

  const iconClasses = {
    primary: "bg-primary text-primary-foreground",
    earth: "bg-accent text-accent-foreground",
    harvest: "bg-secondary text-secondary-foreground",
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-50",
          gradientClasses[gradient]
        )} />
        
        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <h3 className="mt-2 text-3xl font-bold text-foreground">{value}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            </div>
            
            <div className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl",
              iconClasses[gradient]
            )}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
          
          {trend && trendValue && (
            <div className="mt-4 flex items-center gap-1">
              <span className={cn(
                "text-xs font-medium",
                trend === "up" ? "text-primary" : "text-destructive"
              )}>
                {trend === "up" ? "↑" : "↓"} {trendValue}
              </span>
              <span className="text-xs text-muted-foreground">vs. mês anterior</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
