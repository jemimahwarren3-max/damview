// Generated from the live Supabase project (jbmakvbmyddvlgfjonmc) via the
// Supabase MCP `generate_typescript_types` tool. Regenerate after schema changes.

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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          category: string
          description: string
          id: string
          image: string | null
          name: string
          price_amount: number | null
          price_unit: string | null
        }
        Insert: {
          category: string
          description: string
          id: string
          image?: string | null
          name: string
          price_amount?: number | null
          price_unit?: string | null
        }
        Update: {
          category?: string
          description?: string
          id?: string
          image?: string | null
          name?: string
          price_amount?: number | null
          price_unit?: string | null
        }
        Relationships: []
      }
      activity_enquiries: {
        Row: {
          activity_id: string
          created_at: string
          customer_id: string | null
          email: string | null
          id: string
          message: string | null
          name: string
          party_size: number | null
          phone: string
          preferred_date: string | null
          price_amount: number | null
          status: string
        }
        Insert: {
          activity_id: string
          created_at?: string
          customer_id?: string | null
          email?: string | null
          id?: string
          message?: string | null
          name: string
          party_size?: number | null
          phone: string
          preferred_date?: string | null
          price_amount?: number | null
          status?: string
        }
        Update: {
          activity_id?: string
          created_at?: string
          customer_id?: string | null
          email?: string | null
          id?: string
          message?: string | null
          name?: string
          party_size?: number | null
          phone?: string
          preferred_date?: string | null
          price_amount?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_enquiries_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_enquiries_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          normalized_phone: string
          phone: string
          phone_verification_status: string
          record_status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          normalized_phone: string
          phone: string
          phone_verification_status?: string
          record_status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          normalized_phone?: string
          phone?: string
          phone_verification_status?: string
          record_status?: string
          updated_at?: string
        }
        Relationships: []
      }
      document_counters: {
        Row: {
          document_type: string
          next_number: number
        }
        Insert: {
          document_type: string
          next_number?: number
        }
        Update: {
          document_type?: string
          next_number?: number
        }
        Relationships: []
      }
      document_line_items: {
        Row: {
          description: string
          document_id: string
          id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          description: string
          document_id: string
          id?: string
          quantity?: number
          unit_price: number
        }
        Update: {
          description?: string
          document_id?: string
          id?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_line_items_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          amount_paid: number
          created_at: string
          customer_name: string
          document_number: string
          document_type: string
          id: string
          issue_date: string
        }
        Insert: {
          amount_paid?: number
          created_at?: string
          customer_name: string
          document_number: string
          document_type: string
          id?: string
          issue_date?: string
        }
        Update: {
          amount_paid?: number
          created_at?: string
          customer_name?: string
          document_number?: string
          document_type?: string
          id?: string
          issue_date?: string
        }
        Relationships: []
      }
      event_enquiries: {
        Row: {
          accommodation_required: boolean
          booking_reference: string | null
          catering_required: boolean
          created_at: string
          customer_id: string | null
          email: string | null
          event_type: string
          expected_guests: number
          facilities_required: string[]
          id: string
          message: string | null
          name: string
          phone: string
          proposed_date: string
          quoted_amount: number | null
          status: string
        }
        Insert: {
          accommodation_required?: boolean
          booking_reference?: string | null
          catering_required?: boolean
          created_at?: string
          customer_id?: string | null
          email?: string | null
          event_type: string
          expected_guests: number
          facilities_required?: string[]
          id?: string
          message?: string | null
          name: string
          phone: string
          proposed_date: string
          quoted_amount?: number | null
          status?: string
        }
        Update: {
          accommodation_required?: boolean
          booking_reference?: string | null
          catering_required?: boolean
          created_at?: string
          customer_id?: string | null
          email?: string | null
          event_type?: string
          expected_guests?: number
          facilities_required?: string[]
          id?: string
          message?: string | null
          name?: string
          phone?: string
          proposed_date?: string
          quoted_amount?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_enquiries_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_items: {
        Row: {
          caption: string | null
          category: string
          created_at: string
          id: string
          type: string
          url: string
        }
        Insert: {
          caption?: string | null
          category: string
          created_at?: string
          id?: string
          type: string
          url: string
        }
        Update: {
          caption?: string | null
          category?: string
          created_at?: string
          id?: string
          type?: string
          url?: string
        }
        Relationships: []
      }
      guest_reviews: {
        Row: {
          created_at: string
          guest_name: string
          id: string
          image: string | null
          quote: string
          rating: number
          status: string
        }
        Insert: {
          created_at?: string
          guest_name: string
          id?: string
          image?: string | null
          quote: string
          rating: number
          status?: string
        }
        Update: {
          created_at?: string
          guest_name?: string
          id?: string
          image?: string | null
          quote?: string
          rating?: number
          status?: string
        }
        Relationships: []
      }
      gym_enquiries: {
        Row: {
          created_at: string
          customer_id: string | null
          email: string | null
          id: string
          message: string | null
          name: string
          package_id: string | null
          phone: string
          status: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          email?: string | null
          id?: string
          message?: string | null
          name: string
          package_id?: string | null
          phone: string
          status?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          email?: string | null
          id?: string
          message?: string | null
          name?: string
          package_id?: string | null
          phone?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "gym_enquiries_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gym_enquiries_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "gym_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      gym_packages: {
        Row: {
          billing_period: string
          features: string[]
          id: string
          name: string
          price: number | null
        }
        Insert: {
          billing_period: string
          features?: string[]
          id: string
          name: string
          price?: number | null
        }
        Update: {
          billing_period?: string
          features?: string[]
          id?: string
          name?: string
          price?: number | null
        }
        Relationships: []
      }
      lodge_enquiries: {
        Row: {
          block_id: string | null
          booked_hours: number | null
          booking_reference: string | null
          check_in: string
          created_at: string
          customer_id: string | null
          email: string | null
          guests: number
          id: string
          message: string | null
          name: string
          phone: string
          room_id: string | null
          status: string
        }
        Insert: {
          block_id?: string | null
          booked_hours?: number | null
          booking_reference?: string | null
          check_in: string
          created_at?: string
          customer_id?: string | null
          email?: string | null
          guests: number
          id?: string
          message?: string | null
          name: string
          phone: string
          room_id?: string | null
          status?: string
        }
        Update: {
          block_id?: string | null
          booked_hours?: number | null
          booking_reference?: string | null
          check_in?: string
          created_at?: string
          customer_id?: string | null
          email?: string | null
          guests?: number
          id?: string
          message?: string | null
          name?: string
          phone?: string
          room_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "lodge_enquiries_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "room_blocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lodge_enquiries_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lodge_enquiries_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_categories: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          available: boolean
          category_id: string
          description: string | null
          id: string
          image: string | null
          name: string
          price: number
        }
        Insert: {
          available?: boolean
          category_id: string
          description?: string | null
          id: string
          image?: string | null
          name: string
          price: number
        }
        Update: {
          available?: boolean
          category_id?: string
          description?: string | null
          id?: string
          image?: string | null
          name?: string
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_audit_log: {
        Row: {
          action: string
          created_at: string
          id: string
          new_status: string
          payment_id: string
          performed_by: string | null
          previous_status: string | null
          reason: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          new_status: string
          payment_id: string
          performed_by?: string | null
          previous_status?: string | null
          reason?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          new_status?: string
          payment_id?: string
          performed_by?: string | null
          previous_status?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_audit_log_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payment_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_settings: {
        Row: {
          id: boolean
          manual_verification_enabled: boolean
          merchant_code: string
          merchant_instructions: string
          merchant_name: string
          payment_deadline_hours: number
          room_hold_minutes: number
          updated_at: string
          upload_max_mb: number
        }
        Insert: {
          id?: boolean
          manual_verification_enabled?: boolean
          merchant_code?: string
          merchant_instructions?: string
          merchant_name?: string
          payment_deadline_hours?: number
          room_hold_minutes?: number
          updated_at?: string
          upload_max_mb?: number
        }
        Update: {
          id?: boolean
          manual_verification_enabled?: boolean
          merchant_code?: string
          merchant_instructions?: string
          merchant_name?: string
          payment_deadline_hours?: number
          room_hold_minutes?: number
          updated_at?: string
          upload_max_mb?: number
        }
        Relationships: []
      }
      payment_submissions: {
        Row: {
          access_token_hash: string | null
          amount_claimed: number | null
          created_at: string
          currency: string
          customer_ecocash_number: string | null
          customer_email: string | null
          customer_id: string | null
          customer_name: string
          customer_phone: string
          ecocash_transaction_reference: string | null
          enquiry_type: string
          event_enquiry_id: string | null
          expected_amount: number
          id: string
          lodge_enquiry_id: string | null
          payment_deadline: string
          payment_method: string
          payment_reference: string
          payment_status: string
          proof_file_path: string | null
          proof_file_type: string | null
          receipt_number: string | null
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          submitted_at: string | null
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          access_token_hash?: string | null
          amount_claimed?: number | null
          created_at?: string
          currency?: string
          customer_ecocash_number?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name: string
          customer_phone: string
          ecocash_transaction_reference?: string | null
          enquiry_type: string
          event_enquiry_id?: string | null
          expected_amount: number
          id?: string
          lodge_enquiry_id?: string | null
          payment_deadline: string
          payment_method?: string
          payment_reference: string
          payment_status?: string
          proof_file_path?: string | null
          proof_file_type?: string | null
          receipt_number?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          submitted_at?: string | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          access_token_hash?: string | null
          amount_claimed?: number | null
          created_at?: string
          currency?: string
          customer_ecocash_number?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string
          ecocash_transaction_reference?: string | null
          enquiry_type?: string
          event_enquiry_id?: string | null
          expected_amount?: number
          id?: string
          lodge_enquiry_id?: string | null
          payment_deadline?: string
          payment_method?: string
          payment_reference?: string
          payment_status?: string
          proof_file_path?: string | null
          proof_file_type?: string | null
          receipt_number?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          submitted_at?: string | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_submissions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_submissions_event_enquiry_id_fkey"
            columns: ["event_enquiry_id"]
            isOneToOne: false
            referencedRelation: "event_enquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_submissions_lodge_enquiry_id_fkey"
            columns: ["lodge_enquiry_id"]
            isOneToOne: false
            referencedRelation: "lodge_enquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      room_blocks: {
        Row: {
          display_name: string
          id: string
          name: string
          rate_per_stay: number
          stay_duration_hours: number
        }
        Insert: {
          display_name: string
          id: string
          name: string
          rate_per_stay: number
          stay_duration_hours: number
        }
        Update: {
          display_name?: string
          id?: string
          name?: string
          rate_per_stay?: number
          stay_duration_hours?: number
        }
        Relationships: []
      }
      rooms: {
        Row: {
          block_id: string
          booked_until: string | null
          held_by_enquiry_id: string | null
          hold_expires_at: string | null
          id: string
          number: string
          status: string
        }
        Insert: {
          block_id: string
          booked_until?: string | null
          held_by_enquiry_id?: string | null
          hold_expires_at?: string | null
          id: string
          number: string
          status?: string
        }
        Update: {
          block_id?: string
          booked_until?: string | null
          held_by_enquiry_id?: string | null
          hold_expires_at?: string | null
          id?: string
          number?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "room_blocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rooms_held_by_enquiry_id_fkey"
            columns: ["held_by_enquiry_id"]
            isOneToOne: false
            referencedRelation: "lodge_enquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_profiles: {
        Row: {
          department: string | null
          full_name: string
          is_admin: boolean
          role: string
          user_id: string
        }
        Insert: {
          department?: string | null
          full_name: string
          is_admin?: boolean
          role: string
          user_id: string
        }
        Update: {
          department?: string | null
          full_name?: string
          is_admin?: boolean
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_staff_admin: { Args: never; Returns: boolean }
      hold_room_for_enquiry: {
        Args: { p_block_id: string; p_enquiry_id: string; p_hold_minutes?: number }
        Returns: string
      }
      confirm_room_booking: { Args: { p_room_id: string; p_hours?: number }; Returns: undefined }
      release_room_hold: { Args: { p_room_id: string }; Returns: undefined }
      release_expired_holds: { Args: never; Returns: undefined }
      check_out_room: { Args: { p_room_id: string }; Returns: undefined }
      release_expired_bookings: { Args: never; Returns: undefined }
      next_document_number: { Args: { p_document_type: string }; Returns: number }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
