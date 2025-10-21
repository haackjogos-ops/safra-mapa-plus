import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BankImportProps {
  onImportComplete: () => void;
}

const BankImport = ({ onImportComplete }: BankImportProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [banco, setBanco] = useState("");
  const [conta, setConta] = useState("");
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const parseCSV = async (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    const statements = [];

    // Assumindo formato CSV: data,descricao,valor,tipo
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',');
      if (parts.length >= 4) {
        const [data, descricao, valor, tipo] = parts;
        
        statements.push({
          banco,
          conta,
          data_transacao: data.trim(),
          descricao: descricao.trim(),
          valor: parseFloat(valor.trim().replace(/[^\d.-]/g, '')),
          tipo: tipo.trim().toLowerCase() === 'credito' ? 'credito' : 'debito',
          arquivo_origem: file?.name || 'importacao.csv'
        });
      }
    }

    return statements;
  };

  const handleImport = async () => {
    if (!file || !banco || !conta) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione um arquivo e preencha banco e conta.",
        variant: "destructive"
      });
      return;
    }

    try {
      const text = await file.text();
      const statements = await parseCSV(text);

      if (statements.length === 0) {
        toast({
          title: "Arquivo inválido",
          description: "Nenhuma transação encontrada no arquivo.",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from("bank_statements")
        .insert(statements);

      if (error) throw error;

      toast({
        title: "Importação concluída",
        description: `${statements.length} transações importadas com sucesso!`
      });

      setFile(null);
      setBanco("");
      setConta("");
      onImportComplete();
    } catch (error) {
      console.error("Erro ao importar:", error);
      toast({
        title: "Erro na importação",
        description: "Verifique o formato do arquivo e tente novamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Importar Extrato Bancário
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Banco</Label>
          <Input
            placeholder="Nome do banco"
            value={banco}
            onChange={(e) => setBanco(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Conta</Label>
          <Input
            placeholder="Número da conta"
            value={conta}
            onChange={(e) => setConta(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Arquivo CSV</Label>
          <Input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
          />
          <p className="text-xs text-muted-foreground">
            Formato esperado: data,descricao,valor,tipo (credito/debito)
          </p>
        </div>

        <Button onClick={handleImport} className="w-full" disabled={!file || !banco || !conta}>
          <Upload className="h-4 w-4 mr-2" />
          Importar Extrato
        </Button>

        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-sm font-medium mb-2">Exemplo de formato CSV:</p>
          <code className="text-xs block bg-background p-2 rounded">
            data,descricao,valor,tipo<br />
            2024-10-15,Venda de soja,15000.00,credito<br />
            2024-10-16,Compra de fertilizante,-3500.50,debito
          </code>
        </div>
      </CardContent>
    </Card>
  );
};

export default BankImport;
