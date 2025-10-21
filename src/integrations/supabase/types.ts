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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bank_statements: {
        Row: {
          arquivo_origem: string | null
          banco: string
          conta: string
          created_at: string
          data_transacao: string
          descricao: string
          id: string
          reconciliado: boolean | null
          saldo: number | null
          tipo: string
          transaction_id: string | null
          valor: number
        }
        Insert: {
          arquivo_origem?: string | null
          banco: string
          conta: string
          created_at?: string
          data_transacao: string
          descricao: string
          id?: string
          reconciliado?: boolean | null
          saldo?: number | null
          tipo: string
          transaction_id?: string | null
          valor: number
        }
        Update: {
          arquivo_origem?: string | null
          banco?: string
          conta?: string
          created_at?: string
          data_transacao?: string
          descricao?: string
          id?: string
          reconciliado?: boolean | null
          saldo?: number | null
          tipo?: string
          transaction_id?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "bank_statements_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "financial_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          categoria: string
          created_at: string
          id: string
          mes_referencia: string
          observacoes: string | null
          safra_id: number | null
          updated_at: string
          valor_previsto: number
          valor_realizado: number | null
        }
        Insert: {
          categoria: string
          created_at?: string
          id?: string
          mes_referencia: string
          observacoes?: string | null
          safra_id?: number | null
          updated_at?: string
          valor_previsto: number
          valor_realizado?: number | null
        }
        Update: {
          categoria?: string
          created_at?: string
          id?: string
          mes_referencia?: string
          observacoes?: string | null
          safra_id?: number | null
          updated_at?: string
          valor_previsto?: number
          valor_realizado?: number | null
        }
        Relationships: []
      }
      checklist_items: {
        Row: {
          concluido: boolean
          created_at: string
          id: string
          ordem: number
          task_id: string
          titulo: string
        }
        Insert: {
          concluido?: boolean
          created_at?: string
          id?: string
          ordem?: number
          task_id: string
          titulo: string
        }
        Update: {
          concluido?: boolean
          created_at?: string
          id?: string
          ordem?: number
          task_id?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_items_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_categories: {
        Row: {
          cor: string | null
          created_at: string
          descricao: string | null
          id: string
          nome: string
          tipo: string
        }
        Insert: {
          cor?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          tipo: string
        }
        Update: {
          cor?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          tipo?: string
        }
        Relationships: []
      }
      financial_transactions: {
        Row: {
          categoria: string
          created_at: string
          data_pagamento: string | null
          data_transacao: string
          data_vencimento: string | null
          descricao: string
          forma_pagamento: string | null
          id: string
          observacoes: string | null
          safra_id: number | null
          status: string
          subcategoria: string | null
          tipo: string
          updated_at: string
          valor: number
        }
        Insert: {
          categoria: string
          created_at?: string
          data_pagamento?: string | null
          data_transacao: string
          data_vencimento?: string | null
          descricao: string
          forma_pagamento?: string | null
          id?: string
          observacoes?: string | null
          safra_id?: number | null
          status?: string
          subcategoria?: string | null
          tipo: string
          updated_at?: string
          valor: number
        }
        Update: {
          categoria?: string
          created_at?: string
          data_pagamento?: string | null
          data_transacao?: string
          data_vencimento?: string | null
          descricao?: string
          forma_pagamento?: string | null
          id?: string
          observacoes?: string | null
          safra_id?: number | null
          status?: string
          subcategoria?: string | null
          tipo?: string
          updated_at?: string
          valor?: number
        }
        Relationships: []
      }
      harvest_forecasts: {
        Row: {
          created_at: string
          custo_total_estimado: number | null
          data_previsao: string
          id: string
          lucro_estimado: number | null
          observacoes: string | null
          producao_estimada: number
          receita_estimada: number | null
          safra_id: number
          unidade: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          custo_total_estimado?: number | null
          data_previsao: string
          id?: string
          lucro_estimado?: number | null
          observacoes?: string | null
          producao_estimada: number
          receita_estimada?: number | null
          safra_id: number
          unidade?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          custo_total_estimado?: number | null
          data_previsao?: string
          id?: string
          lucro_estimado?: number | null
          observacoes?: string | null
          producao_estimada?: number
          receita_estimada?: number | null
          safra_id?: number
          unidade?: string
          updated_at?: string
        }
        Relationships: []
      }
      market_prices: {
        Row: {
          created_at: string
          cultura: string
          data_referencia: string
          fonte: string | null
          id: string
          observacoes: string | null
          preco_medio: number
          unidade: string
        }
        Insert: {
          created_at?: string
          cultura: string
          data_referencia: string
          fonte?: string | null
          id?: string
          observacoes?: string | null
          preco_medio: number
          unidade?: string
        }
        Update: {
          created_at?: string
          cultura?: string
          data_referencia?: string
          fonte?: string | null
          id?: string
          observacoes?: string | null
          preco_medio?: number
          unidade?: string
        }
        Relationships: []
      }
      planned_purchases: {
        Row: {
          created_at: string
          data_planejada: string
          id: string
          observacoes: string | null
          preco_estimado: number
          quantidade: number
          supply_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_planejada: string
          id?: string
          observacoes?: string | null
          preco_estimado: number
          quantidade: number
          supply_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_planejada?: string
          id?: string
          observacoes?: string | null
          preco_estimado?: number
          quantidade?: number
          supply_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "planned_purchases_supply_id_fkey"
            columns: ["supply_id"]
            isOneToOne: false
            referencedRelation: "supplies"
            referencedColumns: ["id"]
          },
        ]
      }
      planting_areas: {
        Row: {
          area_hectares: number | null
          cor: string
          created_at: string
          cultura: string
          id: string
          nome: string
          observacoes: string | null
          polygon_coords: Json
          producao_historica: Json | null
          property_id: string
          safra_id: number | null
          updated_at: string
        }
        Insert: {
          area_hectares?: number | null
          cor?: string
          created_at?: string
          cultura: string
          id?: string
          nome: string
          observacoes?: string | null
          polygon_coords: Json
          producao_historica?: Json | null
          property_id: string
          safra_id?: number | null
          updated_at?: string
        }
        Update: {
          area_hectares?: number | null
          cor?: string
          created_at?: string
          cultura?: string
          id?: string
          nome?: string
          observacoes?: string | null
          polygon_coords?: Json
          producao_historica?: Json | null
          property_id?: string
          safra_id?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "planting_areas_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          area_total: number | null
          created_at: string
          endereco: string | null
          id: string
          latitude: number | null
          longitude: number | null
          nome: string
          observacoes: string | null
          updated_at: string
        }
        Insert: {
          area_total?: number | null
          created_at?: string
          endereco?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          nome: string
          observacoes?: string | null
          updated_at?: string
        }
        Update: {
          area_total?: number | null
          created_at?: string
          endereco?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          nome?: string
          observacoes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      routes: {
        Row: {
          created_at: string
          destino_property_id: string | null
          distancia_km: number | null
          id: string
          nome: string
          observacoes: string | null
          origem_property_id: string | null
          route_coords: Json | null
          tempo_estimado: number | null
        }
        Insert: {
          created_at?: string
          destino_property_id?: string | null
          distancia_km?: number | null
          id?: string
          nome: string
          observacoes?: string | null
          origem_property_id?: string | null
          route_coords?: Json | null
          tempo_estimado?: number | null
        }
        Update: {
          created_at?: string
          destino_property_id?: string | null
          distancia_km?: number | null
          id?: string
          nome?: string
          observacoes?: string | null
          origem_property_id?: string | null
          route_coords?: Json | null
          tempo_estimado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "routes_destino_property_id_fkey"
            columns: ["destino_property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routes_origem_property_id_fkey"
            columns: ["origem_property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_reports: {
        Row: {
          configuracao: Json
          created_at: string
          descricao: string | null
          id: string
          nome: string
          tipo: string
          updated_at: string
        }
        Insert: {
          configuracao: Json
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          tipo: string
          updated_at?: string
        }
        Update: {
          configuracao?: Json
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
      supplies: {
        Row: {
          categoria: string
          created_at: string
          data_validade: string | null
          estoque_minimo: number | null
          fornecedor: string | null
          fornecedor_contato: string | null
          id: string
          local_armazenamento: string | null
          nome: string
          observacoes: string | null
          preco_unitario: number
          quantidade_estoque: number
          unidade_medida: string
          updated_at: string
        }
        Insert: {
          categoria: string
          created_at?: string
          data_validade?: string | null
          estoque_minimo?: number | null
          fornecedor?: string | null
          fornecedor_contato?: string | null
          id?: string
          local_armazenamento?: string | null
          nome: string
          observacoes?: string | null
          preco_unitario: number
          quantidade_estoque?: number
          unidade_medida: string
          updated_at?: string
        }
        Update: {
          categoria?: string
          created_at?: string
          data_validade?: string | null
          estoque_minimo?: number | null
          fornecedor?: string | null
          fornecedor_contato?: string | null
          id?: string
          local_armazenamento?: string | null
          nome?: string
          observacoes?: string | null
          preco_unitario?: number
          quantidade_estoque?: number
          unidade_medida?: string
          updated_at?: string
        }
        Relationships: []
      }
      supply_purchases: {
        Row: {
          created_at: string
          data_compra: string
          fornecedor: string
          id: string
          nota_fiscal: string | null
          observacoes: string | null
          preco_unitario: number
          quantidade: number
          supply_id: string
          valor_total: number
        }
        Insert: {
          created_at?: string
          data_compra: string
          fornecedor: string
          id?: string
          nota_fiscal?: string | null
          observacoes?: string | null
          preco_unitario: number
          quantidade: number
          supply_id: string
          valor_total: number
        }
        Update: {
          created_at?: string
          data_compra?: string
          fornecedor?: string
          id?: string
          nota_fiscal?: string | null
          observacoes?: string | null
          preco_unitario?: number
          quantidade?: number
          supply_id?: string
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "supply_purchases_supply_id_fkey"
            columns: ["supply_id"]
            isOneToOne: false
            referencedRelation: "supplies"
            referencedColumns: ["id"]
          },
        ]
      }
      supply_usage: {
        Row: {
          created_at: string
          data_uso: string
          id: string
          observacoes: string | null
          planting_area_id: string | null
          quantidade_usada: number
          responsavel: string | null
          safra_id: number | null
          supply_id: string
        }
        Insert: {
          created_at?: string
          data_uso: string
          id?: string
          observacoes?: string | null
          planting_area_id?: string | null
          quantidade_usada: number
          responsavel?: string | null
          safra_id?: number | null
          supply_id: string
        }
        Update: {
          created_at?: string
          data_uso?: string
          id?: string
          observacoes?: string | null
          planting_area_id?: string | null
          quantidade_usada?: number
          responsavel?: string | null
          safra_id?: number | null
          supply_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supply_usage_planting_area_id_fkey"
            columns: ["planting_area_id"]
            isOneToOne: false
            referencedRelation: "planting_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supply_usage_supply_id_fkey"
            columns: ["supply_id"]
            isOneToOne: false
            referencedRelation: "supplies"
            referencedColumns: ["id"]
          },
        ]
      }
      task_notifications: {
        Row: {
          created_at: string
          data_envio: string | null
          enviada: boolean
          id: string
          task_id: string
          tipo: string
        }
        Insert: {
          created_at?: string
          data_envio?: string | null
          enviada?: boolean
          id?: string
          task_id: string
          tipo: string
        }
        Update: {
          created_at?: string
          data_envio?: string | null
          enviada?: boolean
          id?: string
          task_id?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_notifications_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          categoria: string
          created_at: string
          data_conclusao: string | null
          data_prevista: string
          descricao: string | null
          id: string
          prioridade: string
          responsavel: string | null
          safra_id: number | null
          status: string
          titulo: string
          updated_at: string
        }
        Insert: {
          categoria: string
          created_at?: string
          data_conclusao?: string | null
          data_prevista: string
          descricao?: string | null
          id?: string
          prioridade: string
          responsavel?: string | null
          safra_id?: number | null
          status?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          categoria?: string
          created_at?: string
          data_conclusao?: string | null
          data_prevista?: string
          descricao?: string | null
          id?: string
          prioridade?: string
          responsavel?: string | null
          safra_id?: number | null
          status?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_balance: {
        Args: { end_date: string; start_date: string }
        Returns: {
          saldo: number
          total_despesas: number
          total_receitas: number
        }[]
      }
      get_annual_comparison: {
        Args: { year_end: number; year_start: number }
        Returns: {
          ano: number
          lucro: number
          num_transacoes: number
          total_despesas: number
          total_receitas: number
        }[]
      }
      get_quarterly_comparison: {
        Args: { year_param: number }
        Returns: {
          lucro: number
          total_despesas: number
          total_receitas: number
          trimestre: number
        }[]
      }
      update_overdue_tasks: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
