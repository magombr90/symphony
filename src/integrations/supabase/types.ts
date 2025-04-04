export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          cep: string | null
          cnpj: string
          created_at: string
          email: string | null
          endereco: string | null
          id: string
          nome_fantasia: string | null
          observacoes: string | null
          razao_social: string
          telefone: string | null
        }
        Insert: {
          cep?: string | null
          cnpj: string
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          nome_fantasia?: string | null
          observacoes?: string | null
          razao_social: string
          telefone?: string | null
        }
        Update: {
          cep?: string | null
          cnpj?: string
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          nome_fantasia?: string | null
          observacoes?: string | null
          razao_social?: string
          telefone?: string | null
        }
        Relationships: []
      }
      equipamentos: {
        Row: {
          client_id: string | null
          codigo: string
          condicao: Database["public"]["Enums"]["equipment_condition"]
          created_at: string
          entregue_at: string | null
          equipamento: string
          id: string
          numero_serie: string | null
          observacoes: string | null
          status: string | null
          ticket_id: string | null
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          codigo: string
          condicao: Database["public"]["Enums"]["equipment_condition"]
          created_at?: string
          entregue_at?: string | null
          equipamento: string
          id?: string
          numero_serie?: string | null
          observacoes?: string | null
          status?: string | null
          ticket_id?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          codigo?: string
          condicao?: Database["public"]["Enums"]["equipment_condition"]
          created_at?: string
          entregue_at?: string | null
          equipamento?: string
          id?: string
          numero_serie?: string | null
          observacoes?: string | null
          status?: string | null
          ticket_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipamentos_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipamentos_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipamentos_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets_with_equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      system_users: {
        Row: {
          active: boolean
          created_at: string | null
          email: string
          id: string
          name: string
          role: string
        }
        Insert: {
          active?: boolean
          created_at?: string | null
          email: string
          id: string
          name: string
          role?: string
        }
        Update: {
          active?: boolean
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          role?: string
        }
        Relationships: []
      }
      ticket_history: {
        Row: {
          action_type: string
          created_at: string
          created_by: string
          equipment_codigo: string | null
          equipment_id: string | null
          equipment_status: string | null
          id: string
          new_assigned_to: string | null
          previous_assigned_to: string | null
          previous_status: string | null
          reason: string | null
          status: string
          ticket_id: string
          time_spent: number | null
        }
        Insert: {
          action_type?: string
          created_at?: string
          created_by: string
          equipment_codigo?: string | null
          equipment_id?: string | null
          equipment_status?: string | null
          id?: string
          new_assigned_to?: string | null
          previous_assigned_to?: string | null
          previous_status?: string | null
          reason?: string | null
          status: string
          ticket_id: string
          time_spent?: number | null
        }
        Update: {
          action_type?: string
          created_at?: string
          created_by?: string
          equipment_codigo?: string | null
          equipment_id?: string | null
          equipment_status?: string | null
          id?: string
          new_assigned_to?: string | null
          previous_assigned_to?: string | null
          previous_status?: string | null
          reason?: string | null
          status?: string
          ticket_id?: string
          time_spent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_history_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_history_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets_with_equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          assigned_to: string | null
          client_id: string
          codigo: string
          created_at: string
          created_by: string
          description: string
          faturado: boolean | null
          faturado_at: string | null
          id: string
          scheduled_for: string
          started_at: string | null
          status: string
          time_spent: number | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          client_id: string
          codigo: string
          created_at?: string
          created_by: string
          description: string
          faturado?: boolean | null
          faturado_at?: string | null
          id?: string
          scheduled_for: string
          started_at?: string | null
          status: string
          time_spent?: number | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          client_id?: string
          codigo?: string
          created_at?: string
          created_by?: string
          description?: string
          faturado?: boolean | null
          faturado_at?: string | null
          id?: string
          scheduled_for?: string
          started_at?: string | null
          status?: string
          time_spent?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      tickets_with_equipment: {
        Row: {
          assigned_to: string | null
          client_id: string | null
          codigo: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          equipamentos: Json | null
          faturado: boolean | null
          faturado_at: string | null
          id: string | null
          scheduled_for: string | null
          status: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      can_move_ticket: {
        Args: {
          ticket_id: string
          user_id: string
        }
        Returns: boolean
      }
      create_system_user: {
        Args: {
          user_name: string
          user_email: string
          user_password: string
          user_role: string
          user_active: boolean
        }
        Returns: string
      }
      update_user_password: {
        Args: {
          user_id: string
          new_password: string
        }
        Returns: undefined
      }
    }
    Enums: {
      equipment_condition: "NOVO" | "USADO" | "DEFEITO"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
