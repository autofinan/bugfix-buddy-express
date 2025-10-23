import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CategoryForm } from "./CategoryForm";
import { Plus, Edit, Trash2, FolderOpen } from "lucide-react";
import * as LucideIcons from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ServiceCategory {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  is_default: boolean;
  estimated_profit_margin: number | null;
  created_at: string;
}

export function CategoryManager() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("service_categories")
        .select("*")
        .order("is_default", { ascending: false })
        .order("name");

      if (error) throw error;

      if (!data || data.length === 0) {
        await createDefaultCategories();
        return;
      }

      setCategories(data);
    } catch (error: any) {
      console.error("Erro ao buscar categorias:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar categorias",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createDefaultCategories = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { error } = await supabase.rpc("create_default_service_categories", {
        user_id: user.user.id
      });

      if (error) throw error;

      await fetchCategories();
    } catch (error: any) {
      console.error("Erro ao criar categorias padrão:", error);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from("service_categories")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Categoria excluída com sucesso!"
      });

      fetchCategories();
    } catch (error: any) {
      console.error("Erro ao excluir categoria:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir categoria",
        variant: "destructive"
      });
    } finally {
      setDeleteId(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">Carregando categorias...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-primary" />
              Categorias de Serviços
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {categories.length} {categories.length === 1 ? "categoria" : "categorias"} cadastrada(s)
            </p>
          </div>
          <Button onClick={() => {
            setEditingCategory(null);
            setShowForm(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Categoria
          </Button>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-8">
              <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma categoria cadastrada</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setShowForm(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar primeira categoria
              </Button>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => {
                const IconComponent = (LucideIcons as any)[category.icon] || LucideIcons.Briefcase;

                return (
                  <Card key={category.id} className="card-hover">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: category.color }}
                        >
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold truncate">{category.name}</h4>
                            {category.is_default && (
                              <Badge variant="secondary" className="text-xs">
                                Padrão
                              </Badge>
                            )}
                          </div>
                          {category.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {category.description}
                            </p>
                          )}
                          {category.estimated_profit_margin && (
                            <p className="text-xs text-green-600 font-medium">
                              Margem: {category.estimated_profit_margin}%
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setEditingCategory(category);
                            setShowForm(true);
                          }}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Editar
                        </Button>
                        {!category.is_default && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteId(category.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <CategoryForm
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) setEditingCategory(null);
        }}
        onSave={fetchCategories}
        categoryToEdit={editingCategory}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.
              Os serviços desta categoria não serão excluídos, apenas ficarão sem categoria.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
