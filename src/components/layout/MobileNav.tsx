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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border md:hidden safe-area-inset-bottom shadow-lg">
      <div className="flex items-center justify-around h-16 px-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 min-w-[64px] touch-target active:scale-95",
                isActive
                  ? "text-primary bg-accent/50 shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
              )}
            >
              <Icon className={cn("h-6 w-6 transition-transform duration-300", isActive && "scale-110")} />
              <span className="text-[10px] font-semibold">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
