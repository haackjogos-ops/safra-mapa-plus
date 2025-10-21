import { Link, useLocation } from "react-router-dom";
import { Home, Map, Sprout, ClipboardList, BarChart3, Package, DollarSign, Tractor, Beaker, Cloud } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Início", href: "/", icon: Home },
  { name: "Safras", href: "/safras", icon: Sprout },
  { name: "Agrônomo", href: "/agronomo", icon: Beaker },
  { name: "Tarefas", href: "/tarefas", icon: ClipboardList },
  { name: "Mais", href: "#", icon: BarChart3 },
];

const MobileNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 min-w-[60px]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "scale-110")} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
