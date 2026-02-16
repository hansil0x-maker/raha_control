import { createClient } from '@supabase/supabase-js';

// استخدام نفس المفاتيح الموجودة في index.tsx لضمان التوافق
const SUPABASE_URL = 'https://cihficjizojbtnshwtfl.supabase.co';
const SUPABASE_KEY = 'sb_publishable_9Nmdm3LJUHK1fBF0ihj38g_ophBRHyD';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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
      pharmacies: {
        Row: {
          id: string
          name: string
          pharmacy_key: string
          master_password?: string
          status: 'active' | 'suspended'
          location?: string
          contact_email?: string
          balance: number
          joined_date: string
          last_active?: string // Added for Phase 5/6
        }
        Insert: {
          id?: string
          name: string
          pharmacy_key: string
          master_password?: string
          status?: 'active' | 'suspended'
          location?: string
          contact_email?: string
          balance?: number
          joined_date?: string
          last_active?: string
        }
        Update: {
          id?: string
          name?: string
          pharmacy_key?: string
          master_password?: string
          status?: 'active' | 'suspended'
          location?: string
          contact_email?: string
          balance?: number
          joined_date?: string
          last_active?: string
        }
      }
      pharmacy_devices: {
        Row: {
          id: string
          pharmacy_id: string
          hardware_id: string
          device_name: string
          last_login: string
          is_trusted: boolean
        }
        Insert: {
          id?: string
          pharmacy_id: string
          hardware_id: string
          device_name: string
          last_login?: string
          is_trusted?: boolean
        }
        Update: {
          id?: string
          pharmacy_id?: string
          hardware_id?: string
          device_name?: string
          last_login?: string
          is_trusted?: boolean
        }
      }
      wanted_list: {
        Row: {
          id: string
          pharmacy_id: string
          item_name: string // Changed from medicine_name
          request_count: number // Changed from quantity
          status: 'pending' | 'supplied' | 'received'
          urgency?: 'low' | 'medium' | 'high'
          created_at: string
          notes?: string
        }
        Insert: {
          id?: string
          pharmacy_id: string
          item_name: string
          request_count: number
          status?: 'pending' | 'supplied' | 'received'
          urgency?: 'low' | 'medium' | 'high'
          created_at?: string
          notes?: string
        }
        Update: {
          id?: string
          pharmacy_id?: string
          item_name?: string
          request_count?: number
          status?: 'pending' | 'supplied' | 'received'
          urgency?: 'low' | 'medium' | 'high'
          created_at?: string
          notes?: string
        }
      }
      sales: {
        Row: {
          id: string
          pharmacy_id: string
          total_amount: number
          net_amount?: number
          created_at: string
          timestamp?: string
        }
        Insert: {
          id?: string
          pharmacy_id: string
          total_amount: number
          net_amount?: number
          created_at?: string
          timestamp?: string
        }
        Update: {
          id?: string
          pharmacy_id?: string
          total_amount?: number
          net_amount?: number
          created_at?: string
          timestamp?: string
        }
      }
    }
  }
}
