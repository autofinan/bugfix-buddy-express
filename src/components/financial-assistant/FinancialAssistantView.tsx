import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinancialOverview } from "./FinancialOverview";
import { SmartInsights } from "./SmartInsights";
import { ProfitDistribution } from "./ProfitDistribution";
import { FinancialAlerts } from "./FinancialAlerts";
import { Brain, TrendingUp, PieChart, Bell } from "lucide-react";

export default function FinancialAssistantView() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Assistente Financeiro Inteligente</h1>
          <p className="text-muted-foreground">
            Entenda seus lucros, organize reinvestimentos e tome decisões financeiras inteligentes
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Análises
          </TabsTrigger>
          <TabsTrigger value="distribution" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Distribuição
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Alertas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <FinancialOverview />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <SmartInsights />
        </TabsContent>

        <TabsContent value="distribution" className="space-y-6">
          <ProfitDistribution />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <FinancialAlerts />
        </TabsContent>
      </Tabs>
    </div>
  );
}
