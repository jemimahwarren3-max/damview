// Generated from the live Supabase project (jbmakvbmyddvlgfjonmc) via the
// Supabase MCP `generate_typescript_types` tool. Regenerate after schema changes.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      activities: {
        Row: {
          category: string;
          description: string;
          id: string;
          image: string | null;
          name: string;
          price_amount: number | null;
          price_unit: string | null;
        };
        Insert: {
          category: string;
          description: string;
          id: string;
          image?: string | null;
          name: string;
          price_amount?: number | null;
          price_unit?: string | null;
        };
        Update: {
          category?: string;
          description?: string;
          id?: string;
          image?: string | null;
          name?: string;
          price_amount?: number | null;
          price_unit?: string | null;
        };
        Relationships: [];
      };
      activity_enquiries: {
        Row: {
          activity_id: string;
          created_at: string;
          email: string | null;
          id: string;
          message: string | null;
          name: string;
          party_size: number | null;
          phone: string;
          preferred_date: string | null;
          status: string;
        };
        Insert: {
          activity_id: string;
          created_at?: string;
          email?: string | null;
          id?: string;
          message?: string | null;
          name: string;
          party_size?: number | null;
          phone: string;
          preferred_date?: string | null;
          status?: string;
        };
        Update: {
          activity_id?: string;
          created_at?: string;
          email?: string | null;
          id?: string;
          message?: string | null;
          name?: string;
          party_size?: number | null;
          phone?: string;
          preferred_date?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "activity_enquiries_activity_id_fkey";
            columns: ["activity_id"];
            isOneToOne: false;
            referencedRelation: "activities";
            referencedColumns: ["id"];
          },
        ];
      };
      document_line_items: {
        Row: {
          description: string;
          document_id: string;
          id: string;
          quantity: number;
          unit_price: number;
        };
        Insert: {
          description: string;
          document_id: string;
          id?: string;
          quantity?: number;
          unit_price: number;
        };
        Update: {
          description?: string;
          document_id?: string;
          id?: string;
          quantity?: number;
          unit_price?: number;
        };
        Relationships: [
          {
            foreignKeyName: "document_line_items_document_id_fkey";
            columns: ["document_id"];
            isOneToOne: false;
            referencedRelation: "documents";
            referencedColumns: ["id"];
          },
        ];
      };
      documents: {
        Row: {
          amount_paid: number;
          created_at: string;
          customer_name: string;
          document_number: string;
          document_type: string;
          id: string;
          issue_date: string;
        };
        Insert: {
          amount_paid?: number;
          created_at?: string;
          customer_name: string;
          document_number: string;
          document_type: string;
          id?: string;
          issue_date?: string;
        };
        Update: {
          amount_paid?: number;
          created_at?: string;
          customer_name?: string;
          document_number?: string;
          document_type?: string;
          id?: string;
          issue_date?: string;
        };
        Relationships: [];
      };
      event_enquiries: {
        Row: {
          accommodation_required: boolean;
          catering_required: boolean;
          created_at: string;
          email: string | null;
          event_type: string;
          expected_guests: number;
          facilities_required: string[];
          id: string;
          message: string | null;
          name: string;
          phone: string;
          proposed_date: string;
          status: string;
        };
        Insert: {
          accommodation_required?: boolean;
          catering_required?: boolean;
          created_at?: string;
          email?: string | null;
          event_type: string;
          expected_guests: number;
          facilities_required?: string[];
          id?: string;
          message?: string | null;
          name: string;
          phone: string;
          proposed_date: string;
          status?: string;
        };
        Update: {
          accommodation_required?: boolean;
          catering_required?: boolean;
          created_at?: string;
          email?: string | null;
          event_type?: string;
          expected_guests?: number;
          facilities_required?: string[];
          id?: string;
          message?: string | null;
          name?: string;
          phone?: string;
          proposed_date?: string;
          status?: string;
        };
        Relationships: [];
      };
      gallery_items: {
        Row: {
          caption: string | null;
          category: string;
          created_at: string;
          id: string;
          type: string;
          url: string;
        };
        Insert: {
          caption?: string | null;
          category: string;
          created_at?: string;
          id?: string;
          type: string;
          url: string;
        };
        Update: {
          caption?: string | null;
          category?: string;
          created_at?: string;
          id?: string;
          type?: string;
          url?: string;
        };
        Relationships: [];
      };
      guest_reviews: {
        Row: {
          created_at: string;
          guest_name: string;
          id: string;
          image: string | null;
          quote: string;
          rating: number;
          status: string;
        };
        Insert: {
          created_at?: string;
          guest_name: string;
          id?: string;
          image?: string | null;
          quote: string;
          rating: number;
          status?: string;
        };
        Update: {
          created_at?: string;
          guest_name?: string;
          id?: string;
          image?: string | null;
          quote?: string;
          rating?: number;
          status?: string;
        };
        Relationships: [];
      };
      gym_enquiries: {
        Row: {
          created_at: string;
          email: string | null;
          id: string;
          message: string | null;
          name: string;
          package_id: string | null;
          phone: string;
          status: string;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          id?: string;
          message?: string | null;
          name: string;
          package_id?: string | null;
          phone: string;
          status?: string;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          id?: string;
          message?: string | null;
          name?: string;
          package_id?: string | null;
          phone?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "gym_enquiries_package_id_fkey";
            columns: ["package_id"];
            isOneToOne: false;
            referencedRelation: "gym_packages";
            referencedColumns: ["id"];
          },
        ];
      };
      gym_packages: {
        Row: {
          billing_period: string;
          features: string[];
          id: string;
          name: string;
          price: number | null;
        };
        Insert: {
          billing_period: string;
          features?: string[];
          id: string;
          name: string;
          price?: number | null;
        };
        Update: {
          billing_period?: string;
          features?: string[];
          id?: string;
          name?: string;
          price?: number | null;
        };
        Relationships: [];
      };
      lodge_enquiries: {
        Row: {
          block_id: string | null;
          check_in: string;
          created_at: string;
          email: string | null;
          guests: number;
          id: string;
          message: string | null;
          name: string;
          phone: string;
          status: string;
        };
        Insert: {
          block_id?: string | null;
          check_in: string;
          created_at?: string;
          email?: string | null;
          guests: number;
          id?: string;
          message?: string | null;
          name: string;
          phone: string;
          status?: string;
        };
        Update: {
          block_id?: string | null;
          check_in?: string;
          created_at?: string;
          email?: string | null;
          guests?: number;
          id?: string;
          message?: string | null;
          name?: string;
          phone?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lodge_enquiries_block_id_fkey";
            columns: ["block_id"];
            isOneToOne: false;
            referencedRelation: "room_blocks";
            referencedColumns: ["id"];
          },
        ];
      };
      menu_categories: {
        Row: { id: string; name: string };
        Insert: { id: string; name: string };
        Update: { id?: string; name?: string };
        Relationships: [];
      };
      menu_items: {
        Row: {
          available: boolean;
          category_id: string;
          description: string | null;
          id: string;
          image: string | null;
          name: string;
          price: number;
        };
        Insert: {
          available?: boolean;
          category_id: string;
          description?: string | null;
          id: string;
          image?: string | null;
          name: string;
          price: number;
        };
        Update: {
          available?: boolean;
          category_id?: string;
          description?: string | null;
          id?: string;
          image?: string | null;
          name?: string;
          price?: number;
        };
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "menu_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      room_blocks: {
        Row: { id: string; name: string; display_name: string; rate_per_stay: number; stay_duration_hours: number };
        Insert: { id: string; name: string; display_name: string; rate_per_stay: number; stay_duration_hours: number };
        Update: { id?: string; name?: string; display_name?: string; rate_per_stay?: number; stay_duration_hours?: number };
        Relationships: [];
      };
      rooms: {
        Row: { block_id: string; id: string; number: string; status: string };
        Insert: { block_id: string; id: string; number: string; status?: string };
        Update: { block_id?: string; id?: string; number?: string; status?: string };
        Relationships: [
          {
            foreignKeyName: "rooms_block_id_fkey";
            columns: ["block_id"];
            isOneToOne: false;
            referencedRelation: "room_blocks";
            referencedColumns: ["id"];
          },
        ];
      };
      staff_profiles: {
        Row: { department: string | null; full_name: string; role: string; user_id: string };
        Insert: { department?: string | null; full_name: string; role: string; user_id: string };
        Update: { department?: string | null; full_name?: string; role?: string; user_id?: string };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
