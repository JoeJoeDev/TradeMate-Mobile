import axios, { AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';
import {
  AuthResponse,
  User,
  Customer,
  Job,
  Invoice,
  Quote,
  DashboardData,
  PaginatedResponse,
} from '../types';

// Configure your API base URL
// iOS Simulator: http://localhost:8000
// Android Emulator: http://10.0.2.2:8000
// Physical device: Your computer's IP
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
const TOKEN_KEY = 'auth_token';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api/v1`,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.client.interceptors.request.use(
      async (config) => {
        const token = await this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await this.removeToken();
        }
        return Promise.reject(error);
      }
    );
  }

  // Token management
  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  async setToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }

  async removeToken(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }

  // Auth
  async login(email: string, password: string, deviceName: string): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/login', {
      email,
      password,
      device_name: deviceName,
    });
    await this.setToken(response.data.token);
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout');
    } finally {
      await this.removeToken();
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.client.get<{ user: User }>('/auth/user');
    return response.data.user;
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardData> {
    const response = await this.client.get<DashboardData>('/dashboard/stats');
    return response.data;
  }

  // Customers
  async getCustomers(params?: Record<string, any>): Promise<PaginatedResponse<Customer>> {
    const response = await this.client.get('/customers', { params });
    return response.data;
  }

  async getCustomer(id: number): Promise<{ data: Customer }> {
    const response = await this.client.get(`/customers/${id}`);
    return response.data;
  }

  // Jobs
  async getJobs(params?: Record<string, any>): Promise<PaginatedResponse<Job>> {
    const response = await this.client.get('/jobs', { params });
    return response.data;
  }

  async getJob(id: number): Promise<{ data: Job }> {
    const response = await this.client.get(`/jobs/${id}`);
    return response.data;
  }

  async startJob(id: number): Promise<{ data: Job }> {
    const response = await this.client.post(`/jobs/${id}/start`);
    return response.data;
  }

  async completeJob(id: number): Promise<{ data: Job }> {
    const response = await this.client.post(`/jobs/${id}/complete`);
    return response.data;
  }

  // Invoices
  async getInvoices(params?: Record<string, any>): Promise<PaginatedResponse<Invoice> & { stats: any }> {
    const response = await this.client.get('/invoices', { params });
    return response.data;
  }

  async getInvoice(id: number): Promise<{ data: Invoice }> {
    const response = await this.client.get(`/invoices/${id}`);
    return response.data;
  }

  // Quotes
  async getQuotes(params?: Record<string, any>): Promise<PaginatedResponse<Quote>> {
    const response = await this.client.get('/quotes', { params });
    return response.data;
  }
}

// Export the service instance
export const apiService = new ApiService();

// Export the axios client directly for use with React Query hooks
// This allows hooks to use api.get(), api.post() etc.
export const api = {
  get: <T = any>(url: string, config?: any) =>
    apiService['client'].get<T>(url, config),
  post: <T = any>(url: string, data?: any, config?: any) =>
    apiService['client'].post<T>(url, data, config),
  put: <T = any>(url: string, data?: any, config?: any) =>
    apiService['client'].put<T>(url, data, config),
  delete: <T = any>(url: string, config?: any) =>
    apiService['client'].delete<T>(url, config),
  // Token helpers
  getToken: () => apiService.getToken(),
  setToken: (token: string) => apiService.setToken(token),
  removeToken: () => apiService.removeToken(),
};

export default apiService;

