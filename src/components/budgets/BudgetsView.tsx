import React, { useState } from 'react';
import { Plus, Search, Eye, Edit, Trash2, Users, FileText } from 'lucide-react';
import { useBudgets, useDeleteBudget } from '@/hooks/useBudgets';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const BudgetsView = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const { data: budgets, isLoading, error } = useBudgets(searchTerm);
  const deleteBudget = useDeleteBudget();

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground">
            Você precisa estar logado para acessar os orçamentos.
          </p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="default">Aberto</Badge>;
      case 'converted':
        return <Badge variant="secondary">Convertido</Badge>;
      case 'canceled':
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <FileText className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h2 className="text-lg font-semibold mb-2">Erro ao Carregar</h2>
          <p className="text-muted-foreground">
            Não foi possível carregar os orçamentos. Tente novamente.
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
            variant="outline"
          >
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Orçamentos</h1>
          <p className="text-muted-foreground">
            Gerencie seus orçamentos de forma segura
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Orçamento
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Orçamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Buscar por ID ou notas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : budgets?.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum orçamento encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? 'Não encontramos orçamentos com os termos pesquisados.'
                  : 'Você ainda não criou nenhum orçamento.'
                }
              </p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Orçamento
              </Button>
            </CardContent>
          </Card>
        ) : (
          budgets?.map((budget) => (
            <Card key={budget.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-muted-foreground">
                        #{budget.id.slice(-8)}
                      </div>
                      {getStatusBadge(budget.status)}
                      {budget.has_customer_info && (
                        <Badge variant="outline" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          Cliente
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(budget.total)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(budget.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                      </div>
                    </div>

                    {budget.has_customer_info && (
                      <div className="text-sm text-muted-foreground space-y-1">
                        {budget.customer_name_masked && (
                          <div>Cliente: {budget.customer_name_masked}</div>
                        )}
                        {budget.customer_email_masked && (
                          <div>Email: {budget.customer_email_masked}</div>
                        )}
                      </div>
                    )}

                    {budget.notes && (
                      <div className="text-sm text-muted-foreground">
                        <strong>Notas:</strong> {budget.notes}
                      </div>
                    )}

                    {budget.valid_until && (
                      <div className="text-sm text-muted-foreground">
                        <strong>Válido até:</strong> {format(new Date(budget.valid_until), 'dd/MM/yyyy', { locale: ptBR })}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      title="Ver detalhes"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    {budget.status === 'open' && (
                      <Button
                        variant="outline"
                        size="sm"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          title="Excluir"
                          className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir este orçamento? Esta ação não pode ser desfeita.
                            {budget.has_customer_info && (
                              <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-yellow-800 dark:text-yellow-200 text-sm">
                                ⚠️ Este orçamento contém dados do cliente que serão permanentemente removidos.
                              </div>
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteBudget.mutate(budget.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {budgets && budgets.length > 0 && (
        <div className="text-center text-sm text-muted-foreground mt-8">
          🔒 Os dados dos clientes são protegidos e mascarados por segurança.
          <br />
          Apenas proprietários podem ver informações completas do cliente.
        </div>
      )}
    </div>
  );
};

export default BudgetsView;