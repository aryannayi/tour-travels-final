import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Tour {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  location: string;
  category: string;
  images: string[];
  featured: boolean;
  max_group_size: number;
  difficulty: 'easy' | 'moderate' | 'challenging';
  available_dates: string[];
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  tour_id: string;
  booking_date: string;
  number_of_people: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  special_requests?: string;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  tour_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Wishlist {
  id: string;
  user_id: string;
  tour_id: string;
  created_at: string;
}