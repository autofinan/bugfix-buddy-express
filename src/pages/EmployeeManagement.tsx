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
  const [email, setEmail] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && isOwner) {
      fetchEmployees();
    }
  }, [isOwner, authLoading]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      
      // Buscar ID do owner atual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }
      
      // Buscar apenas funcionários criados por este owner
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('role', 'employee')
        .eq('created_by', user.id)
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

  const handleCreateEmployee = async () => {
    if (!email.trim() || !tempPassword.trim() || !name.trim()) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive"
      });
      return;
    }

    if (tempPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter no mínimo 6 caracteres",
        variant: "destructive"
      });
      return;
    }

    setCreating(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Você precisa estar autenticado');
      }

      // Buscar ID do owner atual
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        throw new Error('Usuário não autenticado');
      }

      const response = await fetch('https://rllpfnmhelrnombjyiuz.supabase.co/functions/v1/create-employee', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: tempPassword,
          name: name.trim(),
          created_by: currentUser.id
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar funcionário');
      }

      toast({
        title: "Funcionário criado com sucesso",
        description: `${name} foi criado. Passe as credenciais para ele fazer login.`,
      });

      setEmail("");
      setTempPassword("");
      setName("");
      
      fetchEmployees();
    } catch (error: any) {
      console.error('Erro ao criar funcionário:', error);
      toast({
        title: "Erro ao criar funcionário",
        description: error.message || "Não foi possível criar o funcionário",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
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
      <div className="w-full">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="w-full">
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
    <div className="w-full space-y-6 min-h-screen">
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
            Crie as credenciais de acesso para o funcionário.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Nome Completo</Label>
            <Input
              id="name"
              placeholder="João Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="funcionario@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="password">Senha Temporária</Label>
            <Input
              id="password"
              type="text"
              placeholder="Crie uma senha temporária"
              value={tempPassword}
              onChange={(e) => setTempPassword(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Mínimo 6 caracteres. Passe essa senha para o funcionário trocar no primeiro acesso.
            </p>
          </div>
          
          <Button 
            onClick={handleCreateEmployee}
            disabled={!email || !tempPassword || !name || tempPassword.length < 6 || creating}
            className="w-full"
          >
            {creating ? "Criando..." : "Criar Funcionário"}
          </Button>
          
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 <strong>Importante:</strong> Anote ou envie as credenciais para o funcionário por WhatsApp, SMS ou pessoalmente.
              Ele poderá trocar a senha no primeiro acesso.
            </p>
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
