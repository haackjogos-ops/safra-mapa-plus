import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Upload, FileText, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NFXmlUploadProps {
  onImportComplete: () => void;
}

const NFXmlUpload = ({ onImportComplete }: NFXmlUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xml')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo XML",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setResult(null);

    try {
      const text = await file.text();

      const { data, error } = await supabase.functions.invoke('process-nf-xml', {
        body: { xmlContent: text },
      });

      if (error) throw error;

      if (data.success) {
        setResult({
          success: true,
          message: `Importação concluída! ${data.itemsProcessed} item(ns) processado(s).`,
          details: data.details,
        });
        toast({
          title: "Sucesso",
          description: `${data.itemsProcessed} item(ns) importado(s) com sucesso!`,
        });
        onImportComplete();
      } else {
        setResult({
          success: false,
          message: data.message || "Erro ao processar XML",
        });
        toast({
          title: "Erro na importação",
          description: data.message || "Erro ao processar XML",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || "Erro ao processar arquivo",
      });
      toast({
        title: "Erro",
        description: error.message || "Erro ao processar arquivo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Importar XML da Nota Fiscal
        </CardTitle>
        <CardDescription>
          Faça upload do arquivo XML da nota fiscal para entrada automática de insumos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Input
            type="file"
            accept=".xml"
            onChange={handleFileUpload}
            disabled={uploading}
            className="flex-1"
          />
          <Button disabled={uploading} variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? "Processando..." : "Upload"}
          </Button>
        </div>

        {result && (
          <div
            className={`flex items-start gap-3 p-4 rounded-lg border ${
              result.success
                ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                : "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
            }`}
          >
            {result.success ? (
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
            )}
            <div className="flex-1">
              <p className={result.success ? "text-green-900 dark:text-green-100" : "text-red-900 dark:text-red-100"}>
                {result.message}
              </p>
              {result.details && (
                <ul className="mt-2 space-y-1 text-sm">
                  {result.details.map((item: any, index: number) => (
                    <li key={index} className="text-muted-foreground">
                      • {item.nome}: {item.quantidade} {item.unidade} - R$ {item.valor_total}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        <div className="text-sm text-muted-foreground space-y-2">
          <p className="font-medium">Como funciona:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Faça upload do arquivo XML da nota fiscal (NF-e)</li>
            <li>O sistema extrai automaticamente os produtos e valores</li>
            <li>Os insumos são cadastrados ou atualizados no estoque</li>
            <li>O histórico de compra é registrado automaticamente</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default NFXmlUpload;
