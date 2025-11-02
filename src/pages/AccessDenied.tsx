import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';

const AccessDenied = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldAlert className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Acesso Negado</CardTitle>
          <CardDescription>
            Você não tem permissão para acessar esta página
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Entre em contato com o suporte se você acredita que deveria ter acesso a este recurso.
          </p>
          <div className="flex gap-2">
            <Button onClick={() => navigate(-1)} variant="outline" className="flex-1">
              Voltar
            </Button>
            <Button onClick={() => navigate('/')} className="flex-1">
              Ir para Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessDenied;
