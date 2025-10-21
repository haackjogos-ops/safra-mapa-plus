import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Check, X, Edit2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AddSupplyDialog from "./AddSupplyDialog";
import AddPurchaseDialog from "./AddPurchaseDialog";

interface Supply {
  id: string;
  nome: string;
  categoria: string;
  quantidade_estoque: number;
  unidade_medida: string;
  preco_unitario: number;
  fornecedor: string | null;
  estoque_minimo: number;
}

const EditableSupplyTable = () => {
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Supply>>({});
  const { toast } = useToast();

  const fetchSupplies = async () => {
    const { data, error } = await supabase
      .from("supplies")
      .select("*")
      .order("nome");

    if (error) {
      toast({
        title: "Erro ao carregar insumos",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setSupplies(data || []);
  };

  useEffect(() => {
    fetchSupplies();
  }, []);

  const filteredSupplies = supplies.filter((supply) => {
    const matchesSearch = supply.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supply.categoria.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || supply.categoria === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(supplies.map((s) => s.categoria)));

  const startEditing = (supply: Supply) => {
    setEditingId(supply.id);
    setEditValues({
      quantidade_estoque: supply.quantidade_estoque,
      preco_unitario: supply.preco_unitario,
      fornecedor: supply.fornecedor,
      estoque_minimo: supply.estoque_minimo,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValues({});
  };

  const saveEditing = async () => {
    if (!editingId) return;

    const { error } = await supabase
      .from("supplies")
      .update(editValues)
      .eq("id", editingId);

    if (error) {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Atualizado com sucesso",
      description: "Informações do insumo atualizadas",
    });

    setEditingId(null);
    setEditValues({});
    fetchSupplies();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div>
            <CardTitle>Tabela de Insumos Editável</CardTitle>
            <CardDescription>
              Clique no ícone de edição para modificar informações rapidamente
            </CardDescription>
          </div>
          <AddSupplyDialog onSupplyAdded={fetchSupplies} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar insumos..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="border rounded-md px-3 py-2 bg-background"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">Todas as categorias</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Est. Mín.</TableHead>
                <TableHead>Preço Unit.</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSupplies.map((supply) => {
                const isEditing = editingId === supply.id;
                const isLowStock = supply.quantidade_estoque <= supply.estoque_minimo;

                return (
                  <TableRow key={supply.id}>
                    <TableCell className="font-medium">{supply.nome}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{supply.categoria}</Badge>
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="number"
                          className="w-24"
                          value={editValues.quantidade_estoque}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              quantidade_estoque: parseFloat(e.target.value),
                            })
                          }
                        />
                      ) : (
                        <span className={isLowStock ? "text-destructive font-bold" : ""}>
                          {supply.quantidade_estoque} {supply.unidade_medida}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="number"
                          className="w-24"
                          value={editValues.estoque_minimo}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              estoque_minimo: parseFloat(e.target.value),
                            })
                          }
                        />
                      ) : (
                        `${supply.estoque_minimo} ${supply.unidade_medida}`
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="number"
                          step="0.01"
                          className="w-28"
                          value={editValues.preco_unitario}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              preco_unitario: parseFloat(e.target.value),
                            })
                          }
                        />
                      ) : (
                        `R$ ${supply.preco_unitario.toFixed(2)}`
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          className="w-32"
                          value={editValues.fornecedor || ""}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              fornecedor: e.target.value,
                            })
                          }
                        />
                      ) : (
                        supply.fornecedor || "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {isEditing ? (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={saveEditing}
                            >
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={cancelEditing}
                            >
                              <X className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => startEditing(supply)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <AddPurchaseDialog
                              supplyId={supply.id}
                              supplyName={supply.nome}
                              onPurchaseAdded={fetchSupplies}
                            />
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default EditableSupplyTable;
