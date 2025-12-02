import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

interface ServiceVariation {
  id?: string;
  name: string;
  part_cost: number;
  labor_cost: number;
}

interface ServiceVariationFormProps {
  variations: ServiceVariation[];
  onChange: (variations: ServiceVariation[]) => void;
}

export function ServiceVariationForm({ variations, onChange }: ServiceVariationFormProps) {
  const addVariation = () => {
    onChange([
      ...variations,
      {
        name: "",
        part_cost: 0,
        labor_cost: 0
      }
    ]);
  };

  const removeVariation = (index: number) => {
    onChange(variations.filter((_, i) => i !== index));
  };

  const updateVariation = (index: number, field: keyof ServiceVariation, value: any) => {
    const updated = variations.map((v, i) => {
      if (i === index) {
        return { ...v, [field]: value };
      }
      return v;
    });
    onChange(updated);
  };

  const calculateTotal = (variation: ServiceVariation) => {
    return (variation.part_cost || 0) + (variation.labor_cost || 0);
  };

  return (
    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Variações do Serviço</Label>
        <Button type="button" onClick={addVariation} size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Variação
        </Button>
      </div>

      {variations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Nenhuma variação cadastrada. Adicione variações para diferentes tipos de peças, modelos ou versões do serviço.
            </p>
            <Button type="button" onClick={addVariation} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeira Variação
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {variations.map((variation, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor={`variation-name-${index}`} className="text-xs">
                      Nome da Variação *
                    </Label>
                    <Input
                      id={`variation-name-${index}`}
                      value={variation.name}
                      onChange={(e) => updateVariation(index, "name", e.target.value)}
                      placeholder="Ex: iPhone 11, Samsung Galaxy S20"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor={`part-cost-${index}`} className="text-xs">
                      Custo da Peça (R$)
                    </Label>
                    <Input
                      id={`part-cost-${index}`}
                      type="text"
                      inputMode="decimal"
                      value={variation.part_cost || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d.,]/g, '');
                        if (value === '') {
                          updateVariation(index, "part_cost", 0);
                        } else {
                          const numValue = parseFloat(value.replace(',', '.'));
                          updateVariation(index, "part_cost", isNaN(numValue) ? 0 : numValue);
                        }
                      }}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`labor-cost-${index}`} className="text-xs">
                      Mão de Obra (R$)
                    </Label>
                    <Input
                      id={`labor-cost-${index}`}
                      type="text"
                      inputMode="decimal"
                      value={variation.labor_cost || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d.,]/g, '');
                        if (value === '') {
                          updateVariation(index, "labor_cost", 0);
                        } else {
                          const numValue = parseFloat(value.replace(',', '.'));
                          updateVariation(index, "labor_cost", isNaN(numValue) ? 0 : numValue);
                        }
                      }}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="ml-2 font-bold text-primary">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(calculateTotal(variation))}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVariation(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {variations.length > 0 && (
        <p className="text-xs text-muted-foreground">
          * Ao menos uma variação é necessária para serviços do tipo "Variável"
        </p>
      )}
    </div>
  );
}
