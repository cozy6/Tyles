export type PlatformType = 'rideshare' | 'delivery' | 'freelance' | 'other';
export type ConnectionType = 'plaid' | 'manual' | 'email_parse' | 'api';
export type ExpenseCategory = 'fuel' | 'maintenance' | 'insurance' | 'phone' | 'food' | 'supplies' | 'other';
export type TaxFilingStatus = 'single' | 'married_filing_jointly' | 'married_filing_separately' | 'head_of_household';
export type WithholdingStatus = 'pending' | 'processed' | 'failed';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          firebase_uid: string
          email: string
          full_name: string | null
          phone: string | null
          onboarding_completed: boolean
          tax_filing_status: TaxFilingStatus | null
          estimated_tax_rate: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          firebase_uid: string
          email: string
          full_name?: string | null
          phone?: string | null
          onboarding_completed?: boolean
          tax_filing_status?: TaxFilingStatus | null
          estimated_tax_rate?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          firebase_uid?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          onboarding_completed?: boolean
          tax_filing_status?: TaxFilingStatus | null
          estimated_tax_rate?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      platforms: {
        Row: {
          id: string
          name: string
          type: PlatformType
          api_available: boolean
          color: string | null
          icon_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type: PlatformType
          api_available?: boolean
          color?: string | null
          icon_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: PlatformType
          api_available?: boolean
          color?: string | null
          icon_url?: string | null
          created_at?: string
        }
      }
      connected_accounts: {
        Row: {
          id: string
          user_id: string
          platform_id: string
          account_identifier: string
          connection_type: ConnectionType
          is_active: boolean
          last_sync: string | null
          sync_error: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          platform_id: string
          account_identifier: string
          connection_type: ConnectionType
          is_active?: boolean
          last_sync?: string | null
          sync_error?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          platform_id?: string
          account_identifier?: string
          connection_type?: ConnectionType
          is_active?: boolean
          last_sync?: string | null
          sync_error?: string | null
          created_at?: string
        }
      }
      earnings: {
        Row: {
          id: string
          user_id: string
          platform_id: string
          amount: number
          gross_amount: number
          fees: number
          tips: number
          date: string
          transaction_id: string | null
          description: string | null
          trip_count: number | null
          hours_worked: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          platform_id: string
          amount: number
          gross_amount: number
          fees?: number
          tips?: number
          date: string
          transaction_id?: string | null
          description?: string | null
          trip_count?: number | null
          hours_worked?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          platform_id?: string
          amount?: number
          gross_amount?: number
          fees?: number
          tips?: number
          date?: string
          transaction_id?: string | null
          description?: string | null
          trip_count?: number | null
          hours_worked?: number | null
          created_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          user_id: string
          amount: number
          category: ExpenseCategory
          subcategory: string | null
          description: string | null
          receipt_url: string | null
          is_business_expense: boolean
          mileage: number | null
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          category: ExpenseCategory
          subcategory?: string | null
          description?: string | null
          receipt_url?: string | null
          is_business_expense?: boolean
          mileage?: number | null
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          category?: ExpenseCategory
          subcategory?: string | null
          description?: string | null
          receipt_url?: string | null
          is_business_expense?: boolean
          mileage?: number | null
          date?: string
          created_at?: string
        }
      }
      tax_withholdings: {
        Row: {
          id: string
          user_id: string
          amount: number
          percentage: number
          period_start: string
          period_end: string
          status: WithholdingStatus
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          percentage: number
          period_start: string
          period_end: string
          status?: WithholdingStatus
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          percentage?: number
          period_start?: string
          period_end?: string
          status?: WithholdingStatus
          created_at?: string
        }
      }
      income_predictions: {
        Row: {
          id: string
          user_id: string
          prediction_date: string
          predicted_amount: number
          confidence_score: number
          actual_amount: number | null
          model_version: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          prediction_date: string
          predicted_amount: number
          confidence_score: number
          actual_amount?: number | null
          model_version?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          prediction_date?: string
          predicted_amount?: number
          confidence_score?: number
          actual_amount?: number | null
          model_version?: string
          created_at?: string
        }
      }
      user_goals: {
        Row: {
          id: string
          user_id: string
          goal_type: string
          target_amount: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          goal_type: string
          target_amount: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          goal_type?: string
          target_amount?: number
          is_active?: boolean
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          is_read?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_by_firebase_uid: {
        Args: {
          firebase_uid_param: string
        }
        Returns: {
          id: string
          firebase_uid: string
          email: string
          full_name: string | null
          phone: string | null
          onboarding_completed: boolean
          tax_filing_status: TaxFilingStatus | null
          estimated_tax_rate: number | null
          created_at: string
          updated_at: string
        }[]
      }
      get_user_earnings_summary: {
        Args: {
          user_id_param: string
          start_date: string
          end_date: string
        }
        Returns: {
          total_earnings: number
          total_tips: number
          total_fees: number
          total_hours: number
          total_trips: number
        }[]
      }
    }
    Enums: {
      platform_type: PlatformType
      connection_type: ConnectionType
      expense_category: ExpenseCategory
      tax_filing_status: TaxFilingStatus
      withholding_status: WithholdingStatus
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}