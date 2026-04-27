import { useMutation, useQuery } from "@tanstack/react-query";
import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import axios from "axios";
import type { AxiosError, AxiosInstance } from "axios";

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: "student" | "lecturer" | "admin" | "pending_student" | "pending_lecturer";
  department?: string;
  level?: string;
  enrollmentYear?: number;
  createdAt: string;
  updatedAt: string;
}

export interface QueueEntry {
  id: number;
  queueId: number;
  userId: number;
  position: number;
  joinedAt: string;
  status: "waiting" | "called" | "completed" | "left";
  estimatedWaitMinutes: number;
  calledAt?: string;
  completedAt?: string;
}

export interface Queue {
  id: number;
  name: string;
  description?: string;
  department?: string;
  allowedLevel?: string;
  status: "active" | "paused" | "closed";
  currentSize: number;
  estimatedWaitPerPerson: number;
  createdAt: string;
  entries?: QueueEntry[];
  myPosition?: number;
  estimatedWaitMinutes?: number;
}

export interface DashboardSummary {
  activeQueues: number;
  totalStudentsWaiting: number;
  myActiveQueues: number;
  completedToday: number;
}

export interface QueueStats {
  queueId: number;
  queueName: string;
  totalServed: number;
  currentWaiting: number;
  avgWaitMinutes: number;
}

export interface EntryHistory {
  id: number;
  queue: Queue;
  joinedAt: string;
  calledAt?: string;
  completedAt?: string;
  status: "called" | "completed" | "left";
}

interface ApiErrorBody {
  error?: string;
  message?: string;
}

class ApiClientError extends Error {
  error?: string;

