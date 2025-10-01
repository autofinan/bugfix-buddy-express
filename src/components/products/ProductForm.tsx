import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Product } from "./ProductsView";

interface Category {
  id: string;
  name: string;
}

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSave: () => void;
  onClose: () => void;
}

export function ProductForm({ open, onOpenChange, product, onSave, onClose }: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    cost: "",
    stock: "",
    min_stock: "",
    sku: "",
    barcode: "",
    category_id: "",
    image_url: "",
    is_active: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchCategories();
      if (product) {
        setFormData({
          name: product.name,
          description: product.description || "",
          price: product.price.toString(),
          cost: product.cost?.toString() || "",
          stock: product.stock?.toString() || "",
          min_stock: product.min_stock?.toString() || "",
          sku: product.sku || "",
          barcode: product.barcode || "",
          category_id: product.category_id || "",
          image_url: product.image_url || "",
          is_active: product.is_active,
        });
      } else {
        setFormData({
          name: "",
          description: "",
          price: "",
          cost: "",
          stock: "",
          min_stock: "",
          sku: "",
          barcode: "",
          category_id: "",
          image_url: "",
          is_active: true,
        });
      }
    }
  }, [open, product]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.price) {
      toast({
        title: "Erro",
        description: "Nome e preço são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price: parseFloat(formData.price),
        cost: formData.cost ? parseFloat(formData.cost) : null,
        stock: formData.stock ? parseInt(formData.stock) : null,
        min_stock: formData.min_stock ? parseInt(formData.min_stock) : null,
        sku: formData.sku.trim() || null,
        barcode: formData.barcode.trim() || null,
        category_id: formData.category_id || null,
        image_url: formData.image_url.trim() || null,
        is_active: formData.is_active,
      };

      if (product) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", product.id);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Produto atualizado com sucesso!"
        });
      } else {
        const { error } = await supabase
          .from("products")
          .insert(productData);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Produto criado com sucesso!"
        });
      }

      onSave();
    } catch (error: any) {
      console.error("Erro ao salvar produto:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar produto",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? "Editar Produto" : "Novo Produto"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select 
                value={formData.category_id} 
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Preço de Venda *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Custo</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                min="0"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Estoque Atual</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="min_stock">Estoque Mínimo</Label>
              <Input
                id="min_stock"
                type="number"
                min="0"
                value={formData.min_stock}
                onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="barcode">Código de Barras</Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">URL da Imagem</Label>
            <Input
              id="image_url"
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Produto ativo</Label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : product ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}