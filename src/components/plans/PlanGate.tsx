import { ReactNode } from "react";
import { usePlan } from "@/hooks/usePlan";
import { PremiumPreview } from "./PremiumPreview";

interface PlanGateProps {
  children: ReactNode;
  feature: 'reports' | 'sazonalidade' | 'abc' | 'dre' | 'cash_flow' | 'break_even' | 'pricing' | 'distribution' | 'chat_unlimited' | 'watermark_free' | 'whatsapp_nf' | 'overview_full' | 'abc_full' | 'dre_full' | 'cash_flow_full' | 'analyses_full' | 'alerts_full' | 'csv_import';
  featureName: string;
  featureDescription: string;
  requiredPlan?: 'basic' | 'pro';
  showPreview?: boolean;
  previewContent?: ReactNode;
  fallbackContent?: ReactNode; // Conteúdo alternativo para versões básicas
}

export function PlanGate({ 
  children, 
  feature, 
  featureName, 
  featureDescription,
  requiredPlan = 'pro',
  showPreview = true,
  previewContent,
  fallbackContent
}: PlanGateProps) {
  const { canUseFeature, loading } = usePlan();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!canUseFeature(feature)) {
    // Se tem fallback, mostra conteúdo alternativo (versão básica)
    if (fallbackContent) {
      return <>{fallbackContent}</>;
    }
    
    // Senão, mostra preview com upgrade
    if (showPreview) {
      return (
        <PremiumPreview 
          featureName={featureName}
          description={featureDescription}
          requiredPlan={requiredPlan}
          previewContent={previewContent}
        />
      );
    }
    return null;
  }

  return <>{children}</>;
}
