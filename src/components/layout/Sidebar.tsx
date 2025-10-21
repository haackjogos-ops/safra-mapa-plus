import { Link, useLocation } from "react-router-dom";
import { Home, Map, Sprout, ClipboardList, BarChart3, Package, DollarSign, Tractor, Beaker } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Propriedades", href: "/propriedades", icon: Map },
  { name: "Safras", href: "/safras", icon: Sprout },
  { name: "Tarefas", href: "/tarefas", icon: ClipboardList },
  { name: "Agrônomo", href: "/agronomo", icon: Beaker },
  { name: "Relatórios", href: "/relatorios", icon: BarChart3 },
  { name: "Insumos", href: "/insumos", icon: Package },
  { name: "Financeiro", href: "/financeiro", icon: DollarSign },
  { name: "Equipamentos", href: "/equipamentos", icon: Tractor },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Sprout className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-sidebar-foreground">Safra Cheia</h1>
            <p className="text-xs text-sidebar-foreground/70">Gestão Agrícola</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <div className="rounded-lg bg-sidebar-accent/30 p-3">
            <p className="text-xs font-medium text-sidebar-foreground">Versão 1.0</p>
            <p className="text-xs text-sidebar-foreground/60 mt-1">Sistema de Gestão Agrícola</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
