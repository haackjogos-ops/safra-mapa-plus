import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { produto, regiao = "Brasil" } = await req.json();

    if (!produto) {
      return new Response(
        JSON.stringify({ error: 'Produto é obrigatório' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Buscando preços para: ${produto} em ${regiao}`);

    const systemPrompt = `Você é um assistente especializado em preços de insumos agrícolas no Brasil. 
Forneça informações atualizadas e precisas sobre preços de mercado, incluindo:
- Preço médio atual em R$
- Unidade de medida
- Variação recente (se houver)
- Fonte de informação (CEPEA, ESALQ, etc)
- Região de referência
- Data de referência

Responda em formato JSON com a seguinte estrutura:
{
  "produto": "nome do produto",
  "preco_medio": numero,
  "unidade": "unidade de medida",
  "variacao_percentual": numero ou null,
  "fonte": "fonte da informação",
  "regiao": "região",
  "data_referencia": "data no formato YYYY-MM-DD",
  "observacoes": "informações adicionais relevantes"
}`;

    const userPrompt = `Busque o preço atual de mercado para: ${produto} na região: ${regiao}. 
Retorne apenas o JSON com as informações, sem texto adicional.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 1000,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar informações de preços' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    console.log('OpenAI response:', data);

    const priceInfo = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify({ success: true, data: priceInfo }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in search-market-prices function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
