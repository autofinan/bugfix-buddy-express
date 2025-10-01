export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      _backup_inventory_movements: {
        Row: {
          created_at: string | null
          id: string | null
          product_id: string | null
          quantity: number | null
          reason: string | null
          type: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          product_id?: string | null
          quantity?: number | null
          reason?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          product_id?: string | null
          quantity?: number | null
          reason?: string | null
          type?: string | null
        }
        Relationships: []
      }
      _backup_products: {
        Row: {
          barcode: string | null
          category_id: string | null
          cost: number | null
          created_at: string | null
          description: string | null
          id: string | null
          image_url: string | null
          is_active: boolean | null
          min_stock: number | null
          name: string | null
          price: number | null
          sku: string | null
          stock: number | null
        }
        Insert: {
          barcode?: string | null
          category_id?: string | null
          cost?: number | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          image_url?: string | null
          is_active?: boolean | null
          min_stock?: number | null
          name?: string | null
          price?: number | null
          sku?: string | null
          stock?: number | null
        }
        Update: {
          barcode?: string | null
          category_id?: string | null
          cost?: number | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          image_url?: string | null
          is_active?: boolean | null
          min_stock?: number | null
          name?: string | null
          price?: number | null
          sku?: string | null
          stock?: number | null
        }
        Relationships: []
      }
      _backup_sale_items: {
        Row: {
          created_at: string | null
          custo_unitario: number | null
          id: string | null
          product_id: string | null
          quantity: number | null
          sale_id: string | null
          total_price: number | null
          unit_price: number | null
        }
        Insert: {
          created_at?: string | null
          custo_unitario?: number | null
          id?: string | null
          product_id?: string | null
          quantity?: number | null
          sale_id?: string | null
          total_price?: number | null
          unit_price?: number | null
        }
        Update: {
          created_at?: string | null
          custo_unitario?: number | null
          id?: string | null
          product_id?: string | null
          quantity?: number | null
          sale_id?: string | null
          total_price?: number | null
          unit_price?: number | null
        }
        Relationships: []
      }
      _backup_sales: {
        Row: {
          created_at: string | null
          date: string | null
          id: string | null
          note: string | null
          payment_method: string | null
          total: number | null
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          id?: string | null
          note?: string | null
          payment_method?: string | null
          total?: number | null
        }
        Update: {
          created_at?: string | null
          date?: string | null
          id?: string | null
          note?: string | null
          payment_method?: string | null
          total?: number | null
        }
        Relationships: []
      }
      budget_items: {
        Row: {
          budget_id: string
          created_at: string
          id: string
          owner_id: string | null
          product_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          budget_id: string
          created_at?: string
          id?: string
          owner_id?: string | null
          product_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          budget_id?: string
          created_at?: string
          id?: string
          owner_id?: string | null
          product_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: []
      }
      budgets: {
        Row: {
          cancel_reason: string | null
          canceled_at: string | null
          canceled_by: string | null
          converted_sale_id: string | null
          created_at: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          discount_type: string | null
          discount_value: number | null
          id: string
          notes: string | null
          owner_id: string
          status: Database["public"]["Enums"]["budget_status"]
          subtotal: number
          total: number
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          cancel_reason?: string | null
          canceled_at?: string | null
          canceled_by?: string | null
          converted_sale_id?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          discount_type?: string | null
          discount_value?: number | null
          id?: string
          notes?: string | null
          owner_id: string
          status?: Database["public"]["Enums"]["budget_status"]
          subtotal?: number
          total?: number
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          cancel_reason?: string | null
          canceled_at?: string | null
          canceled_by?: string | null
          converted_sale_id?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          discount_type?: string | null
          discount_value?: number | null
          id?: string
          notes?: string | null
          owner_id?: string
          status?: Database["public"]["Enums"]["budget_status"]
          subtotal?: number
          total?: number
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
          owner_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          owner_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          owner_id?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string
          expense_date: string
          id: string
          owner_id: string
          payment_method: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          description: string
          expense_date?: string
          id?: string
          owner_id: string
          payment_method?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string
          expense_date?: string
          id?: string
          owner_id?: string
          payment_method?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      inventory_movements: {
        Row: {
          created_at: string
          id: string
          owner_id: string | null
          product_id: string | null
          quantity: number
          reason: string | null
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          owner_id?: string | null
          product_id?: string | null
          quantity: number
          reason?: string | null
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          owner_id?: string | null
          product_id?: string | null
          quantity?: number
          reason?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          barcode: string | null
          category_id: string | null
          cost: number | null
          cost_unitario: number | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          min_stock: number | null
          name: string
          owner_id: string | null
          price: number
          sku: string | null
          stock: number | null
        }
        Insert: {
          barcode?: string | null
          category_id?: string | null
          cost?: number | null
          cost_unitario?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          min_stock?: number | null
          name: string
          owner_id?: string | null
          price: number
          sku?: string | null
          stock?: number | null
        }
        Update: {
          barcode?: string | null
          category_id?: string | null
          cost?: number | null
          cost_unitario?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          min_stock?: number | null
          name?: string
          owner_id?: string | null
          price?: number
          sku?: string | null
          stock?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sale_items: {
        Row: {
          created_at: string
          custo_unitario: number | null
          id: string
          owner_id: string | null
          product_id: string | null
          quantity: number
          sale_id: string | null
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          custo_unitario?: number | null
          id?: string
          owner_id?: string | null
          product_id?: string | null
          quantity: number
          sale_id?: string | null
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          custo_unitario?: number | null
          id?: string
          owner_id?: string | null
          product_id?: string | null
          quantity?: number
          sale_id?: string | null
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          cancel_reason: string | null
          canceled: boolean | null
          canceled_at: string | null
          canceled_by: string | null
          created_at: string
          date: string
          discount_type: string | null
          discount_value: number | null
          id: string
          note: string | null
          owner_id: string | null
          payment_method: string
          subtotal: number | null
          total: number
        }
        Insert: {
          cancel_reason?: string | null
          canceled?: boolean | null
          canceled_at?: string | null
          canceled_by?: string | null
          created_at?: string
          date?: string
          discount_type?: string | null
          discount_value?: number | null
          id?: string
          note?: string | null
          owner_id?: string | null
          payment_method: string
          subtotal?: number | null
          total: number
        }
        Update: {
          cancel_reason?: string | null
          canceled?: boolean | null
          canceled_at?: string | null
          canceled_by?: string | null
          created_at?: string
          date?: string
          discount_type?: string | null
          discount_value?: number | null
          id?: string
          note?: string | null
          owner_id?: string | null
          payment_method?: string
          subtotal?: number | null
          total?: number
        }
        Relationships: []
      }
      user_discount_limits: {
        Row: {
          created_at: string
          id: string
          max_discount_percentage: number
          owner_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          max_discount_percentage?: number
          owner_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          max_discount_percentage?: number
          owner_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cancel_sale: {
        Args: { reason?: string; sale_id_param: string }
        Returns: boolean
      }
      convert_budget_to_sale: {
        Args: { budget_id_param: string }
        Returns: string
      }
      get_budget_with_protected_customer_data: {
        Args: { budget_id_param: string }
        Returns: {
          cancel_reason: string
          canceled_at: string
          canceled_by: string
          converted_sale_id: string
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string
          discount_type: string
          discount_value: number
          id: string
          notes: string
          owner_id: string
          status: Database["public"]["Enums"]["budget_status"]
          subtotal: number
          total: number
          updated_at: string
          valid_until: string
        }[]
      }
      get_sales_with_profit: {
        Args: Record<PropertyKey, never>
        Returns: {
          cancel_reason: string
          canceled: boolean
          canceled_at: string
          created_at: string
          date: string
          discount_type: string
          discount_value: number
          id: string
          note: string
          owner_id: string
          payment_method: string
          profit_margin_percentage: number
          subtotal: number
          total: number
          total_profit: number
          total_revenue: number
        }[]
      }
      search_budgets_safe: {
        Args: { search_term?: string }
        Returns: {
          created_at: string
          has_customer_info: boolean
          id: string
          status: Database["public"]["Enums"]["budget_status"]
          total: number
        }[]
      }
      validate_budget_owner: {
        Args: { budget_id_param: string }
        Returns: boolean
      }
    }
    Enums: {
      budget_status: "open" | "converted" | "canceled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      budget_status: ["open", "converted", "canceled"],
    },
  },
} as const
