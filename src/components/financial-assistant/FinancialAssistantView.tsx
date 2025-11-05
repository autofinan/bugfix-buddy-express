import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedFinancialOverview } from "./EnhancedFinancialOverview";
import { SmartInsights } from "./SmartInsights";
import { ProfitDistribution } from "./ProfitDistribution";
import { FinancialAlerts } from "./FinancialAlerts";
import { FinancialChat } from "./FinancialChat";
import { CategoryAnalysis } from "./CategoryAnalysis";
import { Brain, TrendingUp, PieChart, Bell, MessageSquare } from "lucide-react";

export default function FinancialAssistantView() {
  return (
    <div className="w-full space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate">Assistente Financeiro Inteligente</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Entenda seus lucros e tome decisões inteligentes
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6 w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1 h-auto p-1">
          <TabsTrigger value="overview" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 py-2">
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate">Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 py-2">
            <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate">Chat IA</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 py-2">
            <Brain className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate">Análises</span>
          </TabsTrigger>
          <TabsTrigger value="distribution" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 py-2">
            <PieChart className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate">Distribuição</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 py-2">
            <Bell className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate">Alertas</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 sm:space-y-6 mt-0">
          <EnhancedFinancialOverview />
        </TabsContent>

        <TabsContent value="chat" className="space-y-4 sm:space-y-6 mt-0">
          <FinancialChat />
        </TabsContent>

        <TabsContent value="insights" className="space-y-4 sm:space-y-6 mt-0">
          <SmartInsights />
          <CategoryAnalysis />
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4 sm:space-y-6 mt-0">
          <ProfitDistribution />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4 sm:space-y-6 mt-0">
          <FinancialAlerts />
        </TabsContent>
      </Tabs>
    </div>
  );
}
