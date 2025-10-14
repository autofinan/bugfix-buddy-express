import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Wrench, Package } from "lucide-react";

interface Service {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number;
  duration: string | null;
}

interface ServiceGridProps {
  onAddToCart: (service: { id: string; name: string; price: number }) => void;
}

export function ServiceGrid({ onAddToCart }: ServiceGridProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
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
      setServices(data || []);
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {services.map((service) => (
        <Card
          key={service.id}
          className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onAddToCart({ id: service.id, name: service.name, price: service.price })}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-start justify-between mb-2">
              <Wrench className="h-8 w-8 text-primary" />
              {service.category && (
                <Badge variant="secondary" className="text-xs">
                  {service.category}
                </Badge>
              )}
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
              <p className="text-lg font-bold text-primary">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(service.price)}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
