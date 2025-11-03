import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, UserPlus, Mail, ShieldCheck, ShieldAlert } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Employee {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  email?: string;
}

export default function EmployeeManagement() {
  const { isOwner, loading: authLoading } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && isOwner) {
      fetchEmployees();
    }
  }, [isOwner, authLoading]);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('role', 'employee')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setEmployees(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar funcionários:', error);
      toast({
        title: "Erro ao carregar funcionários",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInviteEmployee = async () => {
    if (!inviteEmail.trim()) {
      toast({
        title: "Erro",
        description: "Digite um e-mail válido",
        variant: "destructive"
      });
      return;
    }

    setInviting(true);

    try {
      // Criar usuário no Supabase Auth com signUp
      // O trigger handle_new_user_role() irá automaticamente criar a role 'employee'
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: inviteEmail,
        password: Math.random().toString(36).slice(-12) + 'A1!', // Senha temporária forte
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            invited_as: 'employee'
          }
        }
      });

      if (authError) {
        // Se o erro for que o usuário já existe, informar de forma amigável
        if (authError.message.includes('already registered')) {
          throw new Error('Este e-mail já está cadastrado no sistema');
        }
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Não foi possível criar o convite');
      }

      toast({
        title: "Funcionário convidado com sucesso",
        description: `Um e-mail foi enviado para ${inviteEmail}. O funcionário deve confirmar o e-mail e definir uma senha para acessar o sistema.`,
      });

      setInviteEmail("");
      
      // Aguardar um pouco antes de recarregar a lista para dar tempo do trigger executar
      setTimeout(() => {
        fetchEmployees();
      }, 1000);
    } catch (error: any) {
      console.error('Erro ao convidar funcionário:', error);
      toast({
        title: "Erro ao convidar",
        description: error.message || "Não foi possível enviar o convite",
        variant: "destructive"
      });
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveEmployee = async (userId: string, email: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'employee');

      if (error) throw error;

      toast({
        title: "Funcionário removido",
        description: `${email} foi removido do sistema`,
      });

      fetchEmployees();
    } catch (error: any) {
      console.error('Erro ao remover funcionário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o funcionário",
        variant: "destructive"
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <ShieldAlert className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Acesso Negado</h2>
              <p className="text-muted-foreground">
                Apenas o proprietário do negócio pode gerenciar funcionários.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Gerenciar Funcionários</h1>
        <p className="text-muted-foreground">
          Adicione ou remova funcionários que terão acesso limitado ao sistema.
        </p>
      </div>

      {/* Card de Adicionar Funcionário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Adicionar Novo Funcionário
          </CardTitle>
          <CardDescription>
            Digite o e-mail do funcionário. Um convite será enviado para criar a conta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="email">E-mail do Funcionário</Label>
              <Input
                id="email"
                type="email"
                placeholder="funcionario@exemplo.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleInviteEmployee()}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleInviteEmployee} disabled={inviting}>
                {inviting ? "Enviando..." : "Convidar"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Funcionários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Funcionários Ativos ({employees.length})
          </CardTitle>
          <CardDescription>
            Funcionários têm acesso ao PDV, Vendas, Produtos e Estoque.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {employees.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum funcionário cadastrado ainda.</p>
              <p className="text-sm">Convide funcionários usando o formulário acima.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {employees.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{employee.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Adicionado em {new Date(employee.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remover
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remover Funcionário</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja remover <strong>{employee.email}</strong>?
                          <br />
                          <br />
                          Esta pessoa perderá acesso ao sistema imediatamente.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRemoveEmployee(employee.user_id, employee.email || '')}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Confirmar Remoção
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card Informativo */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm">
            <h3 className="font-semibold text-primary">ℹ️ Sobre Permissões de Funcionários</h3>
            <ul className="space-y-1 text-muted-foreground ml-4">
              <li>✅ <strong>Podem acessar:</strong> PDV, Vendas, Produtos, Serviços, Estoque</li>
              <li>❌ <strong>NÃO podem acessar:</strong> Despesas, Relatórios, Assistente Financeiro, Configurações</li>
              <li>🔒 Funcionários não veem informações financeiras como receita e lucro</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
