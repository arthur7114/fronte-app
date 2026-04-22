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
      analytics_daily: {
        Row: {
          avg_time_on_page: number | null
          bounce_rate: number | null
          clicks: number
          created_at: string
          date: string
          id: string
          page_views: number
          post_id: string | null
          source: string | null
          tenant_id: string
          unique_visitors: number
        }
        Insert: {
          avg_time_on_page?: number | null
          bounce_rate?: number | null
          clicks?: number
          created_at?: string
          date?: string
          id?: string
          page_views?: number
          post_id?: string | null
          source?: string | null
          tenant_id: string
          unique_visitors?: number
        }
        Update: {
          avg_time_on_page?: number | null
          bounce_rate?: number | null
          clicks?: number
          created_at?: string
          date?: string
          id?: string
          page_views?: number
          post_id?: string | null
          source?: string | null
          tenant_id?: string
          unique_visitors?: number
        }
        Relationships: [
          {
            foreignKeyName: "analytics_daily_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_daily_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      article_generations: {
        Row: {
          additional_instructions: string | null
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          phase: string
          post_id: string | null
          primary_keyword: string | null
          research_result: Json | null
          review_result: Json | null
          started_at: string | null
          strategy_id: string | null
          structure_result: Json | null
          target_length: string | null
          tenant_id: string
          tone: string | null
          topic: string
          updated_at: string
          write_result: Json | null
        }
        Insert: {
          additional_instructions?: string | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          phase?: string
          post_id?: string | null
          primary_keyword?: string | null
          research_result?: Json | null
          review_result?: Json | null
          started_at?: string | null
          strategy_id?: string | null
          structure_result?: Json | null
          target_length?: string | null
          tenant_id: string
          tone?: string | null
          topic: string
          updated_at?: string
          write_result?: Json | null
        }
        Update: {
          additional_instructions?: string | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          phase?: string
          post_id?: string | null
          primary_keyword?: string | null
          research_result?: Json | null
          review_result?: Json | null
          started_at?: string | null
          strategy_id?: string | null
          structure_result?: Json | null
          target_length?: string | null
          tenant_id?: string
          tone?: string | null
          topic?: string
          updated_at?: string
          write_result?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "article_generations_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_generations_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "strategies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_generations_tenant_id_fkey"
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
          interest: string
          name: string | null
          source: string | null
          source_article: string | null
          status: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          interest?: string
          name?: string | null
          source?: string | null
          source_article?: string | null
          status?: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          interest?: string
          name?: string | null
          source?: string | null
          source_article?: string | null
          status?: string
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
          strategy_id: string | null
          tenant_id: string
          topic: string
        }
        Insert: {
          angle?: string | null
          created_at?: string
          id?: string
          keywords?: string[] | null
          status?: string
          strategy_id?: string | null
          tenant_id: string
          topic: string
        }
        Update: {
          angle?: string | null
          created_at?: string
          id?: string
          keywords?: string[] | null
          status?: string
          strategy_id?: string | null
          tenant_id?: string
          topic?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_briefs_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "strategies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_briefs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      keyword_candidates: {
        Row: {
          created_at: string
          difficulty: number | null
          estimated_potential: string | null
          id: string
          journey_stage: string
          keyword: string
          motivation: string | null
          priority: string
          search_volume: string | null
          status: string
          strategy_id: string | null
          tail_type: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          difficulty?: number | null
          estimated_potential?: string | null
          id?: string
          journey_stage: string
          keyword: string
          motivation?: string | null
          priority: string
          search_volume?: string | null
          status?: string
          strategy_id?: string | null
          tail_type: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          difficulty?: number | null
          estimated_potential?: string | null
          id?: string
          journey_stage?: string
          keyword?: string
          motivation?: string | null
          priority?: string
          search_volume?: string | null
          status?: string
          strategy_id?: string | null
          tail_type?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "keyword_candidates_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "strategies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "keyword_candidates_tenant_id_fkey"
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
      newsletter_configs: {
        Row: {
          ask_name: boolean
          created_at: string | null
          cta_label: string
          description: string
          enabled: boolean
          id: string
          incentive: boolean
          incentive_text: string
          placement: string
          privacy_consent: boolean
          success_message: string
          tenant_id: string
          title: string
          trigger_type: string
          trigger_value: number
          updated_at: string | null
        }
        Insert: {
          ask_name?: boolean
          created_at?: string | null
          cta_label?: string
          description?: string
          enabled?: boolean
          id?: string
          incentive?: boolean
          incentive_text?: string
          placement?: string
          privacy_consent?: boolean
          success_message?: string
          tenant_id: string
          title?: string
          trigger_type?: string
          trigger_value?: number
          updated_at?: string | null
        }
        Update: {
          ask_name?: boolean
          created_at?: string | null
          cta_label?: string
          description?: string
          enabled?: boolean
          id?: string
          incentive?: boolean
          incentive_text?: string
          placement?: string
          privacy_consent?: boolean
          success_message?: string
          tenant_id?: string
          title?: string
          trigger_type?: string
          trigger_value?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_configs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
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
          approved_at: string | null
          approved_by: string | null
          content: string | null
          created_at: string
          generation_id: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          scheduled_for: string | null
          seo_score: number | null
          site_id: string
          slug: string
          status: string
          strategy_id: string | null
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          content?: string | null
          created_at?: string
          generation_id?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_score?: number | null
          site_id: string
          slug: string
          status?: string
          strategy_id?: string | null
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          content?: string | null
          created_at?: string
          generation_id?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_score?: number | null
          site_id?: string
          slug?: string
          status?: string
          strategy_id?: string | null
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_generation_id_fkey"
            columns: ["generation_id"]
            isOneToOne: false
            referencedRelation: "article_generations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "strategies"
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
      serp_results: {
        Row: {
          created_at: string
          id: string
          is_competitor: boolean | null
          link: string
          position: number
          snapshot_id: string
          snippet: string | null
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_competitor?: boolean | null
          link: string
          position: number
          snapshot_id: string
          snippet?: string | null
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          is_competitor?: boolean | null
          link?: string
          position?: number
          snapshot_id?: string
          snippet?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "serp_results_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "serp_snapshots"
            referencedColumns: ["id"]
          },
        ]
      }
      serp_snapshots: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          keyword: string
          query_time: string
          snapshot_data: Json
          tenant_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          keyword: string
          query_time?: string
          snapshot_data: Json
          tenant_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          keyword?: string
          query_time?: string
          snapshot_data?: Json
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "serp_snapshots_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
      strategies: {
        Row: {
          audience: string | null
          color: string | null
          created_at: string
          description: string | null
          focus: string | null
          goal: string | null
          id: string
          name: string
          operation_mode: string
          status: string
          strategy_type: string | null
          tenant_id: string
          tone: string | null
          updated_at: string
        }
        Insert: {
          audience?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          focus?: string | null
          goal?: string | null
          id?: string
          name: string
          operation_mode?: string
          status?: string
          strategy_type?: string | null
          tenant_id: string
          tone?: string | null
          updated_at?: string
        }
        Update: {
          audience?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          focus?: string | null
          goal?: string | null
          id?: string
          name?: string
          operation_mode?: string
          status?: string
          strategy_type?: string | null
          tenant_id?: string
          tone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "strategies_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      strategy_chat_messages: {
        Row: {
          chat_id: string
          content: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          chat_id: string
          content: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          chat_id?: string
          content?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "strategy_chat_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "strategy_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      strategy_chats: {
        Row: {
          created_at: string
          id: string
          strategy_id: string
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          strategy_id: string
          tenant_id: string
          title?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          strategy_id?: string
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "strategy_chats_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "strategies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "strategy_chats_tenant_id_fkey"
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
          journey_stage: string | null
          justification: string | null
          keyword_id: string | null
          scheduled_date: string | null
          score: number | null
          source: string | null
          status: string
          strategy_id: string | null
          tenant_id: string
          topic: string
        }
        Insert: {
          created_at?: string
          id?: string
          journey_stage?: string | null
          justification?: string | null
          keyword_id?: string | null
          scheduled_date?: string | null
          score?: number | null
          source?: string | null
          status?: string
          strategy_id?: string | null
          tenant_id: string
          topic: string
        }
        Update: {
          created_at?: string
          id?: string
          journey_stage?: string | null
          justification?: string | null
          keyword_id?: string | null
          scheduled_date?: string | null
          score?: number | null
          source?: string | null
          status?: string
          strategy_id?: string | null
          tenant_id?: string
          topic?: string
        }
        Relationships: [
          {
            foreignKeyName: "topic_candidates_keyword_id_fkey"
            columns: ["keyword_id"]
            isOneToOne: false
            referencedRelation: "keyword_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topic_candidates_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "strategies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topic_candidates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_competitors: {
        Row: {
          created_at: string
          domain: string
          frequency_score: number
          id: string
          last_seen: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          domain: string
          frequency_score?: number
          id?: string
          last_seen?: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          domain?: string
          frequency_score?: number
          id?: string
          last_seen?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_competitors_tenant_id_fkey"
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
