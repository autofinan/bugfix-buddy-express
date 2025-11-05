import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Wrench, Package } from "lucide-react";

interface Service {
  id: string;
  name: string;
  description: string | null;
  category_id: string | null;
  price: number;
  duration: string | null;
  service_type: "fixed" | "variable";
}

interface ServiceVariation {
  id: string;
  name: string;
  part_cost: number;
  labor_cost: number;
  total_price: number;
}

interface ServiceGridProps {
  onAddToCart: (service: { id: string; name: string; price: number; variationId?: string; variationLabel?: string }) => void;
}

export function ServiceGrid({ onAddToCart }: ServiceGridProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [variations, setVariations] = useState<ServiceVariation[]>([]);
  const [showVariationsModal, setShowVariationsModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setServices((data || []) as unknown as Service[]);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar serviços",
        description: error.message,
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleServiceClick = async (service: Service) => {
    if (service.service_type === "variable") {
      try {
        const { data: variationsData, error } = await supabase
          .from("service_variations" as any)
          .select("*")
          .eq("service_id", service.id)
          .order("name");

        if (error) throw error;

        if (!variationsData || variationsData.length === 0) {
          toast({
            title: "Atenção",
            description: "Este serviço não possui variações cadastradas",
            variant: "destructive",
            duration: 4000,
          });
          return;
        }

        setSelectedService(service);
        setVariations((variationsData || []) as unknown as ServiceVariation[]);
        setShowVariationsModal(true);
      } catch (error: any) {
        toast({
          title: "Erro",
          description: "Erro ao carregar variações do serviço",
          variant: "destructive",
          duration: 4000,
        });
      }
    } else {
      onAddToCart({
        id: service.id,
        name: service.name,
        price: service.price
      });
    }
  };

  const handleSelectVariation = (variation: ServiceVariation) => {
    if (selectedService) {
      onAddToCart({
        id: `${selectedService.id}-${variation.id}`,
        name: `${selectedService.name} - ${variation.name}`,
        price: variation.total_price,
        variationId: variation.id,
        variationLabel: variation.name
      });
      setShowVariationsModal(false);
      setSelectedService(null);
      setVariations([]);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
        <p className="text-muted-foreground">Carregando serviços...</p>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-8">
        <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
        <p className="text-muted-foreground">Nenhum serviço disponível</p>
        <p className="text-sm text-muted-foreground mt-1">
          Cadastre serviços para vendê-los aqui
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {services.map((service) => (
          <Card
            key={service.id}
            className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleServiceClick(service)}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-start justify-between mb-2">
                <Wrench className="h-8 w-8 text-primary" />
                <Badge variant={service.service_type === "fixed" ? "default" : "secondary"} className="text-xs">
                  {service.service_type === "fixed" ? "Fixo" : "Variável"}
                </Badge>
              </div>

              <h3 className="font-semibold text-sm mb-1 line-clamp-2">{service.name}</h3>

              {service.description && (
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {service.description}
                </p>
              )}

              {service.duration && (
                <p className="text-xs text-muted-foreground mb-2">
                  ⏱️ {service.duration}
                </p>
              )}

              <div className="mt-auto pt-2 border-t">
                {service.service_type === "fixed" ? (
                  <p className="text-lg font-bold text-primary">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(service.price)}
                  </p>
                ) : (
                  <p className="text-sm font-medium text-primary">
                    Selecione a variação
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={showVariationsModal} onOpenChange={setShowVariationsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Selecione a Variação - {selectedService?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {variations.map((variation) => (
              <Card
                key={variation.id}
                className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSelectVariation(variation)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-base mb-2">{variation.name}</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Peça:</span>{" "}
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(variation.part_cost)}
                      </div>
                      <div>
                        <span className="font-medium">Mão de Obra:</span>{" "}
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(variation.labor_cost)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-xs text-muted-foreground mb-1">Total</p>
                    <p className="text-2xl font-bold text-primary">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(variation.total_price)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setShowVariationsModal(false)}>
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
