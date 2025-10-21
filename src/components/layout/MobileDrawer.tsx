import { Link, useLocation } from "react-router-dom";
import { Home, Map, Sprout, ClipboardList, BarChart3, Package, DollarSign, Tractor, Beaker, Cloud, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Propriedades", href: "/propriedades", icon: Map },
  { name: "Safras", href: "/safras", icon: Sprout },
  { name: "Tarefas", href: "/tarefas", icon: ClipboardList },
  { name: "Agrônomo", href: "/agronomo", icon: Beaker },
  { name: "Clima", href: "/clima", icon: Cloud },
  { name: "Relatórios", href: "/relatorios", icon: BarChart3 },
  { name: "Insumos", href: "/insumos", icon: Package },
  { name: "Financeiro", href: "/financeiro", icon: DollarSign },
  { name: "Equipamentos", href: "/equipamentos", icon: Tractor },
];

interface MobileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MobileDrawer = ({ open, onOpenChange }: MobileDrawerProps) => {
  const location = useLocation();

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[85vh]">
        <DrawerHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Sprout className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <DrawerTitle className="text-lg font-bold">Safra Cheia</DrawerTitle>
                <p className="text-xs text-muted-foreground">Gestão Agrícola</p>
              </div>
            </div>
            <DrawerClose asChild>
              <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                <X className="h-5 w-5" />
              </button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => onOpenChange(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs font-medium">Versão 1.0</p>
            <p className="text-xs text-muted-foreground mt-1">Sistema de Gestão Agrícola</p>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileDrawer;
