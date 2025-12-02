import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { lucroLiquido, margemLiquida, fluxoNegativo, sazonalidade, isPro } = await req.json();

    let distribution = {
      retirada: 50,
      reinvestimento: 30,
      reserva: 20,
      explicacao: "",
      alertas: [] as string[]
    };

    // Análise básica para plano Básico
    if (fluxoNegativo) {
      distribution = {
        retirada: 30,
        reinvestimento: 40,
        reserva: 30,
        explicacao: "Seu fluxo de caixa está negativo nos últimos 30 dias. Recomendamos reduzir retiradas e priorizar reserva para estabilizar o negócio.",
        alertas: ["⚠️ Fluxo de caixa negativo detectado"]
      };
    } else if (margemLiquida >= 30) {
      distribution = {
        retirada: 60,
        reinvestimento: 25,
        reserva: 15,
        explicacao: "Excelente! Sua margem líquida de " + margemLiquida.toFixed(1) + "% permite retiradas maiores mantendo saúde financeira.",
        alertas: []
      };
    } else if (margemLiquida >= 15) {
      distribution = {
        retirada: 50,
        reinvestimento: 30,
        reserva: 20,
        explicacao: "Margem saudável de " + margemLiquida.toFixed(1) + "%. Distribuição equilibrada recomendada.",
        alertas: []
      };
    } else if (margemLiquida >= 5) {
      distribution = {
        retirada: 30,
        reinvestimento: 40,
        reserva: 30,
        explicacao: "Margem baixa de " + margemLiquida.toFixed(1) + "%. Priorize reinvestimento e reserva para melhorar resultados.",
        alertas: ["⚠️ Margem de lucro abaixo do ideal"]
      };
    } else {
      distribution = {
        retirada: 10,
        reinvestimento: 50,
        reserva: 40,
        explicacao: "Margem crítica de " + margemLiquida.toFixed(1) + "%. Minimize retiradas e foque em melhorar eficiência operacional.",
        alertas: ["🚨 Margem crítica - ação imediata necessária"]
      };
    }

    // Análise adicional para PRO (sazonalidade)
    if (isPro && sazonalidade && sazonalidade.length > 0) {
      const ultimosMeses = sazonalidade.slice(-3);
      const mediaMeses = ultimosMeses.reduce((acc: number, m: any) => acc + m.receita, 0) / ultimosMeses.length;
      const mesAtual = sazonalidade[sazonalidade.length - 1];
      
      if (mesAtual.receita < mediaMeses * 0.8) {
        distribution.explicacao += " Detectamos queda sazonal de receita. Considere aumentar reserva temporariamente.";
        distribution.reserva += 5;
        distribution.retirada -= 5;
      }
    }

    return new Response(
      JSON.stringify({ distribution }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erro na análise:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
