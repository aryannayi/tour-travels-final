import { createClient } from '@supabase/supabase-js';

import { sampleTours } from '../data/sampleTours';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const shouldUseMock =
  !supabaseUrl ||
  !supabaseAnonKey ||
  /localhost:54321|127\.0\.0\.1:54321/i.test(String(supabaseUrl));

// Provide a safe mock when env vars are missing so the app runs locally without Supabase
function createMockClient() {
  const STORAGE_KEY = 'wanderlust_mock_db_v1';

  type DB = {
    tours: any[];
    users: any[];
    bookings: any[];
    reviews: any[];
    wishlists: any[];
  };

  const guid = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

  const loadDB = (): DB => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const existing = JSON.parse(raw);
        // Migrate existing users to include new fields
        if (existing.users) {
          existing.users = existing.users.map((user: any) => ({
            ...user,
            phone: user.phone || '',
            address: user.address || '',
            updated_at: user.updated_at || user.created_at
          }));
        }
        return existing;
      }
    } catch {}

    const now = new Date().toISOString();
    const seededTours = (sampleTours || []).map((t: any) => ({
      id: guid(),
      created_at: now,
      updated_at: now,
      ...t,
    }));

    const db: DB = {
      tours: seededTours,
      users: [
        { id: 'demo-admin', email: 'admin@wanderlust.com', full_name: 'Admin', role: 'admin', created_at: now, updated_at: now },
        { id: 'demo-user', email: 'user@example.com', full_name: 'Demo User', role: 'user', created_at: now, updated_at: now, phone: '', address: '' },
      ],
      bookings: [],
      reviews: [],
      wishlists: [],
    };
    saveDB(db);
    return db;
  };

  const saveDB = (db: DB) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(db)); } catch {}
  };

  let db = loadDB();

  const normalizeDB = () => {
    // Deduplicate tours by a stable content key to avoid repeated entries
    try {
      const seen = new Set<string>();
      const dedupedTours = getTable('tours').filter((t: any) => {
        const key = [t.title, t.location, t.duration, t.price].join('|');
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      if (dedupedTours.length !== getTable('tours').length) {
        setTable('tours', dedupedTours);
      }
    } catch {}
  };
  normalizeDB();

  const seedIfEmpty = () => {
    const now = new Date().toISOString();
    if (!db.tours || db.tours.length === 0) {
      const seededTours = (sampleTours || []).map((t: any) => ({
        id: guid(),
        created_at: now,
        updated_at: now,
        ...t,
      }));
      db.tours = seededTours;
      saveDB(db);
    }
  };

  const ensureSampleCoverage = () => {
    const now = new Date().toISOString();
    const existing = Array.isArray(db.tours) ? db.tours : [];
    const existingKeys = new Set(existing.map((t: any) => `${t.title}|${t.location}`));
    const missing = (sampleTours || []).filter((t: any) => !existingKeys.has(`${t.title}|${t.location}`));
    if (missing.length > 0) {
      const toAdd = missing.map((t: any) => ({ id: guid(), created_at: now, updated_at: now, ...t }));
      db.tours = [...existing, ...toAdd];
      saveDB(db);
    }
  };

  const getTable = (name: keyof DB) => { if (name === 'tours') { seedIfEmpty(); ensureSampleCoverage(); } else { seedIfEmpty(); } return db[name]; };
  const setTable = (name: keyof DB, rows: any[]) => { 
    console.log(`setTable called for ${name}:`, rows);
    db[name] = rows; 
    saveDB(db); 
    console.log(`Database saved after setTable for ${name}`);
  };

  const makeBuilder = (tableName: keyof DB) => {
    let predicates: Array<(row: any) => boolean> = [];
    let orderBy: { field: string; ascending: boolean } | null = null;
    let range: { from: number; to: number | null } | null = null;
    let selectedColumns: string | undefined;
    let selectOptions: any | undefined;

    const compute = () => {
      let rows = [...getTable(tableName)];
      // Deduplicate tours defensively on every read to avoid accidental repeats from prior inserts
      if (tableName === 'tours') {
        const seenKey = new Set<string>();
        rows = rows.filter((t: any) => {
          const key = [t.title, t.location, t.duration, t.price].join('|');
          if (seenKey.has(key)) return false;
          seenKey.add(key);
          return true;
        });
        if (rows.length !== getTable('tours').length) {
          // Persist the deduped list to storage so future reads are clean
          setTable('tours', rows);
        }
      }
      if (predicates.length) {
        rows = rows.filter((r) => predicates.every((p) => p(r)));
      }
      const totalCount = rows.length;
      if (orderBy) {
        const { field, ascending } = orderBy;
        rows.sort((a, b) => {
          const av = a[field];
          const bv = b[field];
          if (av === bv) return 0;
          return (av > bv ? 1 : -1) * (ascending ? 1 : -1);
        });
      }
      if (range) {
        const to = range.to ?? rows.length - 1;
        rows = rows.slice(range.from, to + 1);
      }

      // Join enrichment for bookings and wishlists
      if (tableName === 'bookings' && typeof selectedColumns === 'string' && selectedColumns.includes('tours')) {
        rows = rows.map((b) => ({
          ...b,
          tours: getTable('tours').find((t: any) => t.id === b.tour_id) || null,
          users: getTable('users').find((u: any) => u.id === b.user_id) || null,
        }));
      }
      
      if (tableName === 'wishlists' && typeof selectedColumns === 'string' && selectedColumns.includes('tours')) {
        rows = rows.map((w) => ({
          ...w,
          tours: getTable('tours').find((t: any) => t.id === w.tour_id) || null,
          users: getTable('users').find((u: any) => u.id === w.user_id) || null,
        }));
      }

      if (selectOptions?.head) {
        return { data: [], count: totalCount, error: null };
      }
      return { data: rows, count: totalCount, error: null };
    };

    // Build a write builder that supports chaining filters like `.update(...).eq(...)`
    const buildWriteBuilder = (writeType: 'update' | 'delete', payload?: any) => {
      let writePredicates: Array<(row: any) => boolean> = [...predicates];

      const perform = () => {
        if (writeType === 'update') {
          const rows = getTable(tableName);
          const updated = rows.map((r: any) => {
            if (writePredicates.every((p) => p(r))) {
              return { ...r, ...payload, updated_at: new Date().toISOString() };
            }
            return r;
          });
          setTable(tableName, updated);
          const affected = updated.filter((r: any, idx: number) => rows[idx] !== r);
          return { data: affected, error: null };
        } else {
          const rows = getTable(tableName);
          const kept = rows.filter((r: any) => !writePredicates.every((p) => p(r)));
          const removed = rows.filter((r: any) => writePredicates.every((p) => p(r)));
          setTable(tableName, kept);
          return { data: removed, error: null };
        }
      };

      const builder: any = {
        eq(field: string, value: any) { 
          console.log(`Mock eq() called with field: ${field}, value: ${value}`);
          writePredicates.push((r) => r[field] === value); 
          return builder; 
        },
        gte(field: string, value: any) { writePredicates.push((r) => r[field] >= value); return builder; },
        lte(field: string, value: any) { writePredicates.push((r) => r[field] <= value); return builder; },
        ilike(field: string, pattern: string) {
          const needle = pattern.toLowerCase().replace(/%/g, '');
          writePredicates.push((r) => String(r[field] ?? '').toLowerCase().includes(needle));
          return builder;
        },
        or(_expr: string) { return builder; },
        select() {
          const perf = perform();
          console.log(`Mock select() called after ${writeType}:`, perf);
          return {
            async single() { 
              const result = { data: perf.data[0] ?? null, error: null };
              console.log(`Mock single() returning:`, result);
              return result;
            },
            async maybeSingle() { 
              const result = { data: perf.data[0] ?? null, error: null };
              console.log(`Mock maybeSingle() returning:`, result);
              return result;
            },
          };
        },
        then(resolve: any) { resolve(perform()); },
      };
      return builder;
    };

    const api: any = {
      select(columns?: string, options?: any) { selectedColumns = columns; selectOptions = options; return api; },
      eq(field: string, value: any) { predicates.push((r) => r[field] === value); return api; },
      gte(field: string, value: any) { predicates.push((r) => r[field] >= value); return api; },
      lte(field: string, value: any) { predicates.push((r) => r[field] <= value); return api; },
      ilike(field: string, pattern: string) {
        const needle = pattern.toLowerCase().replace(/%/g, '');
        predicates.push((r) => String(r[field] ?? '').toLowerCase().includes(needle));
        return api;
      },
      or(expr: string) {
        // Supports patterns like: "title.ilike.%q%,description.ilike.%q%,location.ilike.%q%"
        try {
          const parts = expr.split(',').map((p) => p.trim()).filter(Boolean);
          const ors: Array<(row: any) => boolean> = parts.map((p) => {
            // form: field.op.value
            const [lhs, valueRaw] = p.split('.').reduce((acc: string[], cur: string, idx: number, arr: string[]) => {
              if (idx < arr.length - 1) acc[0] = acc[0] ? acc[0] + '.' + cur : cur; else acc[1] = cur;
              return acc;
            }, ['', '']);
            const [field, op] = (lhs || '').split('.');
            const value = (valueRaw || '').replace(/^%|%$/g, '').toLowerCase();
            if (op === 'ilike') {
              return (r: any) => String(r[field] ?? '').toLowerCase().includes(value);
            }
            if (op === 'eq') {
              return (r: any) => String(r[field] ?? '').toLowerCase() === value;
            }
            return () => false;
          });
          predicates.push((r) => ors.some((fn) => fn(r)));
        } catch {
          // If parsing fails, ignore and return all
        }
        return api;
      },
      range(from: number, to: number) { range = { from, to }; return api; },
      order(field: string, opts?: { ascending?: boolean }) { orderBy = { field, ascending: opts?.ascending !== false }; return api; },
      limit(n: number) { range = { from: 0, to: n - 1 }; return api; },
      async single() { const { data } = compute(); return { data: data[0] ?? null, error: null }; },
      insert(rows: any[]) {
        try {
          const now = new Date().toISOString();
          const arr = Array.isArray(rows) ? rows : [rows];
          
          // Only add updated_at for tables that support it (tours, users)
          const withIds = arr.map((r) => {
            const base = { id: guid(), created_at: now, ...r };
            if (tableName === 'tours' || tableName === 'users') {
              return { ...base, updated_at: now };
            }
            return base;
          });
          
          const newRows = [...getTable(tableName), ...withIds];
          setTable(tableName, newRows);
          
          console.log(`Mock insert successful for ${tableName}:`, withIds);
          
          // Return a chainable object that supports .select().single()
          const response: any = {
            data: withIds,
            error: null,
            select() {
              return {
                async single() { 
                  console.log('Mock select().single() called, returning:', withIds[0]);
                  return { data: withIds[0] ?? null, error: null }; 
                },
                async maybeSingle() { return { data: withIds[0] ?? null, error: null }; },
              };
            },
            // Also support direct access for backward compatibility
            async then(resolve: any) { resolve({ data: withIds, error: null }); },
          };
          return response;
        } catch (error) {
          console.error('Mock insert error:', error);
          return { data: null, error: { message: 'Mock insert failed' } };
        }
      },
      update(values: any) { 
        console.log(`Mock update() called for ${tableName} with values:`, values);
        return buildWriteBuilder('update', values); 
      },
      delete() { return buildWriteBuilder('delete'); },
      then(resolve: any) { resolve(compute()); },
    };
    return api;
  };

  return {
    auth: {
      async getSession() { return { data: { session: null }, error: null }; },
      onAuthStateChange(_cb: any) { return { data: { subscription: { unsubscribe() {} } } }; },
      async signUp(_args: any) { return { data: { user: null }, error: { message: 'Supabase not configured' } }; },
      async signInWithPassword(_args: any) { return { data: {}, error: { message: 'Supabase not configured' } }; },
      async signOut() { return { error: null }; },
    },
    from(table: string) { return makeBuilder(table as keyof DB); },
    __dev: {
      isMock: true,
      reset() {
        try { localStorage.removeItem(STORAGE_KEY); } catch {}
        db = loadDB();
      },
    },
  } as any;
}

export const supabase = shouldUseMock
  ? createMockClient()
  : createClient(supabaseUrl as string, supabaseAnonKey as string);

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
  phone?: string;
  address?: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at?: string;
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