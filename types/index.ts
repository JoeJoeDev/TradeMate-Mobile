// User types
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  active: boolean;
  company?: Company;
  permissions: UserPermissions;
}

export interface UserPermissions {
  is_owner: boolean;
  is_admin: boolean;
  is_manager: boolean;
  can_manage_users: boolean;
  can_manage_customers: boolean;
  can_manage_jobs: boolean;
  can_manage_invoices: boolean;
  can_view_reports: boolean;
}

export interface Company {
  id: number;
  company_name: string;
  display_name: string;
}

// Customer types
export interface Customer {
  id: number;
  customer_name: string;
  contact_name?: string;
  email_address?: string;
  phone_number?: string;
  mobile_number?: string;
  physical_address: Address;
  postal_address: Address;
  archived: boolean;
  primary_phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Address {
  street?: string;
  city?: string;
  region?: string;
  postal_code?: string;
  country?: string;
  formatted?: string;
}

// Job types
export interface Job {
  id: number;
  job_number?: string;
  title: string;
  description?: string;
  status: JobStatus;
  priority: JobPriority;
  price: number;
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  estimated_duration_minutes?: number;
  job_address?: string;
  formatted_address?: string;
  invoiced: boolean;
  is_overdue: boolean;
  is_due_today: boolean;
  customer?: CustomerSummary;
  assigned_to?: UserSummary;
  created_at: string;
  updated_at: string;
}

export type JobStatus = 'scheduled' | 'in_progress' | 'complete' | 'cancelled';
export type JobPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface CustomerSummary {
  id: number;
  customer_name: string;
  email_address?: string;
  phone_number?: string;
}

export interface UserSummary {
  id: number;
  name: string;
}

// Invoice types
export interface Invoice {
  id: number;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  status: InvoiceStatus;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  outstanding: number;
  is_overdue: boolean;
  customer?: CustomerSummary;
  items?: InvoiceItem[];
  created_at: string;
  updated_at: string;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

export interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  job_id?: number;
  job?: {
    id: number;
    title: string;
  };
}

// Quote types
export interface Quote {
  id: number;
  quote_number: string;
  quote_date: string;
  due_date: string;
  status: QuoteStatus;
  subtotal: number;
  total_amount: number;
  customer?: CustomerSummary;
  items?: QuoteItem[];
  created_at: string;
  updated_at: string;
}

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'declined' | 'expired';

export interface QuoteItem {
  id: number;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

// Dashboard types
export interface DashboardStats {
  jobs_today: number;
  jobs_overdue: number;
  jobs_this_week: number;
  active_customers: number;
  outstanding_invoices: number;
  overdue_invoices: number;
  this_month_revenue: number;
}

export interface DashboardData {
  stats: DashboardStats;
  upcoming_jobs: Job[];
  recent_jobs: Job[];
}

// API types
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

