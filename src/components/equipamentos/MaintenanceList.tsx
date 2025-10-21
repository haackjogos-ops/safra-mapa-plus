import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Wrench, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddMaintenanceDialog } from "./AddMaintenanceDialog";
import { format } from "date-fns";

export const MaintenanceList = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { data: manutencoes, isLoading } = useQuery({
    queryKey: ["manutencoes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("manutencoes")
        .select(`
          *,
          equipamentos (nome)
        `)
        .order("data_manutencao", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      pendente: { variant: "outline", label: "Pendente" },
      em_andamento: { variant: "secondary", label: "Em Andamento" },
      concluida: { variant: "default", label: "Concluída" },
      cancelada: { variant: "destructive", label: "Cancelada" },
    };
    return variants[status] || variants.pendente;
  };

  const getTipoBadge = (tipo: string) => {
    const variants: Record<string, string> = {
      preventiva: "Preventiva",
      corretiva: "Corretiva",
      preditiva: "Preditiva",
    };
    return variants[tipo] || tipo;
  };

  if (isLoading) return <div>Carregando...</div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          Histórico de Manutenções
        </CardTitle>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Registrar Manutenção
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Equipamento</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Custo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Próxima</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {manutencoes?.map((manut: any) => {
              const statusInfo = getStatusBadge(manut.status);
              return (
                <TableRow key={manut.id}>
                  <TableCell>{format(new Date(manut.data_manutencao), "dd/MM/yyyy")}</TableCell>
                  <TableCell className="font-medium">{manut.equipamentos?.nome}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{getTipoBadge(manut.tipo)}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{manut.descricao}</TableCell>
                  <TableCell>{manut.custo ? `R$ ${manut.custo.toLocaleString('pt-BR')}` : '-'}</TableCell>
                  <TableCell>
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                  </TableCell>
                  <TableCell>
                    {manut.proxima_manutencao ? (
                      <span className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(manut.proxima_manutencao), "dd/MM/yyyy")}
                      </span>
                    ) : '-'}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>

      <AddMaintenanceDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </Card>
  );
};
