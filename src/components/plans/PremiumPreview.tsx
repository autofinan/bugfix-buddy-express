import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ReactNode } from "react";

interface PremiumPreviewProps {
  featureName: string;
  description: string;
  requiredPlan: 'basic' | 'pro';
  previewContent?: ReactNode;
}

export function PremiumPreview({ featureName, description, requiredPlan, previewContent }: PremiumPreviewProps) {
  const planInfo = {
    basic: {
      name: "Básico",
      price: "R$ 19,90",
      color: "bg-blue-500"
    },
    pro: {
      name: "Pro",
      price: "R$ 29,90",
      color: "bg-purple-500"
    }
  };

  const plan = planInfo[requiredPlan];

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">{featureName}</CardTitle>
            <Badge variant="secondary">
              <Crown className="h-3 w-3 mr-1" />
              Plano {plan.name}
            </Badge>
          </div>
          <CardDescription className="text-base mt-2">
            {description}
          </CardDescription>
        </CardHeader>
      </Card>

      {previewContent ? (
        <div className="relative">
          <div className="opacity-50 pointer-events-none blur-sm">
            {previewContent}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Card className="max-w-md border-2 border-primary shadow-lg">
              <CardContent className="pt-6 space-y-4 text-center">
                <div className="flex justify-center">
                  <div className={`${plan.color} p-3 rounded-full`}>
                    <Crown className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-lg mb-2">
                    Recurso disponível no Plano {plan.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Atualize seu plano para ver seus dados reais e ter acesso completo a este recurso.
                  </p>
                </div>
                <Button 
                  size="lg"
                  className="w-full"
                  onClick={() => window.open('/settings?tab=plans', '_self')}
                >
                  <Crown className="mr-2 h-4 w-4" />
                  Quero desbloquear este recurso
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-64" />
          
          <Card className="border-2 border-dashed border-muted-foreground/20 bg-muted/20">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <p className="text-sm font-medium">
                  Recurso disponível apenas no Plano {plan.name}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Atualize seu plano para ver seus dados reais e ter acesso completo a análises e insights inteligentes.
              </p>

              <Button 
                className="w-full" 
                size="lg"
                onClick={() => window.open('/settings?tab=plans', '_self')}
              >
                <Crown className="mr-2 h-5 w-5" />
                Desbloquear no Plano {plan.name} • {plan.price}/mês
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Faça upgrade a qualquer momento e cancele quando quiser
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
