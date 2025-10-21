import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { DOMParser, Element } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { xmlContent } = await req.json();

    if (!xmlContent) {
      throw new Error('XML content is required');
    }

    console.log('Processing NF-e XML...');

    // Parse XML usando DOMParser
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, "text/xml");

    if (!xmlDoc) {
      throw new Error('Failed to parse XML');
    }

    // Verificar erros de parsing
    const parseError = xmlDoc.querySelector("parsererror");
    if (parseError) {
      throw new Error('Invalid XML format');
    }

    // Extrair dados da nota fiscal
    const nfeNode = xmlDoc.querySelector("NFe, nfeProc");
    if (!nfeNode) {
      throw new Error('NF-e structure not found in XML');
    }

    // Extrair informações da nota
    const nfNumber = xmlDoc.querySelector("ide nNF")?.textContent || '';
    const emissionDate = xmlDoc.querySelector("ide dhEmi")?.textContent?.split('T')[0] || new Date().toISOString().split('T')[0];
    const supplierName = xmlDoc.querySelector("emit xNome")?.textContent || 'Fornecedor Não Identificado';

    // Extrair produtos
    const items = xmlDoc.querySelectorAll("det");
    const processedItems = [];

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    for (const item of Array.from(items)) {
      const itemElement = item as Element;
      const productName = itemElement.querySelector("prod xProd")?.textContent || 'Produto sem nome';
      const quantity = parseFloat(itemElement.querySelector("prod qCom")?.textContent || '0');
      const unit = itemElement.querySelector("prod uCom")?.textContent || 'UN';
      const unitPrice = parseFloat(itemElement.querySelector("prod vUnCom")?.textContent || '0');
      const totalValue = parseFloat(itemElement.querySelector("prod vProd")?.textContent || '0');

      console.log(`Processing item: ${productName}, Quantity: ${quantity}, Unit: ${unit}, Price: ${unitPrice}`);

      // Verificar se o insumo já existe
      const { data: existingSupply } = await supabase
        .from('supplies')
        .select('*')
        .ilike('nome', productName)
        .maybeSingle();

      let supplyId: string;

      if (existingSupply) {
        // Atualizar estoque do insumo existente
        const newStock = existingSupply.quantidade_estoque + quantity;
        await supabase
          .from('supplies')
          .update({ 
            quantidade_estoque: newStock,
            preco_unitario: unitPrice,
            fornecedor: supplierName
          })
          .eq('id', existingSupply.id);
        
        supplyId = existingSupply.id;
        console.log(`Updated existing supply: ${productName}, new stock: ${newStock}`);
      } else {
        // Criar novo insumo
        const { data: newSupply, error: insertError } = await supabase
          .from('supplies')
          .insert({
            nome: productName,
            categoria: 'Importado de NF-e',
            quantidade_estoque: quantity,
            unidade_medida: unit,
            preco_unitario: unitPrice,
            fornecedor: supplierName,
            estoque_minimo: 0
          })
          .select()
          .single();

        if (insertError) throw insertError;
        supplyId = newSupply.id;
        console.log(`Created new supply: ${productName}`);
      }

      // Registrar a compra
      await supabase
        .from('supply_purchases')
        .insert({
          supply_id: supplyId,
          data_compra: emissionDate,
          quantidade: quantity,
          preco_unitario: unitPrice,
          valor_total: totalValue,
          fornecedor: supplierName,
          nota_fiscal: nfNumber,
          observacoes: 'Importado automaticamente de XML NF-e'
        });

      processedItems.push({
        nome: productName,
        quantidade: quantity,
        unidade: unit,
        valor_total: totalValue.toFixed(2)
      });
    }

    console.log(`Successfully processed ${processedItems.length} items from NF-e`);

    return new Response(
      JSON.stringify({
        success: true,
        itemsProcessed: processedItems.length,
        details: processedItems,
        nfNumber,
        supplier: supplierName
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error processing NF-e XML:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error processing XML file';
    return new Response(
      JSON.stringify({
        success: false,
        message: errorMessage
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
