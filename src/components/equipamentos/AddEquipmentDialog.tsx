import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface AddEquipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddEquipmentDialog = ({ open, onOpenChange }: AddEquipmentDialogProps) => {
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const queryClient = useQueryClient();
  const tipo = watch("tipo");

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("equipamentos").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipamentos"] });
      toast.success("Equipamento adicionado com sucesso!");
      reset();
      onOpenChange(false);
    },
  });

  const onSubmit = (data: any) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Equipamento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome do Equipamento*</Label>
              <Input {...register("nome", { required: true })} placeholder="Ex: Trator New Holland" />
            </div>
            <div className="space-y-2">
              <Label>Tipo*</Label>
              <Select onValueChange={(value) => setValue("tipo", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trator">Trator</SelectItem>
                  <SelectItem value="colheitadeira">Colheitadeira</SelectItem>
                  <SelectItem value="pulverizador">Pulverizador</SelectItem>
                  <SelectItem value="plantadeira">Plantadeira</SelectItem>
                  <SelectItem value="caminhao">Caminhão</SelectItem>
                  <SelectItem value="implemento">Implemento</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Marca</Label>
              <Input {...register("marca")} placeholder="Ex: John Deere" />
            </div>
            <div className="space-y-2">
              <Label>Modelo</Label>
              <Input {...register("modelo")} placeholder="Ex: 7230R" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Ano</Label>
              <Input type="number" {...register("ano_fabricacao")} placeholder="2020" />
            </div>
            <div className="space-y-2">
              <Label>Número de Série</Label>
              <Input {...register("numero_serie")} />
            </div>
            <div className="space-y-2">
              <Label>Placa</Label>
              <Input {...register("placa")} placeholder="ABC-1234" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Valor de Aquisição (R$)</Label>
              <Input type="number" step="0.01" {...register("valor_aquisicao")} />
            </div>
            <div className="space-y-2">
              <Label>Data de Aquisição</Label>
              <Input type="date" {...register("data_aquisicao")} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Horímetro Atual</Label>
              <Input type="number" step="0.1" {...register("horimetro_atual")} defaultValue={0} />
            </div>
            <div className="space-y-2">
              <Label>Hodômetro Atual (km)</Label>
              <Input type="number" step="0.1" {...register("hodometro_atual")} defaultValue={0} />
            </div>
            <div className="space-y-2">
              <Label>Capacidade</Label>
              <Input {...register("capacidade")} placeholder="Ex: 180 cv" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status*</Label>
            <Select onValueChange={(value) => setValue("status", value)} defaultValue="disponivel">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="disponivel">Disponível</SelectItem>
                <SelectItem value="em_uso">Em Uso</SelectItem>
                <SelectItem value="manutencao">Em Manutenção</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea {...register("observacoes")} rows={3} />
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
