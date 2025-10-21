import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DeletePropertyButtonProps {
  property: any;
  plantingAreasCount: number;
  onDeleted: () => void;
}

const DeletePropertyButton = ({ property, plantingAreasCount, onDeleted }: DeletePropertyButtonProps) => {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const canDelete = plantingAreasCount === 0;

  const handleDelete = async () => {
    if (!canDelete) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from("properties")
        .delete()
        .eq("id", property.id);

      if (error) throw error;

      toast({
        title: "Propriedade excluída",
        description: `${property.nome} foi excluída com sucesso.`
      });

      onDeleted();
      setOpen(false);
    } catch (error) {
      console.error("Erro ao excluir propriedade:", error);
      toast({
        title: "Erro",
        description: "Erro ao excluir propriedade. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
        disabled={!canDelete}
        title={!canDelete ? "Não é possível excluir propriedade com áreas cadastradas" : "Excluir propriedade"}
      >
        <Trash2 className="h-4 w-4" />
        Excluir
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {canDelete ? (
                <>
                  <Trash2 className="h-5 w-5 text-destructive" />
                  Confirmar Exclusão
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Não é possível excluir
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              {canDelete ? (
                <>
                  <p>
                    Tem certeza que deseja excluir a propriedade <strong>{property.nome}</strong>?
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Esta ação não pode ser desfeita.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    A propriedade <strong>{property.nome}</strong> não pode ser excluída porque possui {plantingAreasCount} {plantingAreasCount === 1 ? 'área de plantio cadastrada' : 'áreas de plantio cadastradas'}.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Para excluir esta propriedade, primeiro você precisa excluir todas as áreas de plantio associadas a ela.
                  </p>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {canDelete ? (
              <>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleting ? "Excluindo..." : "Excluir Propriedade"}
                </AlertDialogAction>
              </>
            ) : (
              <AlertDialogCancel>Entendi</AlertDialogCancel>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DeletePropertyButton;
