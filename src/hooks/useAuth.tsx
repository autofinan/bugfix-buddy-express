import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserRole {
  role: 'owner' | 'employee';
}

interface AuthData {
  user: any;
  role: 'owner' | 'employee';
  isOwner: boolean;
  isEmployee: boolean;
  loading: boolean;
  permissions: {
    canViewRevenue: boolean;
    canViewReports: boolean;
    canViewFinancialAssistant: boolean;
    canViewExpenses: boolean;
    canAccessSettings: boolean;
    canAdjustStock: boolean;
    canDeleteSales: boolean;
    canManageProducts: boolean;
    canMakeSales: boolean;
  };
}

export function useAuth(): AuthData {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        if (currentUser) {
          setUser(currentUser);
          
          // Buscar role da tabela user_roles (seguro via RLS)
          const { data: roleData, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', currentUser.id)
            .maybeSingle();

          if (error) {
            console.error('Erro ao buscar role:', error);
            // Aguardar um pouco e tentar novamente (pode estar sendo criado pelo trigger)
            setTimeout(async () => {
              const { data: retryData } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', currentUser.id)
                .maybeSingle();
              
              setUserRole(retryData || { role: 'employee' });
            }, 1000);
          } else {
            setUserRole(roleData || { role: 'employee' });
          }
        }
      } catch (error) {
        console.error('Erro na autenticação:', error);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Escutar mudanças de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        // Recarregar role quando usuário mudar
        setTimeout(() => {
          supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .maybeSingle()
            .then(({ data }) => {
              setUserRole(data || { role: 'employee' });
            });
        }, 500);
      } else {
        setUser(null);
        setUserRole(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const role = userRole?.role || 'owner';
  const isOwner = role === 'owner';
  const isEmployee = role === 'employee';

  const permissions = {
    // Owner vê tudo, Employee tem restrições
    canViewRevenue: isOwner,
    canViewReports: isOwner,
    canViewFinancialAssistant: isOwner,
    canViewExpenses: isOwner,
    canAccessSettings: isOwner,
    canAdjustStock: true, // Ambos podem ajustar estoque
    canDeleteSales: isOwner,
    canManageProducts: true, // Ambos podem gerenciar produtos
    canMakeSales: true, // Ambos podem fazer vendas
  };

  return {
    user,
    role,
    isOwner,
    isEmployee,
    loading,
    permissions
  };
}
