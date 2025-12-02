import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings as SettingsIcon, Crown } from "lucide-react";
import { PaymentFeesSettings } from "@/components/settings/PaymentFeesSettings";
import { GeneralSettings } from "@/components/settings/GeneralSettings";
import { PlansManagement } from "@/components/plans/PlansManagement";
import { useSearchParams } from "react-router-dom";

export default function Settings() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'general';

  return (
    <div className="space-y-6 p-6 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <SettingsIcon className="h-8 w-8" />
            Configurações
          </h1>
          <p className="text-muted-foreground">Gerencie as configurações do sistema</p>
        </div>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList>
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="plans">
            <Crown className="h-4 w-4 mr-2" />
            Planos
          </TabsTrigger>
          <TabsTrigger value="fees">Taxas de Pagamento</TabsTrigger>
          <TabsTrigger value="notifications" disabled>Notificações (Em breve)</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="mt-6">
          <GeneralSettings />
        </TabsContent>

        <TabsContent value="plans" className="mt-6">
          <PlansManagement />
        </TabsContent>
        
        <TabsContent value="fees" className="mt-6">
          <PaymentFeesSettings />
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
              <CardDescription>Em desenvolvimento...</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
