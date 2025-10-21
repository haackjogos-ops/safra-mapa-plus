import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useState } from "react";

interface AddOperatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const especializacoes = [
  "Trator",
  "Colheitadeira",
  "Pulverizador",
  "Plantadeira",
  "Caminhão",
  "Implementos",
];

export const AddOperatorDialog = ({ open, onOpenChange }: AddOperatorDialogProps) => {
  const { register, handleSubmit, reset, setValue } = useForm();
  const [selectedEspec, setSelectedEspec] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("operadores").insert([{
        ...data,
        especializacao: selectedEspec,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operadores"] });
      toast.success("Operador adicionado com sucesso!");
      reset();
      setSelectedEspec([]);
      onOpenChange(false);
    },
  });

  const onSubmit = (data: any) => {
    mutation.mutate(data);
  };

  const toggleEspecializacao = (espec: string) => {
    setSelectedEspec((prev) =>
      prev.includes(espec) ? prev.filter((e) => e !== espec) : [...prev, espec]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Adicionar Operador</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome Completo*</Label>
              <Input {...register("nome", { required: true })} />
            </div>
            <div className="space-y-2">
              <Label>CPF</Label>
              <Input {...register("cpf")} placeholder="000.000.000-00" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input {...register("telefone")} placeholder="(00) 00000-0000" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" {...register("email")} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Categoria CNH</Label>
              <Input {...register("cnh_categoria")} placeholder="Ex: D" />
            </div>
            <div className="space-y-2">
              <Label>Número CNH</Label>
              <Input {...register("cnh_numero")} />
            </div>
            <div className="space-y-2">
              <Label>Validade CNH</Label>
              <Input type="date" {...register("cnh_validade")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data de Admissão</Label>
              <Input type="date" {...register("data_admissao")} />
            </div>
            <div className="space-y-2">
              <Label>Status*</Label>
              <Select onValueChange={(value) => setValue("status", value)} defaultValue="ativo">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                  <SelectItem value="afastado">Afastado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Especialização</Label>
            <div className="grid grid-cols-3 gap-2">
              {especializacoes.map((espec) => (
                <div key={espec} className="flex items-center space-x-2">
                  <Checkbox
                    id={espec}
                    checked={selectedEspec.includes(espec)}
                    onCheckedChange={() => toggleEspecializacao(espec)}
                  />
                  <Label htmlFor={espec} className="cursor-pointer text-sm">
                    {espec}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea {...register("observacoes")} rows={2} />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Adicionar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
