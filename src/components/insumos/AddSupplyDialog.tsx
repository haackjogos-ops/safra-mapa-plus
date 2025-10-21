import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddSupplyDialogProps {
  onSupplyAdded: () => void;
}

const AddSupplyDialog = ({ onSupplyAdded }: AddSupplyDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nome: "",
    categoria: "",
    quantidade_estoque: "",
    unidade_medida: "",
    preco_unitario: "",
    fornecedor: "",
    fornecedor_contato: "",
    data_validade: "",
    local_armazenamento: "",
    estoque_minimo: "",
    observacoes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("supplies").insert([
        {
          nome: formData.nome,
          categoria: formData.categoria,
          quantidade_estoque: parseFloat(formData.quantidade_estoque),
          unidade_medida: formData.unidade_medida,
          preco_unitario: parseFloat(formData.preco_unitario),
          fornecedor: formData.fornecedor || null,
          fornecedor_contato: formData.fornecedor_contato || null,
          data_validade: formData.data_validade || null,
          local_armazenamento: formData.local_armazenamento || null,
          estoque_minimo: formData.estoque_minimo ? parseFloat(formData.estoque_minimo) : 0,
          observacoes: formData.observacoes || null,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Insumo cadastrado",
        description: "O insumo foi adicionado com sucesso.",
      });

      setFormData({
        nome: "",
        categoria: "",
        quantidade_estoque: "",
        unidade_medida: "",
        preco_unitario: "",
        fornecedor: "",
        fornecedor_contato: "",
        data_validade: "",
        local_armazenamento: "",
        estoque_minimo: "",
        observacoes: "",
      });
      setOpen(false);
      onSupplyAdded();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível cadastrar o insumo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Insumo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Insumo</DialogTitle>
          <DialogDescription>
            Preencha as informações do insumo agrícola
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Insumo *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria *</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fertilizante">Fertilizante</SelectItem>
                    <SelectItem value="Semente">Semente</SelectItem>
                    <SelectItem value="Defensivo">Defensivo</SelectItem>
                    <SelectItem value="Herbicida">Herbicida</SelectItem>
                    <SelectItem value="Inseticida">Inseticida</SelectItem>
                    <SelectItem value="Fungicida">Fungicida</SelectItem>
                    <SelectItem value="Aditivo">Aditivo</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantidade">Quantidade em Estoque *</Label>
                <Input
                  id="quantidade"
                  type="number"
                  step="0.01"
                  value={formData.quantidade_estoque}
                  onChange={(e) => setFormData({ ...formData, quantidade_estoque: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unidade">Unidade de Medida *</Label>
                <Select
                  value={formData.unidade_medida}
                  onValueChange={(value) => setFormData({ ...formData, unidade_medida: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Quilograma (kg)</SelectItem>
                    <SelectItem value="litro">Litro (L)</SelectItem>
                    <SelectItem value="saco">Saco</SelectItem>
                    <SelectItem value="tonelada">Tonelada (t)</SelectItem>
                    <SelectItem value="unidade">Unidade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="estoque_minimo">Estoque Mínimo</Label>
                <Input
                  id="estoque_minimo"
                  type="number"
                  step="0.01"
                  value={formData.estoque_minimo}
                  onChange={(e) => setFormData({ ...formData, estoque_minimo: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preco">Preço por Unidade *</Label>
                <Input
                  id="preco"
                  type="number"
                  step="0.01"
                  value={formData.preco_unitario}
                  onChange={(e) => setFormData({ ...formData, preco_unitario: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data_validade">Data de Validade</Label>
                <Input
                  id="data_validade"
                  type="date"
                  value={formData.data_validade}
                  onChange={(e) => setFormData({ ...formData, data_validade: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fornecedor">Fornecedor</Label>
                <Input
                  id="fornecedor"
                  value={formData.fornecedor}
                  onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fornecedor_contato">Contato do Fornecedor</Label>
                <Input
                  id="fornecedor_contato"
                  value={formData.fornecedor_contato}
                  onChange={(e) => setFormData({ ...formData, fornecedor_contato: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="local">Local de Armazenamento</Label>
              <Input
                id="local"
                value={formData.local_armazenamento}
                onChange={(e) => setFormData({ ...formData, local_armazenamento: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Cadastrando..." : "Cadastrar Insumo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSupplyDialog;
