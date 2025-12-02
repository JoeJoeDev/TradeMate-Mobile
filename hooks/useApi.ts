import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Customer, Job, Invoice, Quote } from '../types';

// Dashboard
export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/dashboard/stats').then(res => res.data),
  });
}

// Customers
export function useCustomers(params?: { search?: string; active?: boolean }) {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: () => api.get('/customers', { params }).then(res => res.data),
  });
}

export function useCustomer(id: number) {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: () => api.get(`/customers/${id}`).then(res => res.data),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Customer>) => api.post('/customers', data).then(res => res.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Customer> & { id: number }) =>
      api.put(`/customers/${id}`, data).then(res => res.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  });
}

// Jobs
export function useJobs(params?: { search?: string; status?: string; per_page?: number }) {
  return useQuery({
    queryKey: ['jobs', params],
    queryFn: () => api.get('/jobs', { params }).then(res => res.data),
  });
}

export function useJob(id: number) {
  return useQuery({
    queryKey: ['jobs', id],
    queryFn: () => api.get(`/jobs/${id}`).then(res => res.data),
    enabled: !!id,
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Job>) => api.post('/jobs', data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Job> & { id: number }) =>
      api.put(`/jobs/${id}`, data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useStartJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.post(`/jobs/${id}/start`).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useCompleteJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.post(`/jobs/${id}/complete`).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// Invoices
export function useInvoices(params?: { search?: string; status?: string }) {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: () => api.get('/invoices', { params }).then(res => res.data),
  });
}

export function useInvoice(id: number) {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: () => api.get(`/invoices/${id}`).then(res => res.data),
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Invoice>) => api.post('/invoices', data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useSendInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.post(`/invoices/${id}/send`).then(res => res.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }),
  });
}

export function useAddPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount, method }: { id: number; amount: number; method: string }) =>
      api.post(`/invoices/${id}/add-payment`, { amount, method }).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// Quotes
export function useQuotes(params?: { search?: string; status?: string }) {
  return useQuery({
    queryKey: ['quotes', params],
    queryFn: () => api.get('/quotes', { params }).then(res => res.data),
  });
}

export function useQuote(id: number) {
  return useQuery({
    queryKey: ['quotes', id],
    queryFn: () => api.get(`/quotes/${id}`).then(res => res.data),
    enabled: !!id,
  });
}

export function useCreateQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Quote>) => api.post('/quotes', data).then(res => res.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['quotes'] }),
  });
}
