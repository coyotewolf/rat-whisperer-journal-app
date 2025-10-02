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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      behavior_tags: {
        Row: {
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_interaction_surveys: {
        Row: {
          answers: Json | null
          completed_at: string | null
          created_at: string | null
          id: string
          processed_behaviors: Json | null
          questions: Json
          survey_date: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          answers?: Json | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          processed_behaviors?: Json | null
          questions: Json
          survey_date: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          answers?: Json | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          processed_behaviors?: Json | null
          questions?: Json
          survey_date?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      default_personality_tags: {
        Row: {
          color: string
          created_at: string
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          color: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      health_alerts_cache: {
        Row: {
          analysis_data: Json
          created_at: string
          id: string
          last_log_timestamp: string
          log_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_data: Json
          created_at?: string
          id?: string
          last_log_timestamp: string
          log_count: number
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_data?: Json
          created_at?: string
          id?: string
          last_log_timestamp?: string
          log_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      hierarchy_analysis_cache: {
        Row: {
          analysis_data: Json
          behavior_log_count: number
          created_at: string | null
          id: string
          last_behavior_log_timestamp: string
          time_range: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          analysis_data: Json
          behavior_log_count: number
          created_at?: string | null
          id?: string
          last_behavior_log_timestamp: string
          time_range: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          analysis_data?: Json
          behavior_log_count?: number
          created_at?: string | null
          id?: string
          last_behavior_log_timestamp?: string
          time_range?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      hierarchy_invalidation_triggers: {
        Row: {
          created_at: string | null
          id: string
          log_entry_id: string | null
          trigger_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          log_entry_id?: string | null
          trigger_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          log_entry_id?: string | null
          trigger_type?: string
          user_id?: string
        }
        Relationships: []
      }
      log_entries: {
        Row: {
          content: Json
          created_at: string
          id: string
          rat_ids: string[]
          type: string
          user_id: string
        }
        Insert: {
          content: Json
          created_at?: string
          id?: string
          rat_ids?: string[]
          type: string
          user_id: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          rat_ids?: string[]
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      log_tag_categories: {
        Row: {
          color: string
          created_at: string
          display_name: string
          id: string
          is_default: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          display_name: string
          id?: string
          is_default?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          display_name?: string
          id?: string
          is_default?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      log_tag_suggestions: {
        Row: {
          category: string | null
          color: string
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          color?: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          color?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_log_tag_suggestions_category"
            columns: ["user_id", "category"]
            isOneToOne: false
            referencedRelation: "log_tag_categories"
            referencedColumns: ["user_id", "name"]
          },
        ]
      }
      map_data: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          latitude: number
          longitude: number
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          latitude: number
          longitude: number
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          latitude?: number
          longitude?: number
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      personality_tags: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rat_rank_history: {
        Row: {
          analysis_time: string
          dominance_score: number
          id: string
          rank: number
          rat_id: string
          rat_name: string
          time_range: number | null
          user_id: string
        }
        Insert: {
          analysis_time?: string
          dominance_score: number
          id?: string
          rank: number
          rat_id: string
          rat_name: string
          time_range?: number | null
          user_id: string
        }
        Update: {
          analysis_time?: string
          dominance_score?: number
          id?: string
          rank?: number
          rat_id?: string
          rat_name?: string
          time_range?: number | null
          user_id?: string
        }
        Relationships: []
      }
      rats: {
        Row: {
          birthday: string
          created_at: string
          id: string
          name: string
          personality: Json | null
          profile_picture: string | null
          sex: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          birthday: string
          created_at?: string
          id?: string
          name: string
          personality?: Json | null
          profile_picture?: string | null
          sex: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          birthday?: string
          created_at?: string
          id?: string
          name?: string
          personality?: Json | null
          profile_picture?: string | null
          sex?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reminder_settings: {
        Row: {
          created_at: string
          custom_message: string | null
          enabled: boolean
          frequency_days: number
          id: string
          priority: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_message?: string | null
          enabled?: boolean
          frequency_days: number
          id?: string
          priority: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          custom_message?: string | null
          enabled?: boolean
          frequency_days?: number
          id?: string
          priority?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      task_suggestions: {
        Row: {
          color: string
          created_at: string
          description: string | null
          id: string
          location: string | null
          name: string
          priority: string | null
          quantity: number | null
          title: string | null
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          name: string
          priority?: string | null
          quantity?: number | null
          title?: string | null
          unit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          name?: string
          priority?: string | null
          quantity?: number | null
          title?: string | null
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          completed: boolean
          created_at: string
          description: string | null
          due_date: string
          due_time: string | null
          id: string
          location: string | null
          priority: string
          quantity: number | null
          repeat_options: Json | null
          title: string
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          description?: string | null
          due_date: string
          due_time?: string | null
          id?: string
          location?: string | null
          priority: string
          quantity?: number | null
          repeat_options?: Json | null
          title: string
          unit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          description?: string | null
          due_date?: string
          due_time?: string | null
          id?: string
          location?: string | null
          priority?: string
          quantity?: number | null
          repeat_options?: Json | null
          title?: string
          unit?: string | null
          updated_at?: string
          user_id?: string
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
          role?: Database["public"]["Enums"]["app_role"]
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
      user_settings: {
        Row: {
          created_at: string
          font_size: number | null
          id: string
          language: string | null
          theme: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          font_size?: number | null
          id?: string
          language?: string | null
          theme?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          font_size?: number | null
          id?: string
          language?: string | null
          theme?: string | null
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
      delete_user_by_id: {
        Args: { user_id: number } | { user_id_to_delete: string }
        Returns: undefined
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "tester" | "user"
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
      app_role: ["tester", "user"],
    },
  },
} as const
