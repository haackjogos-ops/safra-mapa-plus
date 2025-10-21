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
import { ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddPurchaseDialogProps {
  supplyId: string;
  supplyName: string;
  onPurchaseAdded: () => void;
}

const AddPurchaseDialog = ({ supplyId, supplyName, onPurchaseAdded }: AddPurchaseDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    data_compra: new Date().toISOString().split("T")[0],
    quantidade: "",
    preco_unitario: "",
    fornecedor: "",
    nota_fiscal: "",
    observacoes: "",
  });

  const valorTotal = formData.quantidade && formData.preco_unitario
    ? (parseFloat(formData.quantidade) * parseFloat(formData.preco_unitario)).toFixed(2)
    : "0.00";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const quantidade = parseFloat(formData.quantidade);
      const precoUnitario = parseFloat(formData.preco_unitario);
      
      // Inserir compra
      const { error: purchaseError } = await supabase.from("supply_purchases").insert([
        {
          supply_id: supplyId,
          data_compra: formData.data_compra,
          quantidade,
          preco_unitario: precoUnitario,
          valor_total: quantidade * precoUnitario,
          fornecedor: formData.fornecedor,
          nota_fiscal: formData.nota_fiscal || null,
          observacoes: formData.observacoes || null,
        },
      ]);

      if (purchaseError) throw purchaseError;

      // Atualizar estoque
      const { data: currentSupply, error: fetchError } = await supabase
        .from("supplies")
        .select("quantidade_estoque")
        .eq("id", supplyId)
        .single();

      if (fetchError) throw fetchError;

      const { error: updateError } = await supabase
        .from("supplies")
        .update({ quantidade_estoque: currentSupply.quantidade_estoque + quantidade })
        .eq("id", supplyId);

      if (updateError) throw updateError;

      toast({
        title: "Compra registrada",
        description: "A compra foi registrada e o estoque atualizado.",
      });

      setFormData({
        data_compra: new Date().toISOString().split("T")[0],
        quantidade: "",
        preco_unitario: "",
        fornecedor: "",
        nota_fiscal: "",
        observacoes: "",
      });
      setOpen(false);
      onPurchaseAdded();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível registrar a compra.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Registrar Compra
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Compra</DialogTitle>
          <DialogDescription>
            Registrando compra para: {supplyName}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="data_compra">Data da Compra *</Label>
              <Input
                id="data_compra"
                type="date"
                value={formData.data_compra}
                onChange={(e) => setFormData({ ...formData, data_compra: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantidade">Quantidade *</Label>
                <Input
                  id="quantidade"
                  type="number"
                  step="0.01"
                  value={formData.quantidade}
                  onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preco_unitario">Preço por Unidade *</Label>
                <Input
                  id="preco_unitario"
                  type="number"
                  step="0.01"
                  value={formData.preco_unitario}
                  onChange={(e) => setFormData({ ...formData, preco_unitario: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Valor Total</Label>
              <div className="text-2xl font-bold">R$ {valorTotal}</div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fornecedor">Fornecedor *</Label>
              <Input
                id="fornecedor"
                value={formData.fornecedor}
                onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nota_fiscal">Número da Nota Fiscal</Label>
              <Input
                id="nota_fiscal"
                value={formData.nota_fiscal}
                onChange={(e) => setFormData({ ...formData, nota_fiscal: e.target.value })}
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
              {loading ? "Registrando..." : "Registrar Compra"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPurchaseDialog;
