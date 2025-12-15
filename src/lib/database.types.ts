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
      cars: {
        Row: {
          company_id: string | null
          company_phone_snapshot: string | null
          created_at: string | null
          customer_id: string | null
          driver_name: string | null
          driver_phone: string | null
          id: string
          make: string | null
          model: string | null
          notes: string | null
          rego_plate: string
          updated_at: string | null
          vin: string | null
          year: number | null
        }
        Insert: {
          company_id?: string | null
          company_phone_snapshot?: string | null
          created_at?: string | null
          customer_id?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          id?: string
          make?: string | null
          model?: string | null
          notes?: string | null
          rego_plate: string
          updated_at?: string | null
          vin?: string | null
          year?: number | null
        }
        Update: {
          company_id?: string | null
          company_phone_snapshot?: string | null
          created_at?: string | null
          customer_id?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          id?: string
          make?: string | null
          model?: string | null
          notes?: string | null
          rego_plate?: string
          updated_at?: string | null
          vin?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cars_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cars_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          billing_address: string | null
          created_at: string | null
          id: string
          name: string
          notes: string | null
          primary_email: string | null
          primary_phone: string | null
          updated_at: string | null
        }
        Insert: {
          billing_address?: string | null
          created_at?: string | null
          id?: string
          name: string
          notes?: string | null
          primary_email?: string | null
          primary_phone?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_address?: string | null
          created_at?: string | null
          id?: string
          name?: string
          notes?: string | null
          primary_email?: string | null
          primary_phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          company_id: string | null
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          notes: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          email?: string | null
          full_name: string
          id?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string | null
          id: string
          invoice_number: string | null
          notes: string | null
          paid_date: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          status: Database["public"]["Enums"]["invoice_status"]
          subtotal: number
          tax_rate: number
          tax_total: number
          total: number
          updated_at: string | null
          visit_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          invoice_number?: string | null
          notes?: string | null
          paid_date?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tax_rate?: number
          tax_total?: number
          total?: number
          updated_at?: string | null
          visit_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          invoice_number?: string | null
          notes?: string | null
          paid_date?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tax_rate?: number
          tax_total?: number
          total?: number
          updated_at?: string | null
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "service_visits"
            referencedColumns: ["id"]
          },
        ]
      }
      line_items: {
        Row: {
          created_at: string | null
          id: string
          line_total: number | null
          name: string
          qty: number
          sort_order: number | null
          tax_flag: boolean | null
          unit_price: number
          visit_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          line_total?: number | null
          name: string
          qty?: number
          sort_order?: number | null
          tax_flag?: boolean | null
          unit_price?: number
          visit_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          line_total?: number | null
          name?: string
          qty?: number
          sort_order?: number | null
          tax_flag?: boolean | null
          unit_price?: number
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "line_items_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "service_visits"
            referencedColumns: ["id"]
          },
        ]
      }
      reminder_jobs: {
        Row: {
          car_id: string | null
          channel: Database["public"]["Enums"]["reminder_channel"]
          company_id: string | null
          created_at: string | null
          customer_id: string | null
          id: string
          invoice_id: string | null
          last_error: string | null
          recipient_email: string | null
          recipient_phone: string | null
          scheduled_at: string
          sent_at: string | null
          status: Database["public"]["Enums"]["reminder_status"]
          type: Database["public"]["Enums"]["reminder_type"]
          updated_at: string | null
        }
        Insert: {
          car_id?: string | null
          channel?: Database["public"]["Enums"]["reminder_channel"]
          company_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          invoice_id?: string | null
          last_error?: string | null
          recipient_email?: string | null
          recipient_phone?: string | null
          scheduled_at: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["reminder_status"]
          type: Database["public"]["Enums"]["reminder_type"]
          updated_at?: string | null
        }
        Update: {
          car_id?: string | null
          channel?: Database["public"]["Enums"]["reminder_channel"]
          company_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          invoice_id?: string | null
          last_error?: string | null
          recipient_email?: string | null
          recipient_phone?: string | null
          scheduled_at?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["reminder_status"]
          type?: Database["public"]["Enums"]["reminder_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reminder_jobs_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminder_jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminder_jobs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminder_jobs_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      service_visits: {
        Row: {
          car_id: string
          created_at: string | null
          id: string
          next_service_due_date: string | null
          notes: string | null
          odometer_km: number | null
          reminder_weeks: number | null
          updated_at: string | null
          visit_date: string
        }
        Insert: {
          car_id: string
          created_at?: string | null
          id?: string
          next_service_due_date?: string | null
          notes?: string | null
          odometer_km?: number | null
          reminder_weeks?: number | null
          updated_at?: string | null
          visit_date?: string
        }
        Update: {
          car_id?: string
          created_at?: string | null
          id?: string
          next_service_due_date?: string | null
          notes?: string | null
          odometer_km?: number | null
          reminder_weeks?: number | null
          updated_at?: string | null
          visit_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_visits_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          created_at: string | null
          default_reminder_weeks: number | null
          default_tax_rate: number | null
          email_template_invoice: string | null
          email_template_service: string | null
          id: string
          shop_abn: string | null
          shop_address: string | null
          shop_email: string | null
          shop_name: string
          shop_phone: string | null
          sms_template_invoice: string | null
          sms_template_service: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          default_reminder_weeks?: number | null
          default_tax_rate?: number | null
          email_template_invoice?: string | null
          email_template_service?: string | null
          id?: string
          shop_abn?: string | null
          shop_address?: string | null
          shop_email?: string | null
          shop_name?: string
          shop_phone?: string | null
          sms_template_invoice?: string | null
          sms_template_service?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          default_reminder_weeks?: number | null
          default_tax_rate?: number | null
          email_template_invoice?: string | null
          email_template_service?: string | null
          id?: string
          shop_abn?: string | null
          shop_address?: string | null
          shop_email?: string | null
          shop_name?: string
          shop_phone?: string | null
          sms_template_invoice?: string | null
          sms_template_service?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_invoice_totals: {
        Args: { p_visit_id: string }
        Returns: {
          subtotal: number
          tax_total: number
          total: number
        }[]
      }
      get_revenue_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          today_revenue: number
          week_revenue: number
          month_revenue: number
          all_time_revenue: number
        }[]
      }
      get_unpaid_invoices: {
        Args: Record<PropertyKey, never>
        Returns: {
          invoice_id: string
          invoice_number: string
          visit_id: string
          total: number
          status: Database["public"]["Enums"]["invoice_status"]
          visit_date: string
          rego_plate: string
          customer_name: string
          company_name: string
          days_overdue: number
        }[]
      }
      get_upcoming_services: {
        Args: { p_days?: number }
        Returns: {
          visit_id: string
          car_id: string
          rego_plate: string
          make: string
          model: string
          next_service_due_date: string
          days_until_due: number
          customer_name: string
          company_name: string
        }[]
      }
    }
    Enums: {
      invoice_status: "Draft" | "Sent" | "Paid" | "Overdue"
      payment_method: "Cash" | "Card" | "Bank Transfer" | "Cheque" | "Other"
      reminder_channel: "Email" | "SMS"
      reminder_status: "Pending" | "Sent" | "Failed" | "Cancelled"
      reminder_type: "ServiceDue" | "InvoiceDue" | "InvoiceOverdue"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Convenient type aliases
export type Company = Tables<'companies'>
export type Customer = Tables<'customers'>
export type Car = Tables<'cars'>
export type ServiceVisit = Tables<'service_visits'>
export type LineItem = Tables<'line_items'>
export type Invoice = Tables<'invoices'>
export type ReminderJob = Tables<'reminder_jobs'>
export type Settings = Tables<'settings'>

export type InvoiceStatus = Enums<'invoice_status'>
export type PaymentMethod = Enums<'payment_method'>
export type ReminderChannel = Enums<'reminder_channel'>
export type ReminderStatus = Enums<'reminder_status'>
export type ReminderType = Enums<'reminder_type'>

// Extended types with relations
export type CarWithRelations = Car & {
  companies?: Company | null
  customers?: Customer | null
}

export type ServiceVisitWithRelations = ServiceVisit & {
  cars?: CarWithRelations | null
  line_items?: LineItem[]
  invoices?: Invoice[]
}

