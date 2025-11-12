import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Shield, Link, BarChart3, Settings } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ManageUserDialog } from '@/components/admin/ManageUserDialog';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [manageDialogOpen, setManageDialogOpen] = useState(false);

  // Buscar todos os usuários e roles
  const { data: users, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*');

      const usersWithRoles = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: roles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.id);

          return {
            ...profile,
            roles: roles?.map(r => r.role) || []
          };
        })
      );

      return usersWithRoles;
    }
  });

  // Buscar estatísticas
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [usersRes, vinculosRes, logsRes] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('agronomo_agricultor').select('*', { count: 'exact', head: true }).eq('ativo', true),
        supabase.from('access_logs' as any).select('*', { count: 'exact', head: true })
      ]);

      return {
        totalUsers: usersRes.count || 0,
        activeVinculos: vinculosRes.count || 0,
        totalLogs: logsRes.count || 0
      };
    }
  });

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'suporte': return 'destructive';
      case 'admin': return 'default';
      case 'agronomo': return 'secondary';
      case 'agricultor': return 'outline';
      default: return 'outline';
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      suporte: '👑 Suporte',
      admin: '⚙️ Admin',
      agronomo: '🧪 Agrônomo',
      agricultor: '🌾 Agricultor'
    };
    return labels[role] || role;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Painel Administrativo</h1>
        <p className="text-muted-foreground">Gestão completa do sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vínculos Ativos</CardTitle>
            <Link className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeVinculos || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Logs de Acesso</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalLogs || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="permissions">
            <Shield className="h-4 w-4 mr-2" />
            Permissões
          </TabsTrigger>
          <TabsTrigger value="vinculos">
            <Link className="h-4 w-4 mr-2" />
            Vínculos
          </TabsTrigger>
          <TabsTrigger value="logs">
            <BarChart3 className="h-4 w-4 mr-2" />
            Auditoria
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Usuários</CardTitle>
              <CardDescription>Visualize e gerencie todos os usuários do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Cidade/Estado</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.nome_completo}</TableCell>
                      <TableCell>{user.cidade}, {user.estado}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {user.roles.map((role: string) => (
                            <Badge key={role} variant={getRoleBadgeVariant(role)}>
                              {getRoleLabel(role)}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setManageDialogOpen(true);
                          }}
                        >
                          Gerenciar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle>Controle de Permissões</CardTitle>
              <CardDescription>Gerencie quem pode acessar cada página</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Tabela de permissões de páginas será exibida aqui.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vinculos">
          <Card>
            <CardHeader>
              <CardTitle>Vínculos Agrônomo ↔ Agricultor</CardTitle>
              <CardDescription>Gerencie relacionamentos entre agrônomos e agricultores</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Tabela de vínculos será exibida aqui.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Logs de Auditoria</CardTitle>
              <CardDescription>Histórico completo de acessos e ações</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Logs de acesso serão exibidos aqui.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Sistema</CardTitle>
              <CardDescription>Ajustes gerais e manutenção</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Configurações do sistema.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ManageUserDialog
        user={selectedUser}
        open={manageDialogOpen}
        onOpenChange={setManageDialogOpen}
        onUpdate={refetch}
      />
    </div>
  );
};

export default Admin;
