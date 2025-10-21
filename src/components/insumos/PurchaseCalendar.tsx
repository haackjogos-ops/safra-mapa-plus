import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PlannedPurchase {
  id: string;
  supply_id: string;
  data_planejada: string;
  quantidade: number;
  preco_estimado: number;
  observacoes: string | null;
  supplies: { nome: string; unidade_medida: string };
}

const PurchaseCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [plannedPurchases, setPlannedPurchases] = useState<PlannedPurchase[]>([]);
  const [supplies, setSupplies] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [formData, setFormData] = useState({
    supply_id: "",
    quantidade: "",
    preco_estimado: "",
    observacoes: "",
  });
  const { toast } = useToast();

  const fetchPlannedPurchases = async () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);

    const { data, error } = await supabase
      .from("planned_purchases")
      .select("*, supplies(nome, unidade_medida)")
      .gte("data_planejada", start.toISOString().split("T")[0])
      .lte("data_planejada", end.toISOString().split("T")[0])
      .order("data_planejada");

    if (error && error.code !== "PGRST116") {
      toast({
        title: "Erro ao carregar compras planejadas",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setPlannedPurchases(data || []);
  };

  const fetchSupplies = async () => {
    const { data, error } = await supabase
      .from("supplies")
      .select("id, nome, unidade_medida")
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
    fetchPlannedPurchases();
    fetchSupplies();
  }, [currentMonth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;

    const { error } = await supabase.from("planned_purchases").insert({
      supply_id: formData.supply_id,
      data_planejada: selectedDate.toISOString().split("T")[0],
      quantidade: parseFloat(formData.quantidade),
      preco_estimado: parseFloat(formData.preco_estimado),
      observacoes: formData.observacoes || null,
    });

    if (error) {
      toast({
        title: "Erro ao criar compra planejada",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Compra planejada",
      description: "Compra adicionada ao calendário",
    });

    setFormData({
      supply_id: "",
      quantidade: "",
      preco_estimado: "",
      observacoes: "",
    });
    setIsDialogOpen(false);
    setSelectedDate(null);
    fetchPlannedPurchases();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("planned_purchases")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Erro ao deletar",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Deletado",
      description: "Compra removida do calendário",
    });

    fetchPlannedPurchases();
  };

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const getPurchasesForDay = (day: Date) => {
    return plannedPurchases.filter((purchase) =>
      isSameDay(parseISO(purchase.data_planejada), day)
    );
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Calendário de Compras
            </CardTitle>
            <CardDescription>
              Planeje compras futuras de insumos
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={previousMonth}>
              ←
            </Button>
            <div className="px-4 py-2 bg-muted rounded-md font-medium">
              {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
            </div>
            <Button variant="outline" onClick={nextMonth}>
              →
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
            <div key={day} className="text-center font-medium text-sm p-2">
              {day}
            </div>
          ))}
          {daysInMonth.map((day) => {
            const purchases = getPurchasesForDay(day);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={day.toISOString()}
                className={`min-h-24 p-2 border rounded-md ${
                  isToday ? "bg-primary/10 border-primary" : "bg-card"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{format(day, "d")}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={() => {
                      setSelectedDate(day);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="space-y-1">
                  {purchases.map((purchase) => (
                    <div
                      key={purchase.id}
                      className="group relative text-xs p-1 bg-primary/20 rounded cursor-pointer hover:bg-primary/30"
                    >
                      <div className="font-medium truncate">
                        {purchase.supplies.nome}
                      </div>
                      <div className="text-muted-foreground">
                        {purchase.quantidade} {purchase.supplies.unidade_medida}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-0 right-0 h-5 w-5 p-0 opacity-0 group-hover:opacity-100"
                        onClick={() => handleDelete(purchase.id)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Planejar Compra</DialogTitle>
              <DialogDescription>
                {selectedDate &&
                  `Adicionar compra para ${format(selectedDate, "dd/MM/yyyy")}`}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="supply_id">Insumo</Label>
                  <select
                    id="supply_id"
                    className="w-full border rounded-md px-3 py-2"
                    value={formData.supply_id}
                    onChange={(e) =>
                      setFormData({ ...formData, supply_id: e.target.value })
                    }
                    required
                  >
                    <option value="">Selecione um insumo</option>
                    {supplies.map((supply) => (
                      <option key={supply.id} value={supply.id}>
                        {supply.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="quantidade">Quantidade</Label>
                  <Input
                    id="quantidade"
                    type="number"
                    step="0.01"
                    value={formData.quantidade}
                    onChange={(e) =>
                      setFormData({ ...formData, quantidade: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="preco_estimado">Preço Estimado</Label>
                  <Input
                    id="preco_estimado"
                    type="number"
                    step="0.01"
                    value={formData.preco_estimado}
                    onChange={(e) =>
                      setFormData({ ...formData, preco_estimado: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Input
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) =>
                      setFormData({ ...formData, observacoes: e.target.value })
                    }
                  />
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default PurchaseCalendar;
