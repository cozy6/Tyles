import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';

type UserData = Database['public']['Tables']['users']['Row'];
type Platform = Database['public']['Tables']['platforms']['Row'];
type Earning = Database['public']['Tables']['earnings']['Row'];
type Expense = Database['public']['Tables']['expenses']['Row'];
type Goal = Database['public']['Tables']['user_goals']['Row'];
type ConnectedAccount = Database['public']['Tables']['connected_accounts']['Row'];

interface UserStore {
  // User data
  userData: UserData | null;
  platforms: Platform[];
  earnings: Earning[];
  expenses: Expense[];
  goals: Goal[];
  connectedAccounts: ConnectedAccount[];
  
  // Loading states
  loading: {
    userData: boolean;
    platforms: boolean;
    earnings: boolean;
    expenses: boolean;
    goals: boolean;
    connectedAccounts: boolean;
  };
  
  // Error states
  errors: {
    userData: string | null;
    platforms: string | null;
    earnings: string | null;
    expenses: string | null;
    goals: string | null;
    connectedAccounts: string | null;
  };
  
  // Actions
  setUserData: (userData: UserData | null) => void;
  fetchUserData: (firebaseUid: string) => Promise<void>;
  fetchPlatforms: () => Promise<void>;
  fetchEarnings: (userId: string, startDate?: string, endDate?: string) => Promise<void>;
  fetchExpenses: (userId: string, startDate?: string, endDate?: string) => Promise<void>;
  fetchGoals: (userId: string) => Promise<void>;
  fetchConnectedAccounts: (userId: string) => Promise<void>;
  
  // CRUD operations
  addEarning: (earning: Database['public']['Tables']['earnings']['Insert']) => Promise<void>;
  updateEarning: (id: string, earning: Database['public']['Tables']['earnings']['Update']) => Promise<void>;
  deleteEarning: (id: string) => Promise<void>;
  
  addExpense: (expense: Database['public']['Tables']['expenses']['Insert']) => Promise<void>;
  updateExpense: (id: string, expense: Database['public']['Tables']['expenses']['Update']) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  
  addGoal: (goal: Database['public']['Tables']['user_goals']['Insert']) => Promise<void>;
  updateGoal: (id: string, goal: Database['public']['Tables']['user_goals']['Update']) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  
  // Computed values
  getTotalEarnings: (startDate?: string, endDate?: string) => number;
  getTotalExpenses: (startDate?: string, endDate?: string) => number;
  getAvailableBalance: () => number;
  getGoalProgress: (goalType: string) => { current: number; target: number; progress: number };
  
  // Utility functions
  clearAllData: () => void;
  setLoading: (key: keyof UserStore['loading'], value: boolean) => void;
  setError: (key: keyof UserStore['errors'], value: string | null) => void;
}

