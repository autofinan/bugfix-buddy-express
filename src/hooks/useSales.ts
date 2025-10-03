import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Sale {
  id: string;
  date: string;
  total: number;
  subtotal: number | null;
  discount_type: string | null;
  discount_value: number;
  payment_method: string;
  note: string | null;
  created_at: string;
  canceled: boolean;
  canceled_at: string | null;
  cancel_reason: string | null;
  canceled_by: string | null;
  owner_id: string;
  cliente_nome: string | null;
  cliente_id: string | null;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  custo_unitario: number | null;
  products?: {
    name: string;
    sku: string | null;
  };
}

export const useSales = (startDate?: Date, endDate?: Date) => {
  return useQuery({
    queryKey: ["sales", startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from("sales")
        .select("*")
        .order("date", { ascending: false });

      if (startDate) {
        query = query.gte("date", startDate.toISOString());
      }
      if (endDate) {
        query = query.lte("date", endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Sale[];
    },
  });
};

export const useSaleItems = (saleId: string) => {
  return useQuery({
    queryKey: ["sale-items", saleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sale_items")
        .select("*")
        .eq("sale_id", saleId);

      if (error) throw error;
      
      // Buscar informações dos produtos separadamente
      const itemsWithProducts = await Promise.all(
        (data || []).map(async (item) => {
          const { data: product } = await supabase
            .from("products")
            .select("name, sku")
            .eq("id", item.product_id)
            .single();
          
          return {
            ...item,
            products: product || undefined
          };
        })
      );
      
      return itemsWithProducts as SaleItem[];
    },
    enabled: !!saleId,
  });
};

export const useCancelSale = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ saleId, reason }: { saleId: string; reason?: string }) => {
      const { data, error } = await supabase.rpc("cancel_sale", {
        sale_id_param: saleId,
        reason: reason || null,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      toast({
        title: "Venda cancelada",
        description: "Venda cancelada com sucesso e estoque restaurado.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao cancelar venda",
        description: error.message || "Não foi possível cancelar a venda",
        variant: "destructive",
      });
    },
  });
};
