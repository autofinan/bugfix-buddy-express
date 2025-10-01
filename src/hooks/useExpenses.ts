import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  payment_method: string | null;
  expense_date: string;
  created_at: string;
  updated_at: string;
  owner_id: string;
}

export const useExpenses = (startDate?: Date, endDate?: Date) => {
  return useQuery({
    queryKey: ["expenses", startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from("expenses")
        .select("*")
        .order("expense_date", { ascending: false });

      if (startDate) {
        query = query.gte("expense_date", startDate.toISOString().split("T")[0]);
      }
      if (endDate) {
        query = query.lte("expense_date", endDate.toISOString().split("T")[0]);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Expense[];
    },
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (expense: Omit<Expense, "id" | "created_at" | "updated_at" | "owner_id">) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("expenses")
        .insert({
          ...expense,
          owner_id: userData.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast({
        title: "Despesa criada",
        description: "Despesa cadastrada com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar despesa",
        description: error.message || "Não foi possível criar a despesa",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...expense }: Partial<Expense> & { id: string }) => {
      const { data, error } = await supabase
        .from("expenses")
        .update(expense)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast({
        title: "Despesa atualizada",
        description: "Despesa atualizada com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar despesa",
        description: error.message || "Não foi possível atualizar a despesa",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast({
        title: "Despesa excluída",
        description: "Despesa excluída com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir despesa",
        description: error.message || "Não foi possível excluir a despesa",
        variant: "destructive",
      });
    },
  });
};
