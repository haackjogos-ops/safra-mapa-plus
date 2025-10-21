import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AddTransactionDialogProps {
  categories: any[];
  safras: any[];
  onTransactionAdded: () => void;
}

const AddTransactionDialog = ({ categories, safras, onTransactionAdded }: AddTransactionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState<"receita" | "despesa">("despesa");
  const [categoria, setCategoria] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [dataTransacao, setDataTransacao] = useState<Date>(new Date());
  const [dataVencimento, setDataVencimento] = useState<Date>();
  const [status, setStatus] = useState("pendente");
  const [formaPagamento, setFormaPagamento] = useState("");
  const [safraId, setSafraId] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const { toast } = useToast();

  const formasPagamento = [
    "Dinheiro",
    "PIX",
    "Transferência Bancária",
    "Cartão de Débito",
    "Cartão de Crédito",
    "Boleto",
    "Cheque"
  ];

  const handleSubmit = async () => {
    if (!categoria || !descricao || !valor || !dataTransacao) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("financial_transactions")
        .insert({
          tipo,
          categoria,
          descricao,
          valor: parseFloat(valor),
          data_transacao: format(dataTransacao, "yyyy-MM-dd"),
          data_vencimento: dataVencimento ? format(dataVencimento, "yyyy-MM-dd") : null,
          data_pagamento: status === "pago" ? format(new Date(), "yyyy-MM-dd") : null,
          status,
          forma_pagamento: formaPagamento || null,
          safra_id: safraId ? parseInt(safraId) : null,
          observacoes: observacoes || null
        });

      if (error) throw error;

      toast({
        title: "Transação criada",
        description: "Transação adicionada com sucesso!"
      });

      onTransactionAdded();
      resetForm();
      setOpen(false);
    } catch (error) {
      console.error("Erro ao criar transação:", error);
      toast({
        title: "Erro",
        description: "Erro ao criar transação.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setTipo("despesa");
    setCategoria("");
    setDescricao("");
    setValor("");
    setDataTransacao(new Date());
    setDataVencimento(undefined);
    setStatus("pendente");
    setFormaPagamento("");
    setSafraId("");
    setObservacoes("");
  };

  const filteredCategories = categories.filter(cat => cat.tipo === tipo);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Transação
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Transação</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v as "receita" | "despesa")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="despesa">Despesa</SelectItem>
                  <SelectItem value="receita">Receita</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Categoria *</Label>
              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.nome}>
                      {cat.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descrição *</Label>
            <Input
              placeholder="Descrição da transação"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Valor (R$) *</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0,00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Status *</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="atrasado">Atrasado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data da Transação *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dataTransacao && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataTransacao ? format(dataTransacao, "dd/MM/yyyy") : "Selecione"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dataTransacao}
                    onSelect={(date) => date && setDataTransacao(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Data de Vencimento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dataVencimento && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataVencimento ? format(dataVencimento, "dd/MM/yyyy") : "Opcional"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dataVencimento}
                    onSelect={setDataVencimento}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Forma de Pagamento</Label>
              <Select value={formaPagamento} onValueChange={setFormaPagamento}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {formasPagamento.map((forma) => (
                    <SelectItem key={forma} value={forma}>
                      {forma}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Safra Relacionada</Label>
              <Select value={safraId} onValueChange={setSafraId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {safras.map((safra) => (
                    <SelectItem key={safra.id} value={safra.id.toString()}>
                      {safra.cultura} - {safra.area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              placeholder="Observações adicionais..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
            />
          </div>

          <Button onClick={handleSubmit} className="w-full">
            Adicionar Transação
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddTransactionDialog;
