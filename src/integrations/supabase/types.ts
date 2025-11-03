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
      customer_data_access_log: {
        Row: {
          access_type: string
          accessed_at: string | null
          budget_id: string
          id: string
          ip_address: unknown
          user_agent: string | null
          user_id: string
        }
        Insert: {
          access_type: string
          accessed_at?: string | null
          budget_id: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id: string
        }
        Update: {
          access_type?: string
          accessed_at?: string | null
          budget_id?: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          created_at: string | null
          id: string
          name: string
          password: string
          role: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          password: string
          role?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          password?: string
          role?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          attachment_url: string | null
          category: string
          created_at: string
          description: string
          expense_date: string
          id: string
          is_fixed: boolean | null
          linked_movement_id: string | null
          owner_id: string
          payment_method: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          attachment_url?: string | null
          category: string
          created_at?: string
          description: string
          expense_date?: string
          id?: string
          is_fixed?: boolean | null
          linked_movement_id?: string | null
          owner_id: string
          payment_method?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          attachment_url?: string | null
          category?: string
          created_at?: string
          description?: string
          expense_date?: string
          id?: string
          is_fixed?: boolean | null
          linked_movement_id?: string | null
          owner_id?: string
          payment_method?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_linked_movement_id_fkey"
            columns: ["linked_movement_id"]
            isOneToOne: false
            referencedRelation: "inventory_movements"
            referencedColumns: ["id"]
          },
        ]
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
      payment_fees: {
        Row: {
          created_at: string | null
          fee_percentage: number
          id: string
          installments: number | null
          method: string
          owner_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fee_percentage?: number
          id?: string
          installments?: number | null
          method: string
          owner_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fee_percentage?: number
          id?: string
          installments?: number | null
          method?: string
          owner_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      planejamento_financeiro: {
        Row: {
          atualizado_em: string | null
          criado_em: string | null
          custos: number
          despesas: number
          id: string
          impostos_sugerido: number
          lucro_liquido: number
          mes_referencia: string
          owner_id: string
          receita_total: number
          reinvestimento_sugerido: number
          reserva_sugerida: number
          retirada_sugerida: number
        }
        Insert: {
          atualizado_em?: string | null
          criado_em?: string | null
          custos?: number
          despesas?: number
          id?: string
          impostos_sugerido?: number
          lucro_liquido?: number
          mes_referencia: string
          owner_id: string
          receita_total?: number
          reinvestimento_sugerido?: number
          reserva_sugerida?: number
          retirada_sugerida?: number
        }
        Update: {
          atualizado_em?: string | null
          criado_em?: string | null
          custos?: number
          despesas?: number
          id?: string
          impostos_sugerido?: number
          lucro_liquido?: number
          mes_referencia?: string
          owner_id?: string
          receita_total?: number
          reinvestimento_sugerido?: number
          reserva_sugerida?: number
          retirada_sugerida?: number
        }
        Relationships: []
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
          role: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
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
          item_type: string | null
          owner_id: string | null
          product_id: string | null
          quantity: number
          sale_id: string | null
          service_id: string | null
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          custo_unitario?: number | null
          id?: string
          item_type?: string | null
          owner_id?: string | null
          product_id?: string | null
          quantity: number
          sale_id?: string | null
          service_id?: string | null
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          custo_unitario?: number | null
          id?: string
          item_type?: string | null
          owner_id?: string | null
          product_id?: string | null
          quantity?: number
          sale_id?: string | null
          service_id?: string | null
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
          {
            foreignKeyName: "sale_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          installments: number | null
          owner_id: string | null
          payment_method: string
          sale_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          installments?: number | null
          owner_id?: string | null
          payment_method: string
          sale_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          installments?: number | null
          owner_id?: string | null
          payment_method?: string
          sale_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sale_payments_sale_id_fkey"
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
          cliente_id: string | null
          cliente_nome: string | null
          created_at: string
          date: string
          discount_type: string | null
          discount_value: number | null
          gross_amount: number | null
          id: string
          installments: number | null
          net_amount: number | null
          note: string | null
          owner_id: string | null
          payment_method: string
          status: string | null
          subtotal: number | null
          total: number
        }
        Insert: {
          cancel_reason?: string | null
          canceled?: boolean | null
          canceled_at?: string | null
          canceled_by?: string | null
          cliente_id?: string | null
          cliente_nome?: string | null
          created_at?: string
          date?: string
          discount_type?: string | null
          discount_value?: number | null
          gross_amount?: number | null
          id?: string
          installments?: number | null
          net_amount?: number | null
          note?: string | null
          owner_id?: string | null
          payment_method: string
          status?: string | null
          subtotal?: number | null
          total: number
        }
        Update: {
          cancel_reason?: string | null
          canceled?: boolean | null
          canceled_at?: string | null
          canceled_by?: string | null
          cliente_id?: string | null
          cliente_nome?: string | null
          created_at?: string
          date?: string
          discount_type?: string | null
          discount_value?: number | null
          gross_amount?: number | null
          id?: string
          installments?: number | null
          net_amount?: number | null
          note?: string | null
          owner_id?: string | null
          payment_method?: string
          status?: string | null
          subtotal?: number | null
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      service_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          estimated_profit_margin: number | null
          icon: string | null
          id: string
          is_default: boolean | null
          name: string
          owner_id: string | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          estimated_profit_margin?: number | null
          icon?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          owner_id?: string | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          estimated_profit_margin?: number | null
          icon?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          owner_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      service_variations: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          labor_cost: number
          name: string
          owner_id: string
          part_cost: number
          service_id: string
          total_price: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          labor_cost?: number
          name: string
          owner_id: string
          part_cost?: number
          service_id: string
          total_price?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          labor_cost?: number
          name?: string
          owner_id?: string
          part_cost?: number
          service_id?: string
          total_price?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_variations_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category: string | null
          category_id: string | null
          created_at: string
          description: string | null
          duration: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          owner_id: string
          price: number
          service_type: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          owner_id: string
          price?: number
          service_type?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          owner_id?: string
          price?: number
          service_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      store_settings: {
        Row: {
          accent_color: string | null
          address: string | null
          cnpj: string | null
          created_at: string
          id: string
          logo_url: string | null
          max_discount_percentage: number | null
          owner_id: string
          phone: string | null
          primary_color: string | null
          store_name: string | null
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          address?: string | null
          cnpj?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          max_discount_percentage?: number | null
          owner_id: string
          phone?: string | null
          primary_color?: string | null
          store_name?: string | null
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          address?: string | null
          cnpj?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          max_discount_percentage?: number | null
          owner_id?: string
          phone?: string | null
          primary_color?: string | null
          store_name?: string | null
          updated_at?: string
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
      user_roles: {
        Row: {
          created_at: string | null
          created_by: string | null
          email: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
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
      create_default_service_categories: {
        Args: { user_id: string }
        Returns: undefined
      }
      get_budget_details_secure: {
        Args: { budget_id_param: string }
        Returns: {
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
      get_budgets_secure: {
        Args: {
          limit_count?: number
          offset_count?: number
          search_term?: string
        }
        Returns: {
          converted_sale_id: string
          created_at: string
          customer_email_masked: string
          customer_name_masked: string
          customer_phone_masked: string
          discount_type: string
          discount_value: number
          has_customer_info: boolean
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
        Args: never
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_owner: { Args: { _user_id: string }; Returns: boolean }
      mask_customer_data: {
        Args: {
          customer_email: string
          customer_name: string
          customer_phone: string
          is_owner: boolean
        }
        Returns: {
          masked_email: string
          masked_name: string
          masked_phone: string
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
      app_role: "owner" | "employee"
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
      app_role: ["owner", "employee"],
      budget_status: ["open", "converted", "canceled"],
    },
  },
} as const