export const useUserStore = create<UserStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    userData: null,
    platforms: [],
    earnings: [],
    expenses: [],
    goals: [],
    connectedAccounts: [],
    
    loading: {
      userData: false,
      platforms: false,
      earnings: false,
      expenses: false,
      goals: false,
      connectedAccounts: false,
    },
    
    errors: {
      userData: null,
      platforms: null,
      earnings: null,
      expenses: null,
      goals: null,
      connectedAccounts: null,
    },
    
    // Actions
    setUserData: (userData) => set({ userData }),
    
    fetchUserData: async (firebaseUid) => {
      set((state) => ({ loading: { ...state.loading, userData: true } }));
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('firebase_uid', firebaseUid)
          .single();
        
        if (error) throw error;
        
        set({ userData: data, errors: { ...get().errors, userData: null } });
      } catch (error: any) {
        set({ errors: { ...get().errors, userData: error.message } });
      } finally {
        set((state) => ({ loading: { ...state.loading, userData: false } }));
      }
    },
    
    fetchPlatforms: async () => {
      set((state) => ({ loading: { ...state.loading, platforms: true } }));
      try {
        const { data, error } = await supabase
          .from('platforms')
          .select('*')
          .order('name');
        
        if (error) throw error;
        
        set({ platforms: data, errors: { ...get().errors, platforms: null } });
      } catch (error: any) {
        set({ errors: { ...get().errors, platforms: error.message } });
      } finally {
        set((state) => ({ loading: { ...state.loading, platforms: false } }));
      }
    },
    
    fetchEarnings: async (userId, startDate, endDate) => {
      set((state) => ({ loading: { ...state.loading, earnings: true } }));
      try {
        let query = supabase
          .from('earnings')
          .select('*, platforms(*)')
          .eq('user_id', userId)
          .order('date', { ascending: false });
        
        if (startDate) query = query.gte('date', startDate);
        if (endDate) query = query.lte('date', endDate);
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        set({ earnings: data, errors: { ...get().errors, earnings: null } });
      } catch (error: any) {
        set({ errors: { ...get().errors, earnings: error.message } });
      } finally {
        set((state) => ({ loading: { ...state.loading, earnings: false } }));
      }
    },
    
    fetchExpenses: async (userId, startDate, endDate) => {
      set((state) => ({ loading: { ...state.loading, expenses: true } }));
      try {
        let query = supabase
          .from('expenses')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false });
        
        if (startDate) query = query.gte('date', startDate);
        if (endDate) query = query.lte('date', endDate);
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        set({ expenses: data, errors: { ...get().errors, expenses: null } });
      } catch (error: any) {
        set({ errors: { ...get().errors, expenses: error.message } });
      } finally {
        set((state) => ({ loading: { ...state.loading, expenses: false } }));
      }
    },
    
    fetchGoals: async (userId) => {
      set((state) => ({ loading: { ...state.loading, goals: true } }));
      try {
        const { data, error } = await supabase
          .from('user_goals')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        set({ goals: data, errors: { ...get().errors, goals: null } });
      } catch (error: any) {
        set({ errors: { ...get().errors, goals: error.message } });
      } finally {
        set((state) => ({ loading: { ...state.loading, goals: false } }));
      }
    },
    
    fetchConnectedAccounts: async (userId) => {
      set((state) => ({ loading: { ...state.loading, connectedAccounts: true } }));
      try {
        const { data, error } = await supabase
          .from('connected_accounts')
          .select('*, platforms(*)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        set({ connectedAccounts: data, errors: { ...get().errors, connectedAccounts: null } });
      } catch (error: any) {
        set({ errors: { ...get().errors, connectedAccounts: error.message } });
      } finally {
        set((state) => ({ loading: { ...state.loading, connectedAccounts: false } }));
      }
    },
    
    // CRUD operations
    addEarning: async (earning) => {
      try {
        const { data, error } = await supabase
          .from('earnings')
          .insert(earning)
          .select('*, platforms(*)')
          .single();
        
        if (error) throw error;
        
        set((state) => ({
          earnings: [data, ...state.earnings],
        }));
      } catch (error: any) {
        set({ errors: { ...get().errors, earnings: error.message } });
        throw error;
      }
    },
    
    updateEarning: async (id, earning) => {
      try {
        const { data, error } = await supabase
          .from('earnings')
          .update(earning)
          .eq('id', id)
          .select('*, platforms(*)')
          .single();
        
        if (error) throw error;
        
        set((state) => ({
          earnings: state.earnings.map(e => e.id === id ? data : e),
        }));
      } catch (error: any) {
        set({ errors: { ...get().errors, earnings: error.message } });
        throw error;
      }
    },
    
    deleteEarning: async (id) => {
      try {
        const { error } = await supabase
          .from('earnings')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        set((state) => ({
          earnings: state.earnings.filter(e => e.id !== id),
        }));
      } catch (error: any) {
        set({ errors: { ...get().errors, earnings: error.message } });
        throw error;
      }
    },
    
    addExpense: async (expense) => {
      try {
        const { data, error } = await supabase
          .from('expenses')
          .insert(expense)
          .select()
          .single();
        
        if (error) throw error;
        
        set((state) => ({
          expenses: [data, ...state.expenses],
        }));
      } catch (error: any) {
        set({ errors: { ...get().errors, expenses: error.message } });
        throw error;
      }
    },
    
    updateExpense: async (id, expense) => {
      try {
        const { data, error } = await supabase
          .from('expenses')
          .update(expense)
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        
        set((state) => ({
          expenses: state.expenses.map(e => e.id === id ? data : e),
        }));
      } catch (error: any) {
        set({ errors: { ...get().errors, expenses: error.message } });
        throw error;
      }
    },
    
    deleteExpense: async (id) => {
      try {
        const { error } = await supabase
          .from('expenses')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        set((state) => ({
          expenses: state.expenses.filter(e => e.id !== id),
        }));
      } catch (error: any) {
        set({ errors: { ...get().errors, expenses: error.message } });
        throw error;
      }
    },
    
    addGoal: async (goal) => {
      try {
        const { data, error } = await supabase
          .from('user_goals')
          .insert(goal)
          .select()
          .single();
        
        if (error) throw error;
        
        set((state) => ({
          goals: [data, ...state.goals],
        }));
      } catch (error: any) {
        set({ errors: { ...get().errors, goals: error.message } });
        throw error;
      }
    },
    
    updateGoal: async (id, goal) => {
      try {
        const { data, error } = await supabase
          .from('user_goals')
          .update(goal)
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        
        set((state) => ({
          goals: state.goals.map(g => g.id === id ? data : g),
        }));
      } catch (error: any) {
        set({ errors: { ...get().errors, goals: error.message } });
        throw error;
      }
    },
    
    deleteGoal: async (id) => {
      try {
        const { error } = await supabase
          .from('user_goals')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        set((state) => ({
          goals: state.goals.filter(g => g.id !== id),
        }));
      } catch (error: any) {
        set({ errors: { ...get().errors, goals: error.message } });
        throw error;
      }
    },
    
    // Computed values
    getTotalEarnings: (startDate, endDate) => {
      const { earnings } = get();
      let filteredEarnings = earnings;
      
      if (startDate) {
        filteredEarnings = filteredEarnings.filter(e => e.date >= startDate);
      }
      if (endDate) {
        filteredEarnings = filteredEarnings.filter(e => e.date <= endDate);
      }
      
      return filteredEarnings.reduce((sum, earning) => sum + earning.amount, 0);
    },
    
    getTotalExpenses: (startDate, endDate) => {
      const { expenses } = get();
      let filteredExpenses = expenses;
      
      if (startDate) {
        filteredExpenses = filteredExpenses.filter(e => e.date >= startDate);
      }
      if (endDate) {
        filteredExpenses = filteredExpenses.filter(e => e.date <= endDate);
      }
      
      return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    },
    
    getAvailableBalance: () => {
      const { userData } = get();
      const totalEarnings = get().getTotalEarnings();
      const totalExpenses = get().getTotalExpenses();
      const estimatedTaxes = totalEarnings * (userData?.estimated_tax_rate || 0.25);
      
      return totalEarnings - totalExpenses - estimatedTaxes;
    },
    
    getGoalProgress: (goalType) => {
      const { goals, earnings } = get();
      const goal = goals.find(g => g.goal_type === goalType);
      
      if (!goal) return { current: 0, target: 0, progress: 0 };
      
      const today = new Date();
      let startDate: string;
      
      switch (goalType) {
        case 'daily':
          startDate = today.toISOString().split('T')[0];
          break;
        case 'weekly':
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          startDate = weekStart.toISOString().split('T')[0];
          break;
        case 'monthly':
          startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
          break;
        default:
          startDate = today.toISOString().split('T')[0];
      }
      
      const current = get().getTotalEarnings(startDate);
      const target = goal.target_amount;
      const progress = target > 0 ? (current / target) * 100 : 0;
      
      return { current, target, progress };
    },
    
    // Utility functions
    clearAllData: () => set({
      userData: null,
      platforms: [],
      earnings: [],
      expenses: [],
      goals: [],
      connectedAccounts: [],
      errors: {
        userData: null,
        platforms: null,
        earnings: null,
        expenses: null,
        goals: null,
        connectedAccounts: null,
      },
    }),
    
    setLoading: (key, value) => set((state) => ({
      loading: { ...state.loading, [key]: value },
    })),
    
    setError: (key, value) => set((state) => ({
      errors: { ...state.errors, [key]: value },
    })),
  }))
);