import { Bell, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
}

const Header = ({ title, subtitle, onMenuClick }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 md:gap-4 border-b border-border bg-background/95 backdrop-blur-xl px-4 md:px-6 shadow-sm animate-slide-down">
      <Button 
        variant="ghost" 
        size="icon" 
        className="md:hidden shrink-0 hover:bg-accent rounded-xl active:scale-95 transition-all"
        onClick={onMenuClick}
      >
        <Menu className="h-6 w-6" />
      </Button>
      
      <div className="flex-1 min-w-0">
        <h2 className="text-xl md:text-2xl font-bold text-foreground truncate">{title}</h2>
        {subtitle && <p className="text-xs md:text-sm text-muted-foreground truncate mt-0.5">{subtitle}</p>}
      </div>
      
      <div className="flex items-center gap-2 shrink-0">
        <Button variant="ghost" size="icon" className="relative hover:bg-accent rounded-xl active:scale-95 transition-all touch-target">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive animate-pulse" />
        </Button>
        
        <Button variant="ghost" size="icon" className="hover:bg-accent rounded-xl active:scale-95 transition-all touch-target">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
