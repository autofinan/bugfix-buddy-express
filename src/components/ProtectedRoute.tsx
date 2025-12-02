import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: keyof ReturnType<typeof useAuth>['permissions'];
  requireOwner?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requiredPermission,
  requireOwner = false 
}: ProtectedRouteProps) {
  const { permissions, isOwner, loading } = useAuth();
  const { toast } = useToast();
  const location = useLocation();

  useEffect(() => {
    if (!loading && (
      (requireOwner && !isOwner) ||
      (requiredPermission && !permissions[requiredPermission])
    )) {
      toast({
        title: "Acesso Negado",
        description: "Você não tem permissão para acessar esta página.",
        variant: "destructive",
        duration: 3000,
      });
    }
  }, [loading, isOwner, permissions, requiredPermission, requireOwner, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (requireOwner && !isOwner) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (requiredPermission && !permissions[requiredPermission]) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
