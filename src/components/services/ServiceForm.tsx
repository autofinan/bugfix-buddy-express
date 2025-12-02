import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { CategoryForm } from "./CategoryForm";
import { ServiceVariationForm } from "./ServiceVariationForm";

interface ServiceFormProps {
  serviceId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface ServiceCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
  estimated_profit_margin: number | null;
}

interface ServiceVariation {
  id?: string;
  name: string;
  part_cost: number;
  labor_cost: number;
}

export function ServiceForm({ serviceId, onSuccess, onCancel }: ServiceFormProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [serviceType, setServiceType] = useState<"fixed" | "variable">("fixed");
  const [variations, setVariations] = useState<ServiceVariation[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category_id: "",
    price: "",
    duration: "",
    notes: "",
    is_active: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
    if (serviceId) {
      fetchService();
    }
  }, [serviceId]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("service_categories" as any)
        .select("id, name, color, icon, estimated_profit_margin")
        .order("is_default", { ascending: false })
        .order("name");

      if (error) throw error;

      if (!data || data.length === 0) {
        const { data: user } = await supabase.auth.getUser();
        if (user.user) {
          await supabase.rpc("create_default_service_categories" as any, {
            user_id: user.user.id
          });
          await fetchCategories();
        }
        return;
      }

      setCategories(data as unknown as ServiceCategory[]);
    } catch (error: any) {
      console.error("Erro ao carregar categorias:", error);
    }
  };

  const fetchService = async () => {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("id", serviceId)
        .single();

      if (error) throw error;

      if (data) {
        const serviceData = data as any;
        setFormData({
          name: serviceData.name || "",
          description: serviceData.description || "",
          category_id: serviceData.category_id || "",
          price: serviceData.price?.toString() || "",
          duration: serviceData.duration || "",
          notes: serviceData.notes || "",
          is_active: serviceData.is_active ?? true,
        });
        setServiceType(serviceData.service_type || "fixed");

        // Carregar variações se for serviço variável
        if (serviceData.service_type === "variable") {
          const { data: variationsData } = await supabase
            .from("service_variations" as any)
            .select("*")
            .eq("service_id", serviceId)
            .eq("is_active", true);
          
          if (variationsData) {
            setVariations(variationsData as unknown as ServiceVariation[]);
          }
        }
      }
    } catch (error: any) {
      toast({
        title: "Erro ao carregar serviço",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (serviceType === "variable" && variations.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos uma variação para serviços do tipo variável",
        variant: "destructive",
      });
      return;
    }

    if (serviceType === "variable") {
      const hasInvalidVariation = variations.some(v => !v.name.trim());
      if (hasInvalidVariation) {
        toast({
          title: "Erro",
          description: "Todas as variações devem ter um nome",
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const serviceData = {
        name: formData.name,
        description: formData.description || null,
        category_id: formData.category_id || null,
        price: parseFloat(formData.price) || 0,
        duration: formData.duration || null,
        notes: formData.notes || null,
        is_active: formData.is_active,
        service_type: serviceType,
        owner_id: user.id,
      };

      let savedServiceId = serviceId;

      if (serviceId) {
        const { error } = await supabase
          .from("services")
          .update(serviceData as any)
          .eq("id", serviceId);

        if (error) throw error;

        // Desativar variações antigas se mudou de variável para fixo
        if (serviceType === "fixed") {
          await supabase
            .from("service_variations" as any)
            .update({ is_active: false })
            .eq("service_id", serviceId);
        }
      } else {
        const { data, error } = await supabase
          .from("services")
          .insert([serviceData as any])
          .select()
          .single();

        if (error) throw error;
        savedServiceId = data.id;
      }

      // Salvar variações se for serviço variável
      if (serviceType === "variable" && savedServiceId) {
        // Deletar variações antigas
        await supabase
          .from("service_variations" as any)
          .delete()
          .eq("service_id", savedServiceId);

        // Inserir novas variações
        const variationsToInsert = variations.map(v => ({
          service_id: savedServiceId,
          name: v.name,
          part_cost: v.part_cost || 0,
          labor_cost: v.labor_cost || 0,
          owner_id: user.id,
        }));

        const { error: variationsError } = await supabase
          .from("service_variations" as any)
          .insert(variationsToInsert);

        if (variationsError) throw variationsError;
      }

      toast({
        title: serviceId ? "Serviço atualizado" : "Serviço cadastrado",
        description: serviceId ? "Serviço atualizado com sucesso!" : "Serviço cadastrado com sucesso!",
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar serviço",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome do Serviço *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder="Ex: Formatação de computador"
        />
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descreva o serviço oferecido..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="serviceType">Tipo de Serviço</Label>
        <Select value={serviceType} onValueChange={(value: "fixed" | "variable") => setServiceType(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fixed">🔹 Fixo</SelectItem>
            <SelectItem value="variable">🔸 Variável (com variações)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Serviços fixos têm um preço único. Serviços variáveis permitem criar variações com preços diferentes.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <div className="flex gap-2">
            <Select
              value={formData.category_id}
              onValueChange={(value) => setFormData({ ...formData, category_id: value })}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => {
                  const IconComponent = (LucideIcons as any)[cat.icon] || LucideIcons.Briefcase;
                  return (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-4 h-4" style={{ color: cat.color }} />
                        <span>{cat.name}</span>
                        {cat.estimated_profit_margin && (
                          <span className="text-xs text-muted-foreground">({cat.estimated_profit_margin}%)</span>
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setShowCategoryForm(true)}
              title="Criar nova categoria"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {serviceType === "fixed" && (
          <div>
            <Label htmlFor="price">Preço (R$) *</Label>
            <Input
              id="price"
              type="text"
              inputMode="decimal"
              value={formData.price || ''}
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d.,]/g, '');
                setFormData({ ...formData, price: value });
              }}
              required
              placeholder="0.00"
            />
          </div>
        )}
      </div>

      {serviceType === "variable" && (
        <ServiceVariationForm variations={variations} onChange={setVariations} />
      )}

      <div>
        <Label htmlFor="duration">Duração Estimada</Label>
        <Input
          id="duration"
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
          placeholder="Ex: 2h, 1 dia, 1 semana"
        />
      </div>

      <div>
        <Label htmlFor="notes">Observações Adicionais</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Informações extras sobre o serviço..."
          rows={2}
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
        <Label htmlFor="is_active" className="cursor-pointer">
          Serviço Ativo
        </Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {serviceId ? "Atualizar" : "Cadastrar"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>

      <CategoryForm
        open={showCategoryForm}
        onOpenChange={setShowCategoryForm}
        onSave={() => {
          fetchCategories();
          setShowCategoryForm(false);
        }}
      />
    </form>
  );
}
