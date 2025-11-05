import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Sparkles } from "lucide-react";
import { FinanceAnalyzer, type FinancialData } from "@/services/financeAnalyzer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function FinancialChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 Olá! Sou seu assistente financeiro. Pergunte-me sobre suas finanças, lucros, despesas ou peça sugestões para melhorar seus resultados!"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadFinancialData();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadFinancialData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const analyzer = new FinanceAnalyzer(user.id);
      const data = await analyzer.analyze();
      setFinancialData(data);
    } catch (error) {
      console.error("Erro ao carregar dados financeiros:", error);
    }
  };

  const quickQuestions = [
    "Gastei muito esse mês?",
    "Qual categoria mais lucra?",
    "Como aumentar meu lucro?",
    "Estou no caminho certo?"
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const generateResponse = (question: string): string => {
    if (!financialData) {
      return "Ainda estou carregando seus dados financeiros. Aguarde um momento...";
    }

    const lowerQuestion = question.toLowerCase();

    // Análise de gastos
    if (lowerQuestion.includes("gastei") || lowerQuestion.includes("gasto")) {
      const totalGasto = financialData.custos + financialData.despesas;
      const percentualGasto = financialData.receita > 0 
        ? (totalGasto / financialData.receita) * 100 
        : 0;

      if (percentualGasto > 70) {
        return `⚠️ Sim, seus gastos estão elevados. Você gastou ${formatCurrency(totalGasto)} (${percentualGasto.toFixed(0)}% da receita). \n\n💡 Recomendação: Revise despesas fixas e negocie com fornecedores para reduzir custos em pelo menos 10%.`;
      } else {
        return `✅ Seus gastos estão controlados! Você gastou ${formatCurrency(totalGasto)} (${percentualGasto.toFixed(0)}% da receita). Continue assim!`;
      }
    }

    // Categorias que mais lucram
    if (lowerQuestion.includes("categoria") || lowerQuestion.includes("lucra")) {
      const topReceitas = financialData.categorias_top.filter(c => c.type === "receita");
      if (topReceitas.length === 0) {
        return "Ainda não tenho dados suficientes sobre suas vendas por categoria.";
      }

      const top = topReceitas[0];
      return `🏆 A categoria que mais vende é "${top.name}" com ${formatCurrency(top.value)} (${top.percentage.toFixed(0)}% do total).\n\n💡 Dica: Invista mais marketing nesta categoria para maximizar seus lucros.`;
    }

    // Como aumentar lucro
    if (lowerQuestion.includes("aumentar") || lowerQuestion.includes("melhorar") || lowerQuestion.includes("lucro")) {
      const sugestoes = [];
      
      if (financialData.margem < 25) {
        sugestoes.push("• Aumente seus preços em 5-8% — a maioria dos clientes aceita");
      }
      
      if (financialData.despesas / financialData.receita > 0.4) {
        sugestoes.push("• Reduza despesas fixas em 10% (renegocie contratos)");
      }

      sugestoes.push("• Foque nos produtos com maior margem de lucro");
      sugestoes.push("• Elimine produtos que vendem pouco e dão pouco lucro");

      return `💰 Para aumentar seu lucro:\n\n${sugestoes.join("\n")}\n\n📊 Impacto estimado: +15-20% no lucro líquido`;
    }

    // Caminho certo
    if (lowerQuestion.includes("caminho") || lowerQuestion.includes("indo bem")) {
      if (financialData.tendencia === "positiva") {
        return `✅ Sim, você está no caminho certo!\n\n• Receita em crescimento: +${financialData.crescimento_receita.toFixed(1)}%\n• Lucro líquido: ${formatCurrency(financialData.lucro_liquido)}\n• Margem: ${financialData.margem.toFixed(1)}%\n\n${financialData.benchmark.status === "acima" ? "🎯 Sua margem está acima da média histórica!" : ""}`;
      } else {
        return `⚠️ Há espaço para melhorar:\n\n• Lucro atual: ${formatCurrency(financialData.lucro_liquido)}\n• Margem: ${financialData.margem.toFixed(1)}%\n\n💡 Recomendação: ${financialData.alertas[0]?.action || "Revise custos e preços"}`;
      }
    }

    // Resposta genérica
    return `📊 Aqui está um resumo:\n\n• Receita: ${formatCurrency(financialData.receita)}\n• Lucro: ${formatCurrency(financialData.lucro_liquido)}\n• Margem: ${financialData.margem.toFixed(1)}%\n• Tendência: ${financialData.tendencia === "positiva" ? "📈 Positiva" : financialData.tendencia === "negativa" ? "📉 Negativa" : "➡️ Neutra"}\n\nPergunta algo mais específico para eu te ajudar melhor!`;
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simula processamento
      const response = generateResponse(input);
      const assistantMessage: Message = { role: "assistant", content: response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast.error("Erro ao processar sua pergunta");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
          <span>Chat Financeiro Inteligente</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {quickQuestions.map((q, i) => (
            <Badge
              key={i}
              variant="outline"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs sm:text-sm px-2 py-1"
              onClick={() => handleQuickQuestion(q)}
            >
              {q}
            </Badge>
          ))}
        </div>

        <ScrollArea ref={scrollRef} className="h-[300px] sm:h-[400px] w-full rounded-lg border p-3 sm:p-4">
          <div className="space-y-3 sm:space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`rounded-lg px-3 py-2 sm:px-4 max-w-[85%] sm:max-w-[80%] text-sm sm:text-base ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 inline mr-2" />
                  )}
                  <span className="whitespace-pre-line">{msg.content}</span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-3 py-2 sm:px-4 text-sm sm:text-base">
                  <span className="animate-pulse">Analisando...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2">
          <Input
            placeholder="Pergunte algo..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            disabled={loading}
            className="text-sm sm:text-base"
          />
          <Button onClick={handleSend} disabled={loading || !input.trim()} size="icon" className="flex-shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
