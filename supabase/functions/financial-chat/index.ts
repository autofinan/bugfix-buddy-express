// Edge runtime types

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, financialData } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "messages array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Criar sistema de contexto financeiro
    const systemPrompt = `Você é um assistente financeiro especializado para MEI (Microempreendedor Individual) brasileiro.

Dados Financeiros do Usuário:
${financialData ? JSON.stringify(financialData, null, 2) : "Dados não disponíveis"}

Suas responsabilidades:
1. Analisar a saúde financeira usando os dados fornecidos
2. Responder perguntas sobre lucro, despesas, receita e margens
3. Sugerir melhorias práticas e acionáveis
4. Alertar sobre riscos financeiros
5. Explicar conceitos de forma simples

Dados Disponíveis:
- Receita total, CPV, despesas fixas e variáveis
- Lucros (bruto, operacional, líquido) e margens
- Ponto de equilíbrio (atingido ou não)
- Produtos mais vendidos e produtos parados
- Fluxo de caixa dos últimos 90 dias
- Sazonalidade dos últimos 12 meses
- DAS estimado

Sempre:
- Use os dados reais fornecidos
- Forneça números concretos com base nos dados
- Seja direto e prático
- Use linguagem simples
- Sugira ações específicas quando relevante

Nunca:
- Invente números
- Faça suposições sem dados
- Dê conselhos genéricos sem contexto`;

    const fullMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    console.log("Calling AI Gateway...");
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: fullMessages,
        temperature: 0.7,
        max_tokens: 1500,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("AI Gateway error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to get AI response" }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Stream the response
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in financial-chat:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
