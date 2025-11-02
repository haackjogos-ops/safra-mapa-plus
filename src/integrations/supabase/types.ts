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
      agronomo_agricultor: {
        Row: {
          agricultor_id: string
          agronomo_id: string
          ativo: boolean | null
          created_at: string | null
          data_vinculo: string | null
          id: string
          observacoes: string | null
        }
        Insert: {
          agricultor_id: string
          agronomo_id: string
          ativo?: boolean | null
          created_at?: string | null
          data_vinculo?: string | null
          id?: string
          observacoes?: string | null
        }
        Update: {
          agricultor_id?: string
          agronomo_id?: string
          ativo?: boolean | null
          created_at?: string | null
          data_vinculo?: string | null
          id?: string
          observacoes?: string | null
        }
        Relationships: []
      }
      applications: {
        Row: {
          application_cost: number | null
          application_date: string
          area_applied: number
          created_at: string
          end_time: string | null
          equipment_id: string | null
          equipment_type: string
          id: string
          observations: string | null
          operator_id: string | null
          planting_area_id: string
          product_dosage: number
          start_time: string | null
          supply_id: string
          total_product_used: number
          total_spray_volume: number
          updated_at: string
          weather_humidity: number | null
          weather_temperature: number | null
          weather_wind_speed: number | null
        }
        Insert: {
          application_cost?: number | null
          application_date: string
          area_applied: number
          created_at?: string
          end_time?: string | null
          equipment_id?: string | null
          equipment_type: string
          id?: string
          observations?: string | null
          operator_id?: string | null
          planting_area_id: string
          product_dosage: number
          start_time?: string | null
          supply_id: string
          total_product_used: number
          total_spray_volume: number
          updated_at?: string
          weather_humidity?: number | null
          weather_temperature?: number | null
          weather_wind_speed?: number | null
        }
        Update: {
          application_cost?: number | null
          application_date?: string
          area_applied?: number
          created_at?: string
          end_time?: string | null
          equipment_id?: string | null
          equipment_type?: string
          id?: string
          observations?: string | null
          operator_id?: string | null
          planting_area_id?: string
          product_dosage?: number
          start_time?: string | null
          supply_id?: string
          total_product_used?: number
          total_spray_volume?: number
          updated_at?: string
          weather_humidity?: number | null
          weather_temperature?: number | null
          weather_wind_speed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operadores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_planting_area_id_fkey"
            columns: ["planting_area_id"]
            isOneToOne: false
            referencedRelation: "planting_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_supply_id_fkey"
            columns: ["supply_id"]
            isOneToOne: false
            referencedRelation: "supplies"
            referencedColumns: ["id"]
          },
        ]
      }
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
      equipamentos: {
        Row: {
          ano_fabricacao: number | null
          capacidade: string | null
          created_at: string
          data_aquisicao: string | null
          hodometro_atual: number | null
          horimetro_atual: number | null
          id: string
          marca: string | null
          modelo: string | null
          nome: string
          numero_serie: string | null
          observacoes: string | null
          placa: string | null
          status: string
          tipo: string
          updated_at: string
          valor_aquisicao: number | null
        }
        Insert: {
          ano_fabricacao?: number | null
          capacidade?: string | null
          created_at?: string
          data_aquisicao?: string | null
          hodometro_atual?: number | null
          horimetro_atual?: number | null
          id?: string
          marca?: string | null
          modelo?: string | null
          nome: string
          numero_serie?: string | null
          observacoes?: string | null
          placa?: string | null
          status?: string
          tipo: string
          updated_at?: string
          valor_aquisicao?: number | null
        }
        Update: {
          ano_fabricacao?: number | null
          capacidade?: string | null
          created_at?: string
          data_aquisicao?: string | null
          hodometro_atual?: number | null
          horimetro_atual?: number | null
          id?: string
          marca?: string | null
          modelo?: string | null
          nome?: string
          numero_serie?: string | null
          observacoes?: string | null
          placa?: string | null
          status?: string
          tipo?: string
          updated_at?: string
          valor_aquisicao?: number | null
        }
        Relationships: []
      }
      escala_trabalho: {
        Row: {
          area_trabalhada: number | null
          atividade: string | null
          created_at: string
          data_fim: string | null
          data_inicio: string
          equipamento_id: string
          hodometro_fim: number | null
          hodometro_inicio: number | null
          horimetro_fim: number | null
          horimetro_inicio: number | null
          id: string
          observacoes: string | null
          operador_id: string
          planting_area_id: string | null
          updated_at: string
        }
        Insert: {
          area_trabalhada?: number | null
          atividade?: string | null
          created_at?: string
          data_fim?: string | null
          data_inicio: string
          equipamento_id: string
          hodometro_fim?: number | null
          hodometro_inicio?: number | null
          horimetro_fim?: number | null
          horimetro_inicio?: number | null
          id?: string
          observacoes?: string | null
          operador_id: string
          planting_area_id?: string | null
          updated_at?: string
        }
        Update: {
          area_trabalhada?: number | null
          atividade?: string | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          equipamento_id?: string
          hodometro_fim?: number | null
          hodometro_inicio?: number | null
          horimetro_fim?: number | null
          horimetro_inicio?: number | null
          id?: string
          observacoes?: string | null
          operador_id?: string
          planting_area_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "escala_trabalho_equipamento_id_fkey"
            columns: ["equipamento_id"]
            isOneToOne: false
            referencedRelation: "equipamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escala_trabalho_operador_id_fkey"
            columns: ["operador_id"]
            isOneToOne: false
            referencedRelation: "operadores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escala_trabalho_planting_area_id_fkey"
            columns: ["planting_area_id"]
            isOneToOne: false
            referencedRelation: "planting_areas"
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
      lavoura_fotos: {
        Row: {
          agricultor_id: string
          created_at: string | null
          data_envio: string | null
          descricao: string | null
          foto_url: string
          id: string
          latitude: number | null
          localizacao: string | null
          longitude: number | null
          planting_area_id: string | null
          safra_id: string | null
          status: string | null
        }
        Insert: {
          agricultor_id: string
          created_at?: string | null
          data_envio?: string | null
          descricao?: string | null
          foto_url: string
          id?: string
          latitude?: number | null
          localizacao?: string | null
          longitude?: number | null
          planting_area_id?: string | null
          safra_id?: string | null
          status?: string | null
        }
        Update: {
          agricultor_id?: string
          created_at?: string | null
          data_envio?: string | null
          descricao?: string | null
          foto_url?: string
          id?: string
          latitude?: number | null
          localizacao?: string | null
          longitude?: number | null
          planting_area_id?: string | null
          safra_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lavoura_fotos_planting_area_id_fkey"
            columns: ["planting_area_id"]
            isOneToOne: false
            referencedRelation: "planting_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lavoura_fotos_safra_id_fkey"
            columns: ["safra_id"]
            isOneToOne: false
            referencedRelation: "safras"
            referencedColumns: ["id"]
          },
        ]
      }
      manutencoes: {
        Row: {
          created_at: string
          custo: number | null
          data_manutencao: string
          descricao: string
          equipamento_id: string
          hodometro: number | null
          horimetro: number | null
          id: string
          observacoes: string | null
          pecas_trocadas: string[] | null
          proxima_manutencao: string | null
          responsavel: string | null
          status: string
          tipo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          custo?: number | null
          data_manutencao: string
          descricao: string
          equipamento_id: string
          hodometro?: number | null
          horimetro?: number | null
          id?: string
          observacoes?: string | null
          pecas_trocadas?: string[] | null
          proxima_manutencao?: string | null
          responsavel?: string | null
          status?: string
          tipo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          custo?: number | null
          data_manutencao?: string
          descricao?: string
          equipamento_id?: string
          hodometro?: number | null
          horimetro?: number | null
          id?: string
          observacoes?: string | null
          pecas_trocadas?: string[] | null
          proxima_manutencao?: string | null
          responsavel?: string | null
          status?: string
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "manutencoes_equipamento_id_fkey"
            columns: ["equipamento_id"]
            isOneToOne: false
            referencedRelation: "equipamentos"
            referencedColumns: ["id"]
          },
        ]
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
      notificacoes: {
        Row: {
          created_at: string | null
          id: string
          lida: boolean | null
          link: string | null
          mensagem: string
          tipo: string
          titulo: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          lida?: boolean | null
          link?: string | null
          mensagem: string
          tipo: string
          titulo: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          lida?: boolean | null
          link?: string | null
          mensagem?: string
          tipo?: string
          titulo?: string
          user_id?: string
        }
        Relationships: []
      }
      operadores: {
        Row: {
          cnh_categoria: string | null
          cnh_numero: string | null
          cnh_validade: string | null
          cpf: string | null
          created_at: string
          data_admissao: string | null
          email: string | null
          especializacao: string[] | null
          id: string
          nome: string
          observacoes: string | null
          status: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          cnh_categoria?: string | null
          cnh_numero?: string | null
          cnh_validade?: string | null
          cpf?: string | null
          created_at?: string
          data_admissao?: string | null
          email?: string | null
          especializacao?: string[] | null
          id?: string
          nome: string
          observacoes?: string | null
          status?: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          cnh_categoria?: string | null
          cnh_numero?: string | null
          cnh_validade?: string | null
          cpf?: string | null
          created_at?: string
          data_admissao?: string | null
          email?: string | null
          especializacao?: string[] | null
          id?: string
          nome?: string
          observacoes?: string | null
          status?: string
          telefone?: string | null
          updated_at?: string
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
      profiles: {
        Row: {
          avatar_url: string | null
          cidade: string | null
          created_at: string | null
          estado: string | null
          id: string
          nome_completo: string
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          cidade?: string | null
          created_at?: string | null
          estado?: string | null
          id: string
          nome_completo: string
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          cidade?: string | null
          created_at?: string | null
          estado?: string | null
          id?: string
          nome_completo?: string
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
      recomendacoes: {
        Row: {
          agricultor_id: string
          agronomo_id: string
          area_aplicacao: string | null
          created_at: string | null
          custo_estimado: number | null
          data_conclusao: string | null
          data_prevista_execucao: string | null
          data_recomendacao: string | null
          descricao: string
          dosagem: string | null
          foto_id: string | null
          id: string
          observacoes_agricultor: string | null
          prioridade: string | null
          produto_recomendado: string | null
          safra_id: string | null
          status: string | null
          tipo: string
          titulo: string
          updated_at: string | null
        }
        Insert: {
          agricultor_id: string
          agronomo_id: string
          area_aplicacao?: string | null
          created_at?: string | null
          custo_estimado?: number | null
          data_conclusao?: string | null
          data_prevista_execucao?: string | null
          data_recomendacao?: string | null
          descricao: string
          dosagem?: string | null
          foto_id?: string | null
          id?: string
          observacoes_agricultor?: string | null
          prioridade?: string | null
          produto_recomendado?: string | null
          safra_id?: string | null
          status?: string | null
          tipo: string
          titulo: string
          updated_at?: string | null
        }
        Update: {
          agricultor_id?: string
          agronomo_id?: string
          area_aplicacao?: string | null
          created_at?: string | null
          custo_estimado?: number | null
          data_conclusao?: string | null
          data_prevista_execucao?: string | null
          data_recomendacao?: string | null
          descricao?: string
          dosagem?: string | null
          foto_id?: string | null
          id?: string
          observacoes_agricultor?: string | null
          prioridade?: string | null
          produto_recomendado?: string | null
          safra_id?: string | null
          status?: string | null
          tipo?: string
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recomendacoes_foto_id_fkey"
            columns: ["foto_id"]
            isOneToOne: false
            referencedRelation: "lavoura_fotos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recomendacoes_safra_id_fkey"
            columns: ["safra_id"]
            isOneToOne: false
            referencedRelation: "safras"
            referencedColumns: ["id"]
          },
        ]
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
      safras: {
        Row: {
          area: string
          created_at: string
          cultura: string
          data_plantio: string
          fase: string
          id: string
          irrigacao: string
          previsao_colheita: string
          progresso: number
          proxima_atividade: string | null
          updated_at: string
          variedade: string
        }
        Insert: {
          area: string
          created_at?: string
          cultura: string
          data_plantio: string
          fase?: string
          id?: string
          irrigacao: string
          previsao_colheita: string
          progresso?: number
          proxima_atividade?: string | null
          updated_at?: string
          variedade: string
        }
        Update: {
          area?: string
          created_at?: string
          cultura?: string
          data_plantio?: string
          fase?: string
          id?: string
          irrigacao?: string
          previsao_colheita?: string
          progresso?: number
          proxima_atividade?: string | null
          updated_at?: string
          variedade?: string
        }
        Relationships: []
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
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      update_overdue_tasks: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "agronomo" | "agricultor" | "suporte" | "admin"
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
      app_role: ["agronomo", "agricultor", "suporte", "admin"],
    },
  },
} as const
