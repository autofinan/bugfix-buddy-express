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
          converted_at: string | null
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
          converted_at?: string | null
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
          converted_at?: string | null
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
      customers: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          owner_id: string
          phone: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          owner_id: string
          phone?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          owner_id?: string
          phone?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      discount_coupons: {
        Row: {
          code: string
          created_at: string
          current_uses: number
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean
          max_uses: number | null
          min_purchase_amount: number | null
          owner_id: string
          updated_at: string
          valid_from: string
          valid_until: string
        }
        Insert: {
          code: string
          created_at?: string
          current_uses?: number
          description?: string | null
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_purchase_amount?: number | null
          owner_id: string
          updated_at?: string
          valid_from?: string
          valid_until: string
        }
        Update: {
          code?: string
          created_at?: string
          current_uses?: number
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_purchase_amount?: number | null
          owner_id?: string
          updated_at?: string
          valid_from?: string
          valid_until?: string
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
      monthly_goals: {
        Row: {
          created_at: string | null
          id: string
          month: string
          owner_id: string
          profit_goal: number | null
          revenue_goal: number | null
          sales_count_goal: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          month: string
          owner_id: string
          profit_goal?: number | null
          revenue_goal?: number | null
          sales_count_goal?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          month?: string
          owner_id?: string
          profit_goal?: number | null
          revenue_goal?: number | null
          sales_count_goal?: number | null
          updated_at?: string | null
        }
        Relationships: []
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
      plan_history: {
        Row: {
          changed_at: string | null
          id: string
          metadata: Json | null
          new_plan: string
          old_plan: string | null
          source: string
          user_id: string
        }
        Insert: {
          changed_at?: string | null
          id?: string
          metadata?: Json | null
          new_plan: string
          old_plan?: string | null
          source: string
          user_id: string
        }
        Update: {
          changed_at?: string | null
          id?: string
          metadata?: Json | null
          new_plan?: string
          old_plan?: string | null
          source?: string
          user_id?: string
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
      system_logs: {
        Row: {
          category: string
          created_at: string | null
          details: Json | null
          id: string
          log_type: string
          message: string
          user_id: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          details?: Json | null
          id?: string
          log_type: string
          message: string
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          log_type?: string
          message?: string
          user_id?: string | null
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
      user_plans: {
        Row: {
          ai_questions_reset_at: string | null
          ai_questions_used: number | null
          billing_until: string | null
          created_at: string | null
          id: string
          plan: Database["public"]["Enums"]["user_plan_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_questions_reset_at?: string | null
          ai_questions_used?: number | null
          billing_until?: string | null
          created_at?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["user_plan_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_questions_reset_at?: string | null
          ai_questions_used?: number | null
          billing_until?: string | null
          created_at?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["user_plan_type"]
          updated_at?: string | null
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
      calculate_abc_curve: {
        Args: { p_end_date: string; p_owner_id: string; p_start_date: string }
        Returns: Json
      }
      calculate_cash_flow: {
        Args: { p_end_date: string; p_owner_id: string; p_start_date: string }
        Returns: Json
      }
      calculate_dre: {
        Args: { p_end_date: string; p_owner_id: string; p_start_date: string }
        Returns: Json
      }
      cancel_sale: {
        Args: { reason?: string; sale_id_param: string }
        Returns: boolean
      }
      check_plan_limit: {
        Args: { p_limit_type: string; p_user_id: string }
        Returns: Json
      }
      convert_budget_to_sale: {
        Args: { budget_id_param: string }
        Returns: string
      }
      create_default_service_categories: {
        Args: { user_id: string }
        Returns: undefined
      }
      financial_snapshot: { Args: { p_owner_id: string }; Returns: Json }
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
      get_my_owner_id: { Args: never; Returns: string }
      get_public_sale: { Args: { sale_id_param: string }; Returns: Json }
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
      get_store_settings: { Args: never; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_coupon_usage: {
        Args: { p_coupon_id: string }
        Returns: undefined
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
      reset_ai_questions: { Args: never; Returns: undefined }
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
      set_user_plan: {
        Args: {
          p_plan: Database["public"]["Enums"]["user_plan_type"]
          p_user_id: string
        }
        Returns: undefined
      }
      upsert_store_settings: {
        Args: {
          p_accent_color: string
          p_address: string
          p_cnpj: string
          p_logo_url: string
          p_max_discount_percentage: number
          p_phone: string
          p_primary_color: string
          p_store_name: string
        }
        Returns: Json
      }
      validate_budget_owner: {
        Args: { budget_id_param: string }
        Returns: boolean
      }
      validate_coupon: {
        Args: { p_code: string; p_owner_id: string; p_purchase_amount?: number }
        Returns: Json
      }
    }
    Enums: {
      app_role: "owner" | "employee"
      budget_status: "open" | "converted" | "canceled"
      user_plan_type: "free" | "basic" | "pro"
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
      user_plan_type: ["free", "basic", "pro"],
    },
  },
} as const
