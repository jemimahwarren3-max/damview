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
      activity_bookings: {
        Row: {
          activity_id: string
          booked_by: string | null
          created_at: string
          guest_id: string | null
          guest_name: string
          hours: number | null
          id: string
          notes: string | null
          payment_mode: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          people_count: number
          total_amount: number
        }
        Insert: {
          activity_id: string
          booked_by?: string | null
          created_at?: string
          guest_id?: string | null
          guest_name: string
          hours?: number | null
          id?: string
          notes?: string | null
          payment_mode?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          people_count?: number
          total_amount: number
        }
        Update: {
          activity_id?: string
          booked_by?: string | null
          created_at?: string
          guest_id?: string | null
          guest_name?: string
          hours?: number | null
          id?: string
          notes?: string | null
          payment_mode?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          people_count?: number
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "activity_bookings_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "pms_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_bookings_booked_by_fkey"
            columns: ["booked_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_bookings_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "website_activities"
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
      audit_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bills: {
        Row: {
          amount_paid: number | null
          created_at: string
          discount_amount: number
          extra_charges: number
          extra_charges_details: Json
          food_charges: number
          gst_amount: number
          guest_id: string
          id: string
          outstanding_balance: number
          payment_mode: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          room_charges: number
          total_amount: number
        }
        Insert: {
          amount_paid?: number | null
          created_at?: string
          discount_amount?: number
          extra_charges?: number
          extra_charges_details?: Json
          food_charges?: number
          gst_amount?: number
          guest_id: string
          id?: string
          outstanding_balance?: number
          payment_mode?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          room_charges?: number
          total_amount?: number
        }
        Update: {
          amount_paid?: number | null
          created_at?: string
          discount_amount?: number
          extra_charges?: number
          extra_charges_details?: Json
          food_charges?: number
          gst_amount?: number
          guest_id?: string
          id?: string
          outstanding_balance?: number
          payment_mode?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          room_charges?: number
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "bills_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: true
            referencedRelation: "guests"
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
      food_menu: {
        Row: {
          available_quantity: number
          breakfast_end_time: string | null
          breakfast_start_time: string | null
          category: string | null
          created_at: string
          gst_percent: number
          id: string
          image_url: string | null
          is_active: boolean
          is_breakfast: boolean
          item_code: string | null
          name: string
          price: number
        }
        Insert: {
          available_quantity?: number
          breakfast_end_time?: string | null
          breakfast_start_time?: string | null
          category?: string | null
          created_at?: string
          gst_percent?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_breakfast?: boolean
          item_code?: string | null
          name: string
          price: number
        }
        Update: {
          available_quantity?: number
          breakfast_end_time?: string | null
          breakfast_start_time?: string | null
          category?: string | null
          created_at?: string
          gst_percent?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_breakfast?: boolean
          item_code?: string | null
          name?: string
          price?: number
        }
        Relationships: []
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
      guests: {
        Row: {
          billing_mode: Database["public"]["Enums"]["billing_mode"]
          check_in: string
          check_out: string | null
          created_at: string
          email: string | null
          gst_number: string | null
          gst_percent: number
          guest_code: string
          hourly_rate: number | null
          id: string
          id_proof_name: string | null
          id_proof_number: string | null
          is_active: boolean
          name: string
          original_room_id: string | null
          other_guest_names: string[] | null
          people_count: number
          phone: string | null
          rate: number
          reservation_id: string | null
          room_id: string
        }
        Insert: {
          billing_mode?: Database["public"]["Enums"]["billing_mode"]
          check_in?: string
          check_out?: string | null
          created_at?: string
          email?: string | null
          gst_number?: string | null
          gst_percent?: number
          guest_code?: string
          hourly_rate?: number | null
          id?: string
          id_proof_name?: string | null
          id_proof_number?: string | null
          is_active?: boolean
          name: string
          original_room_id?: string | null
          other_guest_names?: string[] | null
          people_count?: number
          phone?: string | null
          rate: number
          reservation_id?: string | null
          room_id: string
        }
        Update: {
          billing_mode?: Database["public"]["Enums"]["billing_mode"]
          check_in?: string
          check_out?: string | null
          created_at?: string
          email?: string | null
          gst_number?: string | null
          gst_percent?: number
          guest_code?: string
          hourly_rate?: number | null
          id?: string
          id_proof_name?: string | null
          id_proof_number?: string | null
          is_active?: boolean
          name?: string
          original_room_id?: string | null
          other_guest_names?: string[] | null
          people_count?: number
          phone?: string | null
          rate?: number
          reservation_id?: string | null
          room_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guests_original_room_id_fkey"
            columns: ["original_room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guests_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guests_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "website_rooms"
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
      order_items: {
        Row: {
          custom_name: string | null
          food_id: string | null
          id: string
          order_id: string
          price_snapshot: number
          quantity: number
        }
        Insert: {
          custom_name?: string | null
          food_id?: string | null
          id?: string
          order_id: string
          price_snapshot: number
          quantity: number
        }
        Update: {
          custom_name?: string | null
          food_id?: string | null
          id?: string
          order_id?: string
          price_snapshot?: number
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "food_menu"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          created_by: string | null
          entry_mode: Database["public"]["Enums"]["order_entry_mode"]
          guest_id: string | null
          id: string
          room_id: string | null
          status: Database["public"]["Enums"]["order_status"]
          table_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          entry_mode?: Database["public"]["Enums"]["order_entry_mode"]
          guest_id?: string | null
          id?: string
          room_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          table_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          entry_mode?: Database["public"]["Enums"]["order_entry_mode"]
          guest_id?: string | null
          id?: string
          room_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          table_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "restaurant_tables"
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
      pms_activities: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          max_capacity: number | null
          name: string
          price_per_hour: number | null
          price_per_person: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          max_capacity?: number | null
          name: string
          price_per_hour?: number | null
          price_per_person: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          max_capacity?: number | null
          name?: string
          price_per_hour?: number | null
          price_per_person?: number
        }
        Relationships: []
      }
      reservations: {
        Row: {
          billing_mode: Database["public"]["Enums"]["billing_mode"]
          booked_by: string | null
          check_in_date: string
          check_out_date: string | null
          created_at: string
          deposit_amount: number
          deposit_paid: boolean
          deposit_payment_mode: string | null
          guest_email: string | null
          guest_id_number: string | null
          guest_id_type: string | null
          guest_name: string
          guest_phone: string | null
          hourly_rate: number | null
          id: string
          notes: string | null
          people_count: number
          rate: number
          room_id: string
          status: Database["public"]["Enums"]["reservation_status"]
          updated_at: string
        }
        Insert: {
          billing_mode?: Database["public"]["Enums"]["billing_mode"]
          booked_by?: string | null
          check_in_date: string
          check_out_date?: string | null
          created_at?: string
          deposit_amount?: number
          deposit_paid?: boolean
          deposit_payment_mode?: string | null
          guest_email?: string | null
          guest_id_number?: string | null
          guest_id_type?: string | null
          guest_name: string
          guest_phone?: string | null
          hourly_rate?: number | null
          id?: string
          notes?: string | null
          people_count?: number
          rate: number
          room_id: string
          status?: Database["public"]["Enums"]["reservation_status"]
          updated_at?: string
        }
        Update: {
          billing_mode?: Database["public"]["Enums"]["billing_mode"]
          booked_by?: string | null
          check_in_date?: string
          check_out_date?: string | null
          created_at?: string
          deposit_amount?: number
          deposit_paid?: boolean
          deposit_payment_mode?: string | null
          guest_email?: string | null
          guest_id_number?: string | null
          guest_id_type?: string | null
          guest_name?: string
          guest_phone?: string | null
          hourly_rate?: number | null
          id?: string
          notes?: string | null
          people_count?: number
          rate?: number
          room_id?: string
          status?: Database["public"]["Enums"]["reservation_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_booked_by_fkey"
            columns: ["booked_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_bills: {
        Row: {
          created_at: string
          discount_amount: number
          food_charges: number
          gst_amount: number
          id: string
          items: Json
          payment_mode: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          table_id: string
          total_amount: number
        }
        Insert: {
          created_at?: string
          discount_amount?: number
          food_charges?: number
          gst_amount?: number
          id?: string
          items?: Json
          payment_mode?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          table_id: string
          total_amount?: number
        }
        Update: {
          created_at?: string
          discount_amount?: number
          food_charges?: number
          gst_amount?: number
          id?: string
          items?: Json
          payment_mode?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          table_id?: string
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_bills_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "restaurant_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_tables: {
        Row: {
          capacity: number
          created_at: string
          id: string
          status: Database["public"]["Enums"]["table_status"]
          table_number: number
        }
        Insert: {
          capacity?: number
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["table_status"]
          table_number: number
        }
        Update: {
          capacity?: number
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["table_status"]
          table_number?: number
        }
        Relationships: []
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
      room_shifts: {
        Row: {
          created_at: string
          from_room_id: string | null
          from_room_number: number
          guest_id: string
          id: string
          reason: string | null
          shifted_by: string | null
          to_room_id: string | null
          to_room_number: number
        }
        Insert: {
          created_at?: string
          from_room_id?: string | null
          from_room_number: number
          guest_id: string
          id?: string
          reason?: string | null
          shifted_by?: string | null
          to_room_id?: string | null
          to_room_number: number
        }
        Update: {
          created_at?: string
          from_room_id?: string | null
          from_room_number?: number
          guest_id?: string
          id?: string
          reason?: string | null
          shifted_by?: string | null
          to_room_id?: string | null
          to_room_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "room_shifts_from_room_id_fkey"
            columns: ["from_room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_shifts_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_shifts_shifted_by_fkey"
            columns: ["shifted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_shifts_to_room_id_fkey"
            columns: ["to_room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          base_price: number
          created_at: string
          description: string | null
          id: string
          label: string | null
          max_occupancy: number
          room_number: number
          status: Database["public"]["Enums"]["room_status"]
          type: Database["public"]["Enums"]["room_type"]
        }
        Insert: {
          base_price: number
          created_at?: string
          description?: string | null
          id?: string
          label?: string | null
          max_occupancy?: number
          room_number: number
          status?: Database["public"]["Enums"]["room_status"]
          type?: Database["public"]["Enums"]["room_type"]
        }
        Update: {
          base_price?: number
          created_at?: string
          description?: string | null
          id?: string
          label?: string | null
          max_occupancy?: number
          room_number?: number
          status?: Database["public"]["Enums"]["room_status"]
          type?: Database["public"]["Enums"]["room_type"]
        }
        Relationships: []
      }
      staff_profiles: {
        Row: {
          department: string | null
          full_name: string
          is_active: boolean
          is_admin: boolean
          role: string
          user_id: string
        }
        Insert: {
          department?: string | null
          full_name: string
          is_active?: boolean
          is_admin?: boolean
          role: string
          user_id: string
        }
        Update: {
          department?: string | null
          full_name?: string
          is_active?: boolean
          is_admin?: boolean
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      website_activities: {
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
      website_rooms: {
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_order_safe: { Args: { p_order_id: string }; Returns: boolean }
      check_out_room: { Args: { p_room_id: string }; Returns: undefined }
      cleanup_old_orders: { Args: never; Returns: undefined }
      cleanup_old_records: { Args: never; Returns: undefined }
      confirm_room_booking: {
        Args: { p_hours?: number; p_room_id: string }
        Returns: undefined
      }
      hold_room_for_enquiry: {
        Args: {
          p_block_id: string
          p_enquiry_id: string
          p_hold_minutes?: number
        }
        Returns: string
      }
      is_cashier_or_above: { Args: never; Returns: boolean }
      is_kitchen: { Args: never; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
      is_staff_admin: { Args: never; Returns: boolean }
      is_superadmin: { Args: never; Returns: boolean }
      next_document_number: {
        Args: { p_document_type: string }
        Returns: number
      }
      release_expired_bookings: { Args: never; Returns: undefined }
      release_expired_holds: { Args: never; Returns: undefined }
      release_room_hold: { Args: { p_room_id: string }; Returns: undefined }
    }
    Enums: {
      billing_mode: "nightly" | "hourly"
      order_entry_mode: "manual" | "automatic"
      order_status:
        | "pending"
        | "accepted"
        | "preparing"
        | "served"
        | "cancelled"
        | "prepared"
        | "billed"
      payment_status: "pending" | "paid" | "partial"
      reservation_status:
        | "confirmed"
        | "checked_in"
        | "cancelled"
        | "no_show"
        | "completed"
      room_status:
        | "available"
        | "occupied"
        | "cleaning"
        | "reserved"
        | "maintenance"
      room_type:
        | "standard"
        | "premium"
        | "deluxe"
        | "suite"
        | "lodge"
        | "chalet"
        | "cottage"
        | "camping"
      table_status: "available" | "occupied"
      user_role:
        | "superadmin"
        | "admin"
        | "manager"
        | "disabled"
        | "kitchen"
        | "cashier"
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
    Enums: {
      billing_mode: ["nightly", "hourly"],
      order_entry_mode: ["manual", "automatic"],
      order_status: [
        "pending",
        "accepted",
        "preparing",
        "served",
        "cancelled",
        "prepared",
        "billed",
      ],
      payment_status: ["pending", "paid", "partial"],
      reservation_status: [
        "confirmed",
        "checked_in",
        "cancelled",
        "no_show",
        "completed",
      ],
      room_status: [
        "available",
        "occupied",
        "cleaning",
        "reserved",
        "maintenance",
      ],
      room_type: [
        "standard",
        "premium",
        "deluxe",
        "suite",
        "lodge",
        "chalet",
        "cottage",
        "camping",
      ],
      table_status: ["available", "occupied"],
      user_role: [
        "superadmin",
        "admin",
        "manager",
        "disabled",
        "kitchen",
        "cashier",
      ],
    },
  },
} as const