  constructor(message: string, serverError?: string) {
    super(message);
    this.name = "ApiClientError";
    this.error = serverError;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
let authTokenGetter: (() => string) | null = null;

export function setAuthTokenGetter(getter: () => string) {
  authTokenGetter = getter;
}

function createAxiosInstance(): AxiosInstance {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  instance.interceptors.request.use((config) => {
    const token = authTokenGetter?.();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return instance;
}

const api = createAxiosInstance();

function normalizeError(error: unknown): ApiClientError {
  const axiosError = error as AxiosError<ApiErrorBody>;
  const serverMessage = axiosError.response?.data?.error || axiosError.response?.data?.message;
  return new ApiClientError(serverMessage || "Request failed", serverMessage);
}

export const queryKeys = {
  queues: () => ["queues"] as const,
  listQueues: (filters?: { department?: string }) => ["queues", "list", filters?.department || "all"] as const,
  getQueue: (id: number) => ["queues", "detail", id] as const,
  queueStats: (id?: number) => ["queues", "stats", id ?? "all"] as const,
  dashboardSummary: () => ["dashboard", "summary"] as const,
  activeQueues: () => ["dashboard", "active-queues"] as const,
  history: () => ["history"] as const,
  users: () => ["users"] as const,
};

export const getListQueuesQueryKey = () => queryKeys.listQueues();
export const getGetQueueQueryKey = (id: number) => queryKeys.getQueue(id);
export const getGetDashboardSummaryQueryKey = () => queryKeys.dashboardSummary();
export const getGetActiveQueuesQueryKey = () => queryKeys.activeQueues();

export function useLogin(): UseMutationResult<
  { user: User; token: string },
  ApiClientError,
  { email: string; password: string } | { data: { email: string; password: string } }
> {
  return useMutation({
    mutationFn: async (payload) => {
      try {
        const body = "data" in payload ? payload.data : payload;
        const response = await api.post("/auth/login", body);
        return response.data;
      } catch (error) {
        throw normalizeError(error);
      }
    },
  });
}

export function useRegister(): UseMutationResult<
  { user: User; token?: string; requiresVerification?: boolean; message?: string },
  ApiClientError,
  FormData
> {
  return useMutation({
    mutationFn: async (formData:FormData) => {
      try {
        const response = await api.post("/auth/register", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        return response.data;
      } catch (error) {
        throw normalizeError(error);
      }
    },
  });
}

export function useListQueues(filters?: { department?: string }): UseQueryResult<Queue[], ApiClientError> {
  return useQuery({
    queryKey: queryKeys.listQueues(filters),
    queryFn: async () => {
      try {
        const response = await api.get("/queues", { params: filters });
        return response.data as Queue[];
      } catch (error) {
        throw normalizeError(error);
      }
    },
  });
}

export function useGetQueue(
  id: number,
  options?: { query?: { enabled?: boolean } },
): UseQueryResult<Queue, ApiClientError> {
  return useQuery({
    queryKey: queryKeys.getQueue(id),
    queryFn: async () => {
      try {
        const response = await api.get(`/queues/${id}`);
        return response.data as Queue;
      } catch (error) {
        throw normalizeError(error);
      }
    },
    enabled: options?.query?.enabled ?? Boolean(id),
  });
}

export function useCreateQueue(): UseMutationResult<
  Queue,
  ApiClientError,
  {
    data: {
      name: string;
      description?: string;
      department?: string;
      allowedLevel?: string;
      estimatedWaitPerPerson?: number;
    };
  }
> {
  return useMutation({
    mutationFn: async ({ data }) => {
      try {
        const response = await api.post("/queues", data);
        return response.data as Queue;
      } catch (error) {
        throw normalizeError(error);
      }
    },
  });
}

export function useUpdateQueue(): UseMutationResult<
  Queue,
  ApiClientError,
  { id: number; data: Partial<Queue> }
> {
  return useMutation({
    mutationFn: async ({ id, data }) => {
      try {
        const response = await api.put(`/queues/${id}`, data);
        return response.data as Queue;
      } catch (error) {
        throw normalizeError(error);
      }
    },
  });
}

export function useDeleteQueue(): UseMutationResult<void, ApiClientError, { id: number }> {
  return useMutation({
    mutationFn: async ({ id }) => {
      try {
        await api.delete(`/queues/${id}`);
      } catch (error) {
        throw normalizeError(error);
      }
    },
  });
}

export function useJoinQueue(): UseMutationResult<QueueEntry, ApiClientError, { id: number }> {
  return useMutation({
    mutationFn: async ({ id }) => {
      try {
        const response = await api.post(`/queues/${id}/join`);
        return response.data as QueueEntry;
      } catch (error) {
        throw normalizeError(error);
      }
    },
  });
}

export function useLeaveQueue(): UseMutationResult<void, ApiClientError, { id: number }> {
  return useMutation({
    mutationFn: async ({ id }) => {
      try {
        await api.post(`/queues/${id}/leave`);
      } catch (error) {
        throw normalizeError(error);
      }
    },
  });
}

export function useCallNextInQueue(): UseMutationResult<QueueEntry | null, ApiClientError, { id: number }> {
  return useMutation({
    mutationFn: async ({ id }) => {
      try {
        const response = await api.post(`/queues/${id}/next`);
        return response.data as QueueEntry | null;
      } catch (error) {
        throw normalizeError(error);
      }
    },
  });
}

export function useGetDashboardSummary(): UseQueryResult<DashboardSummary, ApiClientError> {
  return useQuery({
    queryKey: queryKeys.dashboardSummary(),
    queryFn: async () => {
      try {
        const response = await api.get("/dashboard/summary");
        return response.data as DashboardSummary;
      } catch (error) {
        throw normalizeError(error);
      }
    },
  });
}

export function useGetActiveQueues(): UseQueryResult<Queue[], ApiClientError> {
  return useQuery({
    queryKey: queryKeys.activeQueues(),
    queryFn: async () => {
      try {
        const response = await api.get("/queues/active");
        return response.data as Queue[];
      } catch (error) {
        throw normalizeError(error);
      }
    },
  });
}

export function useGetQueueStats(queueId?: number): UseQueryResult<QueueStats[], ApiClientError> {
  return useQuery({
    queryKey: queryKeys.queueStats(queueId),
    queryFn: async () => {
      try {
        const endpoint = queueId ? `/queues/${queueId}/stats` : "/queues/stats";
        const response = await api.get(endpoint);
        const payload = response.data;
        return Array.isArray(payload) ? payload : [payload];
      } catch (error) {
        throw normalizeError(error);
      }
    },
  });
}

export function useGetEntryHistory(): UseQueryResult<EntryHistory[], ApiClientError> {
  return useQuery({
    queryKey: queryKeys.history(),
    queryFn: async () => {
      try {
        const response = await api.get("/history");
        return response.data as EntryHistory[];
      } catch (error) {
        throw normalizeError(error);
      }
    },
  });
}

export function useListUsers(): UseQueryResult<User[], ApiClientError> {
  return useQuery({
    queryKey: queryKeys.users(),
    queryFn: async () => {
      try {
        const response = await api.get("/users");
        return response.data as User[];
      } catch (error) {
        throw normalizeError(error);
      }
    },
  });
}
