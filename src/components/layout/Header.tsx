import { Bell, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
}

const Header = ({ title, subtitle, onMenuClick }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-30 flex h-14 md:h-16 items-center gap-3 md:gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-3 md:px-6">
      <Button 
        variant="ghost" 
        size="icon" 
        className="md:hidden shrink-0"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>
      
      <div className="flex-1 min-w-0">
        <h2 className="text-lg md:text-2xl font-bold text-foreground truncate">{title}</h2>
        {subtitle && <p className="text-xs md:text-sm text-muted-foreground truncate">{subtitle}</p>}
      </div>
      
      <div className="flex items-center gap-1 md:gap-3 shrink-0">
        <Button variant="ghost" size="icon" className="relative h-9 w-9 md:h-10 md:w-10">
          <Bell className="h-4 w-4 md:h-5 md:w-5" />
          <span className="absolute right-1 top-1 md:right-1.5 md:top-1.5 h-2 w-2 rounded-full bg-destructive" />
        </Button>
        
        <Button variant="ghost" size="icon" className="h-9 w-9 md:h-10 md:w-10">
          <User className="h-4 w-4 md:h-5 md:w-5" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
