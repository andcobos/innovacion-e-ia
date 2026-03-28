export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          role?: string
          created_at?: string
        }
      }
      businesses: {
        Row: {
          id: string
          profile_id: string
          business_name: string
          business_category: string
          instagram_handle: string | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          business_name: string
          business_category: string
          instagram_handle?: string | null
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          business_name?: string
          business_category?: string
          instagram_handle?: string | null
          description?: string | null
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          business_id: string
          name: string
          description: string | null
          category: string | null
          sale_price: number
          cost_price: number
          stock: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          name: string
          description?: string | null
          category?: string | null
          sale_price?: number
          cost_price?: number
          stock?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          name?: string
          description?: string | null
          category?: string | null
          sale_price?: number
          cost_price?: number
          stock?: number
          is_active?: boolean
          created_at?: string
        }
      }
      sales: {
        Row: {
          id: string
          business_id: string
          product_id: string
          quantity: number
          unit_sale_price: number
          discount_amount: number
          total_sale_amount: number
          sale_date: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          product_id: string
          quantity?: number
          unit_sale_price?: number
          discount_amount?: number
          total_sale_amount?: number
          sale_date?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          product_id?: string
          quantity?: number
          unit_sale_price?: number
          discount_amount?: number
          total_sale_amount?: number
          sale_date?: string
          notes?: string | null
          created_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          business_id: string
          description: string
          amount: number
          expense_category: string | null
          ai_suggested_category: string | null
          expense_type: string | null
          expense_date: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          description: string
          amount?: number
          expense_category?: string | null
          ai_suggested_category?: string | null
          expense_type?: string | null
          expense_date?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          description?: string
          amount?: number
          expense_category?: string | null
          ai_suggested_category?: string | null
          expense_type?: string | null
          expense_date?: string
          notes?: string | null
          created_at?: string
        }
      }
    }
  }
}
