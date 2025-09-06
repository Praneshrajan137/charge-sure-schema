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
      charger_ratings: {
        Row: {
          charger_id: string
          created_at: string
          id: string
          rating: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          charger_id: string
          created_at?: string
          id?: string
          rating: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          charger_id?: string
          created_at?: string
          id?: string
          rating?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      charger_status_updates: {
        Row: {
          charger_id: string
          created_at: string
          id: string
          new_status: string
          notes: string | null
          old_status: string
          reported_at: string
          reported_by: string | null
        }
        Insert: {
          charger_id: string
          created_at?: string
          id?: string
          new_status: string
          notes?: string | null
          old_status: string
          reported_at?: string
          reported_by?: string | null
        }
        Update: {
          charger_id?: string
          created_at?: string
          id?: string
          new_status?: string
          notes?: string | null
          old_status?: string
          reported_at?: string
          reported_by?: string | null
        }
        Relationships: []
      }
      chargers: {
        Row: {
          charger_id: string
          created_at: string
          current_status: string
          last_update_timestamp: string | null
          last_verified_at: string | null
          max_power_kw: number
          plug_type: string
          rating_count: number | null
          rating_score: number | null
          station_id: string
          updated_at: string
          verification_count: number | null
        }
        Insert: {
          charger_id: string
          created_at?: string
          current_status?: string
          last_update_timestamp?: string | null
          last_verified_at?: string | null
          max_power_kw: number
          plug_type: string
          rating_count?: number | null
          rating_score?: number | null
          station_id: string
          updated_at?: string
          verification_count?: number | null
        }
        Update: {
          charger_id?: string
          created_at?: string
          current_status?: string
          last_update_timestamp?: string | null
          last_verified_at?: string | null
          max_power_kw?: number
          plug_type?: string
          rating_count?: number | null
          rating_score?: number | null
          station_id?: string
          updated_at?: string
          verification_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "chargers_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["station_id"]
          },
        ]
      }
      stations: {
        Row: {
          address: string
          created_at: string
          latitude: number
          longitude: number
          name: string
          station_id: string
          updated_at: string
        }
        Insert: {
          address: string
          created_at?: string
          latitude: number
          longitude: number
          name: string
          station_id: string
          updated_at?: string
        }
        Update: {
          address?: string
          created_at?: string
          latitude?: number
          longitude?: number
          name?: string
          station_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_analytics: {
        Row: {
          charger_id: string | null
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          station_id: string | null
          user_id: string | null
        }
        Insert: {
          charger_id?: string | null
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          station_id?: string | null
          user_id?: string | null
        }
        Update: {
          charger_id?: string | null
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          station_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_charger_status: {
        Args: {
          p_charger_id: string
          p_new_status: string
          p_notes?: string
          p_reported_by?: string
        }
        Returns: {
          message: string
          success: boolean
        }[]
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
