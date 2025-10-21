import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, User, Phone, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddOperatorDialog } from "./AddOperatorDialog";
import { format } from "date-fns";

export const OperatorList = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { data: operadores, isLoading } = useQuery({
    queryKey: ["operadores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("operadores")
        .select("*")
        .order("nome");
      if (error) throw error;
      return data;
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive", label: string }> = {
      ativo: { variant: "default", label: "Ativo" },
      inativo: { variant: "secondary", label: "Inativo" },
      afastado: { variant: "destructive", label: "Afastado" },
    };
    return variants[status] || variants.ativo;
  };

  if (isLoading) return <div>Carregando...</div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Operadores
        </CardTitle>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Operador
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>CNH</TableHead>
              <TableHead>Especialização</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Admissão</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {operadores?.map((op) => {
              const statusInfo = getStatusBadge(op.status);
              return (
                <TableRow key={op.id}>
                  <TableCell className="font-medium">{op.nome}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-sm">
                      {op.telefone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {op.telefone}
                        </span>
                      )}
                      {op.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {op.email}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {op.cnh_categoria && (
                      <div className="text-sm">
                        <div>{op.cnh_categoria}</div>
                        {op.cnh_validade && (
                          <div className="text-muted-foreground">
                            Val: {format(new Date(op.cnh_validade), "MM/yyyy")}
                          </div>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {op.especializacao?.slice(0, 3).map((esp: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {esp}
                        </Badge>
                      ))}
                      {op.especializacao && op.especializacao.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{op.especializacao.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                  </TableCell>
                  <TableCell>
                    {op.data_admissao && format(new Date(op.data_admissao), "dd/MM/yyyy")}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>

      <AddOperatorDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </Card>
  );
};
