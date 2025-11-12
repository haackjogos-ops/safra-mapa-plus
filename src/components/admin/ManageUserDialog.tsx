import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, X } from 'lucide-react';
import type { AppRole } from '@/hooks/useRole';

interface User {
  id: string;
  nome_completo: string;
  cidade: string;
  estado: string;
  telefone?: string;
  roles: string[];
}

interface ManageUserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

const AVAILABLE_ROLES: { value: AppRole; label: string; description: string }[] = [
  { value: 'admin', label: '⚙️ Admin', description: 'Acesso total ao sistema' },
  { value: 'suporte', label: '👑 Suporte', description: 'Gerenciar usuários e permissões' },
  { value: 'agronomo', label: '🧪 Agrônomo', description: 'Consultoria e recomendações' },
  { value: 'agricultor', label: '🌾 Agricultor', description: 'Gestão de propriedades e safras' }
];

export function ManageUserDialog({ user, open, onOpenChange, onUpdate }: ManageUserDialogProps) {
  const [selectedRoles, setSelectedRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && user) {
      setSelectedRoles(user.roles as AppRole[]);
    }
    onOpenChange(newOpen);
  };

  const handleToggleRole = (role: AppRole) => {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const currentRoles = user.roles as AppRole[];
      const rolesToAdd = selectedRoles.filter(r => !currentRoles.includes(r));
      const rolesToRemove = currentRoles.filter(r => !selectedRoles.includes(r));

      // Adicionar novas roles
      for (const role of rolesToAdd) {
        const { error } = await supabase.rpc('admin_add_role', {
          _user_id: user.id,
          _role: role
        });
        if (error) throw error;
      }

      // Remover roles
      for (const role of rolesToRemove) {
        const { error } = await supabase.rpc('admin_remove_role', {
          _user_id: user.id,
          _role: role
        });
        if (error) throw error;
      }

      toast({
        title: 'Roles atualizadas',
        description: `Permissões de ${user.nome_completo} foram atualizadas com sucesso.`
      });

      onUpdate();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar roles',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Gerenciar Usuário</DialogTitle>
          <DialogDescription>
            Gerencie as permissões de {user.nome_completo}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Informações do Usuário</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p><strong>Nome:</strong> {user.nome_completo}</p>
              <p><strong>Localização:</strong> {user.cidade}, {user.estado}</p>
              {user.telefone && <p><strong>Telefone:</strong> {user.telefone}</p>}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Roles do Sistema</h4>
            {AVAILABLE_ROLES.map(({ value, label, description }) => (
              <div key={value} className="flex items-start space-x-3 space-y-0 rounded-md border p-3">
                <Checkbox
                  id={`role-${value}`}
                  checked={selectedRoles.includes(value)}
                  onCheckedChange={() => handleToggleRole(value)}
                />
                <div className="flex-1 space-y-1">
                  <Label
                    htmlFor={`role-${value}`}
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {label}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
