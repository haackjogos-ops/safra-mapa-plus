import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Supply {
  id: string;
  nome: string;
  quantidade_estoque: number;
  estoque_minimo: number;
  unidade_medida: string;
}

interface SupplyStockAlertProps {
  supplies: Supply[];
}

const SupplyStockAlert = ({ supplies }: SupplyStockAlertProps) => {
  const lowStockSupplies = supplies.filter(
    (supply) => supply.quantidade_estoque <= supply.estoque_minimo
  );

  if (lowStockSupplies.length === 0) return null;

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Alerta de Estoque Baixo</AlertTitle>
      <AlertDescription>
        <div className="mt-2 space-y-1">
          {lowStockSupplies.map((supply) => (
            <div key={supply.id}>
              <strong>{supply.nome}:</strong> {supply.quantidade_estoque} {supply.unidade_medida} 
              (mínimo: {supply.estoque_minimo} {supply.unidade_medida})
            </div>
          ))}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default SupplyStockAlert;
