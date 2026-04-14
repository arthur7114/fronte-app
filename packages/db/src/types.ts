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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      ai_preferences: {
        Row: {
          created_at: string
          expertise_level: string | null
          id: string
          model: string
          tenant_id: string
          tone_of_voice: string | null
          updated_at: string
          writing_style: string | null
        }
        Insert: {
          created_at?: string
          expertise_level?: string | null
          id?: string
          model?: string
          tenant_id: string
          tone_of_voice?: string | null
          updated_at?: string
          writing_style?: string | null
        }
        Update: {
          created_at?: string
          expertise_level?: string | null
          id?: string
          model?: string
          tenant_id?: string
          tone_of_voice?: string | null
          updated_at?: string
          writing_style?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_preferences_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_rules: {
        Row: {
          content: string
          created_at: string
          id: string
          rule_type: string
          tenant_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          rule_type: string
          tenant_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          rule_type?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_rules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_configs: {
        Row: {
          approval_required: boolean
          created_at: string
          frequency: string
          id: string
          keywords_seed: string[] | null
          language: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          approval_required?: boolean
          created_at?: string
          frequency?: string
          id?: string
          keywords_seed?: string[] | null
          language?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          approval_required?: boolean
          created_at?: string
          frequency?: string
          id?: string
          keywords_seed?: string[] | null
          language?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_configs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_jobs: {
        Row: {
          attempts: number
          created_at: string
          error_message: string | null
          finished_at: string | null
          id: string
          max_attempts: number
          payload_json: Json | null
          priority: number
          result_json: Json | null
          scheduled_for: string | null
          site_id: string | null
          started_at: string | null
          status: string
          tenant_id: string
          type: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          error_message?: string | null
          finished_at?: string | null
          id?: string
          max_attempts?: number
          payload_json?: Json | null
          priority?: number
          result_json?: Json | null
          scheduled_for?: string | null
          site_id?: string | null
          started_at?: string | null
          status?: string
          tenant_id: string
          type: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          created_at?: string
          error_message?: string | null
          finished_at?: string | null
          id?: string
          max_attempts?: number
          payload_json?: Json | null
          priority?: number
          result_json?: Json | null
          scheduled_for?: string | null
          site_id?: string | null
          started_at?: string | null
          status?: string
          tenant_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_jobs_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_jobs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      business_briefings: {
        Row: {
          business_name: string
          competitors: string[] | null
          created_at: string
          customer_profile: string
          desired_keywords: string[] | null
          id: string
          keyword_motivation: string | null
          location: string | null
          notes: string | null
          offerings: string
          segment: string
          site_id: string | null
          status: string
          summary: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          business_name: string
          competitors?: string[] | null
          created_at?: string
          customer_profile: string
          desired_keywords?: string[] | null
          id?: string
          keyword_motivation?: string | null
          location?: string | null
          notes?: string | null
          offerings: string
          segment: string
          site_id?: string | null
          status?: string
          summary?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          business_name?: string
          competitors?: string[] | null
          created_at?: string
          customer_profile?: string
          desired_keywords?: string[] | null
          id?: string
          keyword_motivation?: string | null
          location?: string | null
          notes?: string | null
          offerings?: string
          segment?: string
          site_id?: string | null
          status?: string
          summary?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_briefings_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_briefings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          source: string | null
          tenant_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name?: string | null
          source?: string | null
          tenant_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          source?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      content_briefs: {
        Row: {
          angle: string | null
          created_at: string
          id: string
          keywords: string[] | null
          status: string
          tenant_id: string
          topic: string
        }
        Insert: {
          angle?: string | null
          created_at?: string
          id?: string
          keywords?: string[] | null
          status?: string
          tenant_id: string
          topic: string
        }
        Update: {
          angle?: string | null
          created_at?: string
          id?: string
          keywords?: string[] | null
          status?: string
          tenant_id?: string
          topic?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_briefs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          created_at: string
          id: string
          role: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      post_metrics: {
        Row: {
          clicks: number
          created_at: string
          id: string
          post_id: string
          rank_position: number | null
          updated_at: string
          views: number
        }
        Insert: {
          clicks?: number
          created_at?: string
          id?: string
          post_id: string
          rank_position?: number | null
          updated_at?: string
          views?: number
        }
        Update: {
          clicks?: number
          created_at?: string
          id?: string
          post_id?: string
          rank_position?: number | null
          updated_at?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "post_metrics_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_revisions: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_revisions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content: string | null
          created_at: string
          id: string
          published_at: string | null
          site_id: string
          slug: string
          status: string
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          published_at?: string | null
          site_id: string
          slug: string
          status?: string
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          published_at?: string | null
          site_id?: string
          slug?: string
          status?: string
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      sites: {
        Row: {
          created_at: string
          custom_domain: string | null
          id: string
          language: string
          name: string
          subdomain: string
          tenant_id: string
          theme_id: string | null
        }
        Insert: {
          created_at?: string
          custom_domain?: string | null
          id?: string
          language?: string
          name: string
          subdomain: string
          tenant_id: string
          theme_id?: string | null
        }
        Update: {
          created_at?: string
          custom_domain?: string | null
          id?: string
          language?: string
          name?: string
          subdomain?: string
          tenant_id?: string
          theme_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sites_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string
          id: string
          name: string
          plan: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          plan?: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          plan?: string
          slug?: string
        }
        Relationships: []
      }
      topic_candidates: {
        Row: {
          created_at: string
          id: string
          score: number | null
          source: string | null
          status: string
          tenant_id: string
          topic: string
        }
        Insert: {
          created_at?: string
          id?: string
          score?: number | null
          source?: string | null
          status?: string
          tenant_id: string
          topic: string
        }
        Update: {
          created_at?: string
          id?: string
          score?: number | null
          source?: string | null
          status?: string
          tenant_id?: string
          topic?: string
        }
        Relationships: [
          {
            foreignKeyName: "topic_candidates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      keyword_candidates: {
        Row: {
          id: string
          tenant_id: string
          keyword: string
          priority: "high" | "medium" | "low"
          journey_stage: "top" | "middle" | "bottom"
          tail_type: "short" | "long"
          motivation: string | null
          status: "pending" | "approved" | "rejected"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          keyword: string
          priority: "high" | "medium" | "low"
          journey_stage: "top" | "middle" | "bottom"
          tail_type: "short" | "long"
          motivation?: string | null
          status?: "pending" | "approved" | "rejected"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          keyword?: string
          priority?: "high" | "medium" | "low"
          journey_stage?: "top" | "middle" | "bottom"
          tail_type?: "short" | "long"
          motivation?: string | null
          status?: "pending" | "approved" | "rejected"
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "keyword_candidates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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

