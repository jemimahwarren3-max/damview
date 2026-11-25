export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12";
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      bills: {
        Row: {
          created_at: string;
          discount_amount: number;
          extra_charges: number;
          extra_charges_details: Json;
          food_charges: number;
          gst_amount: number;
          guest_id: string;
          id: string;
          payment_mode: string;
          payment_status: Database["public"]["Enums"]["payment_status"];
          room_charges: number;
          total_amount: number;
        };
        Insert: {
          created_at?: string;
          discount_amount?: number;
          extra_charges?: number;
          extra_charges_details?: Json;
          food_charges?: number;
          gst_amount?: number;
          guest_id: string;
          id?: string;
          payment_mode?: string;
          payment_status?: Database["public"]["Enums"]["payment_status"];
          room_charges?: number;
          total_amount?: number;
        };
        Update: {
          created_at?: string;
          discount_amount?: number;
          extra_charges?: number;
          extra_charges_details?: Json;
          food_charges?: number;
          gst_amount?: number;
          guest_id?: string;
          id?: string;
          payment_mode?: string;
          payment_status?: Database["public"]["Enums"]["payment_status"];
          room_charges?: number;
          total_amount?: number;
        };
        Relationships: [
          {
            foreignKeyName: "bills_guest_id_fkey";
            columns: ["guest_id"];
            isOneToOne: true;
            referencedRelation: "guests";
            referencedColumns: ["id"];
          },
        ];
      };
      food_menu: {
        Row: {
          available_quantity: number;
          breakfast_end_time: string | null;
          breakfast_start_time: string | null;
          category: string;
          created_at: string;
          gst_percent: number;
          id: string;
          image_url: string | null;
          is_active: boolean;
          is_breakfast: boolean;
          item_code: string | null;
          name: string;
          price: number;
        };
        Insert: {
          available_quantity?: number;
          breakfast_end_time?: string | null;
          breakfast_start_time?: string | null;
          category?: string;
          created_at?: string;
          gst_percent?: number;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          is_breakfast?: boolean;
          item_code?: string | null;
          name: string;
          price: number;
        };
        Update: {
          available_quantity?: number;
          breakfast_end_time?: string | null;
          breakfast_start_time?: string | null;
          category?: string;
          created_at?: string;
          gst_percent?: number;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          is_breakfast?: boolean;
          item_code?: string | null;
          name?: string;
          price?: number;
        };
        Relationships: [];
      };
      guests: {
        Row: {
          check_in: string;
          check_out: string | null;
          created_at: string;
          guest_code: string;
          gst_percent: number;
          id: string;
          is_active: boolean;
          name: string;
          original_room_id: string | null;
          people_count: number;
          rate: number;
          room_id: string;
          phone: string | null;
          id_proof_name: string | null;
          id_proof_number: string | null;
          other_guest_names: string[] | null;
          email: string | null;
          gst_number: string | null;
        };
        Insert: {
          check_in?: string;
          check_out?: string | null;
          created_at?: string;
          guest_code?: string;
          gst_percent?: number;
          id?: string;
          is_active?: boolean;
          name: string;
          original_room_id?: string | null;
          people_count?: number;
          rate: number;
          room_id: string;
          phone?: string | null;
          id_proof_name?: string | null;
          id_proof_number?: string | null;
          other_guest_names?: string[] | null;
          email?: string | null;
          gst_number?: string | null;
        };
        Update: {
          check_in?: string;
          check_out?: string | null;
          created_at?: string;
          guest_code?: string;
          gst_percent?: number;
          id?: string;
          is_active?: boolean;
          name?: string;
          original_room_id?: string | null;
          people_count?: number;
          rate?: number;
          room_id?: string;
          phone?: string | null;
          id_proof_name?: string | null;
          id_proof_number?: string | null;
          other_guest_names?: string[] | null;
          email?: string | null;
          gst_number?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "guests_room_id_fkey";
            columns: ["room_id"];
            isOneToOne: false;
            referencedRelation: "rooms";
            referencedColumns: ["id"];
          },
        ];
      };
      order_items: {
        Row: {
          food_id: string | null;
          id: string;
          order_id: string;
          price_snapshot: number;
          quantity: number;
          custom_name: string | null;
        };
        Insert: {
          food_id?: string | null;
          id?: string;
          order_id: string;
          price_snapshot: number;
          quantity: number;
          custom_name?: string | null;
        };
        Update: {
          food_id?: string | null;
          id?: string;
          order_id?: string;
          price_snapshot?: number;
          quantity?: number;
          custom_name?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_food_id_fkey";
            columns: ["food_id"];
            isOneToOne: false;
            referencedRelation: "food_menu";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          created_at: string;
          created_by: string | null;
          entry_mode: Database["public"]["Enums"]["order_entry_mode"];
          guest_id: string | null;
          id: string;
          room_id: string | null;
          table_id: string | null;
          status: Database["public"]["Enums"]["order_status"];
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          entry_mode?: Database["public"]["Enums"]["order_entry_mode"];
          guest_id?: string | null;
          id?: string;
          room_id?: string | null;
          table_id?: string | null;
          status?: Database["public"]["Enums"]["order_status"];
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          entry_mode?: Database["public"]["Enums"]["order_entry_mode"];
          guest_id?: string | null;
          id?: string;
          room_id?: string | null;
          table_id?: string | null;
          status?: Database["public"]["Enums"]["order_status"];
        };
        Relationships: [
          {
            foreignKeyName: "orders_guest_id_fkey";
            columns: ["guest_id"];
            isOneToOne: false;
            referencedRelation: "guests";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_room_id_fkey";
            columns: ["room_id"];
            isOneToOne: false;
            referencedRelation: "rooms";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_table_id_fkey";
            columns: ["table_id"];
            isOneToOne: false;
            referencedRelation: "restaurant_tables";
            referencedColumns: ["id"];
          },
        ];
      };
      room_shifts: {
        Row: {
          id: string;
          guest_id: string;
          from_room_id: string | null;
          to_room_id: string | null;
          from_room_number: number;
          to_room_number: number;
          shifted_by: string | null;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          guest_id: string;
          from_room_id?: string | null;
          to_room_id?: string | null;
          from_room_number: number;
          to_room_number: number;
          shifted_by?: string | null;
          reason?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          guest_id?: string;
          from_room_id?: string | null;
          to_room_id?: string | null;
          from_room_number?: number;
          to_room_number?: number;
          shifted_by?: string | null;
          reason?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      system_settings: {
        Row: {
          key: string;
          value: Json;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: {
          key: string;
          value?: Json;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: Json;
          updated_by?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      audit_log: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          details: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          details?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          details?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      restaurant_bills: {
        Row: {
          id: string;
          table_id: string;
          food_charges: number;
          gst_amount: number;
          discount_amount: number;
          total_amount: number;
          payment_mode: string;
          payment_status: Database["public"]["Enums"]["payment_status"];
          items: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          table_id: string;
          food_charges?: number;
          gst_amount?: number;
          discount_amount?: number;
          total_amount?: number;
          payment_mode?: string;
          payment_status?: Database["public"]["Enums"]["payment_status"];
          items?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          table_id?: string;
          food_charges?: number;
          gst_amount?: number;
          discount_amount?: number;
          total_amount?: number;
          payment_mode?: string;
          payment_status?: Database["public"]["Enums"]["payment_status"];
          items?: any;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "restaurant_bills_table_id_fkey";
            columns: ["table_id"];
            isOneToOne: false;
            referencedRelation: "restaurant_tables";
            referencedColumns: ["id"];
          },
        ];
      };
      restaurant_tables: {
        Row: {
          id: string;
          table_number: number;
          capacity: number;
          status: Database["public"]["Enums"]["table_status"];
          created_at: string;
        };
        Insert: {
          id?: string;
          table_number: number;
          capacity?: number;
          status?: Database["public"]["Enums"]["table_status"];
          created_at?: string;
        };
        Update: {
          id?: string;
          table_number?: number;
          capacity?: number;
          status?: Database["public"]["Enums"]["table_status"];
          created_at?: string;
        };
        Relationships: [];
      };
      rooms: {
        Row: {
          base_price: number;
          created_at: string;
          id: string;
          room_number: number;
          status: Database["public"]["Enums"]["room_status"];
          type: Database["public"]["Enums"]["room_type"];
        };
        Insert: {
          base_price: number;
          created_at?: string;
          id?: string;
          room_number: number;
          status?: Database["public"]["Enums"]["room_status"];
          type?: Database["public"]["Enums"]["room_type"];
        };
        Update: {
          base_price?: number;
          created_at?: string;
          id?: string;
          room_number?: number;
          status?: Database["public"]["Enums"]["room_status"];
          type?: Database["public"]["Enums"]["room_type"];
        };
        Relationships: [];
      };
      users: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          role: Database["public"]["Enums"]["user_role"];
        };
        Insert: {
          created_at?: string;
          email: string;
          id: string;
          role?: Database["public"]["Enums"]["user_role"];
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          role?: Database["public"]["Enums"]["user_role"];
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      accept_order_safe: { Args: { p_order_id: string }; Returns: boolean };
      is_staff: { Args: never; Returns: boolean };
      is_superadmin: { Args: never; Returns: boolean };
    };
    Enums: {
      order_entry_mode: "manual" | "automatic";
      order_status:
        | "pending"
        | "accepted"
        | "preparing"
        | "prepared"
        | "served"
        | "billed"
        | "cancelled";
      payment_status: "pending" | "paid";
      room_status: "available" | "occupied" | "cleaning";
      room_type: "standard" | "premium" | "deluxe" | "suite";
      table_status: "available" | "occupied";
      user_role: "superadmin" | "admin" | "manager" | "kitchen" | "disabled";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      order_entry_mode: ["manual", "automatic"],
      order_status: ["pending", "accepted", "preparing", "prepared", "served", "billed", "cancelled"],
      payment_status: ["pending", "paid"],
      room_status: ["available", "occupied", "cleaning"],
      room_type: ["standard", "premium", "deluxe", "suite"],
      table_status: ["available", "occupied"],
      user_role: ["superadmin", "admin", "manager", "kitchen", "disabled"],
    },
  },
} as const;
