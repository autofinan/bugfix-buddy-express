import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Sparkles } from "lucide-react";
import { FinanceAnalyzer, type FinancialData } from "@/services/financeAnalyzer";
import { FinancialSnapshotService, type FinancialSnapshot } from "@/services/financialSnapshot";
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
  const [financialData, setFinancialData] = useState<FinancialSnapshot | null>(null);
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

      const snapshot = await FinancialSnapshotService.getSnapshot(user.id);
      setFinancialData(snapshot);
    } catch (error) {
      console.error("Erro ao carregar dados financeiros:", error);
    }
  };

  const quickQuestions = [
    "Como estão minhas finanças?",
    "Qual meu ponto de equilíbrio?",
    "Dicas para economizar",
    "Análise de sazonalidade",
    "Projeção próximo mês"
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const streamAIResponse = async (userMessage: string) => {
    if (!financialData) {
      return "Ainda estou carregando seus dados financeiros. Aguarde um momento...";
    }

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/financial-chat`;
      
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: messages
            .filter(m => m.role !== "assistant" || m !== messages[0])
            .concat([{ role: "user", content: userMessage }]),
          financialData,
        }),
      });

      if (!response.ok || !response.body) {
        if (response.status === 429) {
          throw new Error("Limite de requisições excedido. Tente novamente em alguns segundos.");
        }
        if (response.status === 402) {
          throw new Error("Créditos da IA esgotados. Entre em contato com o suporte.");
        }
        throw new Error("Falha ao conectar com a IA");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";
      let buffer = "";

      const assistantMessage: Message = { role: "assistant", content: "" };
      setMessages(prev => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              accumulatedText += content;
              setMessages(prev => {
                const newMessages = [...prev];
                const lastMsg = newMessages[newMessages.length - 1];
                if (lastMsg.role === "assistant") {
                  lastMsg.content = accumulatedText;
                }
                return newMessages;
              });
            }
          } catch (e) {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      return accumulatedText;
    } catch (error) {
      console.error("Error streaming AI response:", error);
      throw error;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      await streamAIResponse(userMessage.content);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao processar sua pergunta";
      toast.error(errorMessage);
      setMessages(prev => prev.slice(0, -1));
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
