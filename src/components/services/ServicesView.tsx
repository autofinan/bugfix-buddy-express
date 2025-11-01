import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ServiceForm } from "./ServiceForm";
import { CategoryManager } from "./CategoryManager";
import { Plus, Search, Edit, Trash2, Package, FolderOpen } from "lucide-react";
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

interface Service {
  id: string;
  name: string;
  description: string | null;
  category_id: string | null;
  price: number;
  duration: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  service_categories?: {
    name: string;
    color: string;
    icon: string;
  } | null;
}

export default function ServicesView() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("services")
        .select(`
          *,
          service_categories (
            name,
            color,
            icon
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setServices((data as any) || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar serviços",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;

      toast({
        title: "Serviço excluído",
        description: "Serviço excluído com sucesso!",
      });
      fetchServices();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir serviço",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
    }
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(undefined);
  };

  const handleFormSuccess = () => {
    handleCloseForm();
    fetchServices();
  };

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.service_categories?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeServices = filteredServices.filter(s => s.is_active);
  const inactiveServices = filteredServices.filter(s => !s.is_active);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Serviços</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus serviços e categorias
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Serviço
        </Button>
      </div>

      <Tabs defaultValue="services" className="space-y-6">
        <TabsList>
          <TabsTrigger value="services" className="gap-2">
            <Package className="h-4 w-4" />
            Serviços ({services.length})
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            <FolderOpen className="h-4 w-4" />
            Categorias
          </TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar serviços..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Carregando serviços...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Nenhum serviço encontrado</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeServices.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead className="text-right">Preço</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{service.name}</div>
                          {service.description && (
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {service.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {service.service_categories ? (
                          <Badge
                            variant="outline"
                            className="gap-1.5"
                            style={{
                              borderColor: service.service_categories.color,
                              color: service.service_categories.color
                            }}
                          >
                            {(() => {
                              const IconComponent = (LucideIcons as any)[service.service_categories.icon] || LucideIcons.Briefcase;
                              return <IconComponent className="h-3 w-3" />;
                            })()}
                            {service.service_categories.name}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            Sem categoria
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{service.duration || "-"}</TableCell>
                      <TableCell className="text-right font-medium">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(service.price)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">Ativo</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(service.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteId(service.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {inactiveServices.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Serviços Inativos
                </h3>
                <Table>
                  <TableBody>
                    {inactiveServices.map((service) => (
                      <TableRow key={service.id} className="opacity-60">
                        <TableCell>
                          <div className="font-medium">{service.name}</div>
                        </TableCell>
                        <TableCell>
                          {service.service_categories ? (
                            <Badge variant="outline">
                              {service.service_categories.name}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              Sem categoria
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(service.price)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">Inativo</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(service.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteId(service.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </Card>
        </TabsContent>

        <TabsContent value="categories">
          <CategoryManager />
        </TabsContent>
      </Tabs>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Editar Serviço" : "Novo Serviço"}
            </DialogTitle>
          </DialogHeader>
          <ServiceForm
            serviceId={editingId}
            onSuccess={handleFormSuccess}
            onCancel={handleCloseForm}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
