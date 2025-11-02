import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import * as LucideIcons from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ServiceCategory {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  is_default: boolean;
  estimated_profit_margin: number | null;
}

interface CategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  categoryToEdit?: ServiceCategory | null;
}

const POPULAR_COLORS = [
  { name: "Cinza", value: "#4B5563" },
  { name: "Azul", value: "#2563EB" },
  { name: "Verde", value: "#10B981" },
  { name: "Amarelo", value: "#F59E0B" },
  { name: "Vermelho", value: "#EF4444" },
  { name: "Roxo", value: "#8B5CF6" },
  { name: "Rosa", value: "#EC4899" },
  { name: "Laranja", value: "#F97316" },
  { name: "Teal", value: "#14B8A6" },
  { name: "Indigo", value: "#6366F1" },
];

const POPULAR_ICONS = [
  "wrench", "tool", "briefcase", "palette", "package",
  "settings", "hammer", "cpu", "zap", "star",
  "heart", "home", "building", "car", "smartphone",
  "laptop", "camera", "music", "book", "coffee"
];

export function CategoryForm({ open, onOpenChange, onSave, categoryToEdit }: CategoryFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#4B5563");
  const [icon, setIcon] = useState("briefcase");
  const [profitMargin, setProfitMargin] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setDescription(categoryToEdit.description || "");
      setColor(categoryToEdit.color);
      setIcon(categoryToEdit.icon);
      setProfitMargin(categoryToEdit.estimated_profit_margin?.toString() || "");
    } else {
      resetForm();
    }
  }, [categoryToEdit, open]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setColor("#4B5563");
    setIcon("briefcase");
    setProfitMargin("");
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Erro",
        description: "O nome da categoria é obrigatório",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Usuário não autenticado");

      const categoryData = {
        name: name.trim(),
        description: description.trim() || null,
        color,
        icon,
        estimated_profit_margin: profitMargin ? parseFloat(profitMargin) : null,
        owner_id: user.user.id
      };

      if (categoryToEdit) {
        const { error } = await supabase
          .from("service_categories" as any)
          .update(categoryData)
          .eq("id", categoryToEdit.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Categoria atualizada com sucesso!"
        });
      } else {
        const { error } = await supabase
          .from("service_categories" as any)
          .insert(categoryData);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Categoria criada com sucesso!"
        });
      }

      resetForm();
      onSave();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Erro ao salvar categoria:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar categoria",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const IconComponent = (LucideIcons as any)[icon] || LucideIcons.Briefcase;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {categoryToEdit ? "Editar Categoria" : "Nova Categoria"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Categoria *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Serviços de TI"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o tipo de serviços desta categoria..."
              rows={3}
              maxLength={500}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2"
                    >
                      <div
                        className="w-5 h-5 rounded border"
                        style={{ backgroundColor: color }}
                      />
                      <span>{color}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64">
                    <div className="space-y-3">
                      <div className="grid grid-cols-5 gap-2">
                        {POPULAR_COLORS.map((c) => (
                          <button
                            key={c.value}
                            onClick={() => setColor(c.value)}
                            className="w-10 h-10 rounded border-2 hover:scale-110 transition-transform"
                            style={{
                              backgroundColor: c.value,
                              borderColor: color === c.value ? "#000" : "#e5e7eb"
                            }}
                            title={c.name}
                          />
                        ))}
                      </div>
                      <div className="space-y-2">
                        <Label>Cor personalizada</Label>
                        <Input
                          type="color"
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                          className="h-10"
                        />
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Ícone</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <IconComponent className="w-5 h-5" style={{ color }} />
                    <span className="capitalize">{icon}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <ScrollArea className="h-64">
                    <div className="grid grid-cols-5 gap-2 p-2">
                      {POPULAR_ICONS.map((iconName) => {
                        const Icon = (LucideIcons as any)[iconName];
                        if (!Icon) return null;
                        return (
                          <button
                            key={iconName}
                            onClick={() => setIcon(iconName)}
                            className="w-12 h-12 flex items-center justify-center rounded border-2 hover:bg-accent transition-colors"
                            style={{
                              borderColor: icon === iconName ? color : "#e5e7eb"
                            }}
                            title={iconName}
                          >
                            <Icon className="w-6 h-6" />
                          </button>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profit">Margem de Lucro Estimada (%)</Label>
            <Input
              id="profit"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={profitMargin}
              onChange={(e) => setProfitMargin(e.target.value)}
              placeholder="Ex: 30.00"
            />
            <p className="text-xs text-muted-foreground">
              Use como referência ao precificar seus serviços
            </p>
          </div>

          <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: color }}
            >
              <IconComponent className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-medium">{name || "Nome da categoria"}</p>
              <p className="text-sm text-muted-foreground">
                {description || "Descrição da categoria"}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Salvando..." : "Salvar Categoria"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
