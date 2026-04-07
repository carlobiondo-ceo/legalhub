import type {
  User,
  LegalCase,
  OptInRequest,
  CaseDocument,
  DashboardStats,
  DeadlineItem,
  ActivityLog,
  PaginatedResponse,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${path}`;
  const isFormData = options.body instanceof FormData;

  const headers: HeadersInit = {
    ...(!isFormData && { "Content-Type": "application/json" }),
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(url, {
    credentials: "include",
    ...options,
    headers,
  });

  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = await res.text().catch(() => null);
    }
    const message =
      (body as { message?: string })?.message ||
      `API error: ${res.status} ${res.statusText}`;
    throw new ApiError(res.status, message, body);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ---------- Auth ----------

export const auth = {
  me: () => request<User>("/auth/me"),

  loginUrl: () => `${API_URL}/auth/google`,

  logout: () => request<void>("/auth/logout", { method: "POST" }),
};

// ---------- Legal Cases ----------

export const cases = {
  list: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
    return request<PaginatedResponse<LegalCase>>(`/cases${qs}`);
  },

  get: (id: string) => request<LegalCase>(`/cases/${id}`),

  create: (data: Partial<LegalCase>) =>
    request<LegalCase>("/cases", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<LegalCase>) =>
    request<LegalCase>(`/cases/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/cases/${id}`, { method: "DELETE" }),
};

// ---------- Opt-In Requests ----------

export const optInRequests = {
  list: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
    return request<PaginatedResponse<OptInRequest>>(`/opt-in-requests${qs}`);
  },

  get: (id: string) => request<OptInRequest>(`/opt-in-requests/${id}`),

  create: (data: Partial<OptInRequest>) =>
    request<OptInRequest>("/opt-in-requests", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<OptInRequest>) =>
    request<OptInRequest>(`/opt-in-requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/opt-in-requests/${id}`, { method: "DELETE" }),
};

// ---------- Documents ----------

export const documents = {
  upload: (file: File, data: Record<string, string>) => {
    const formData = new FormData();
    formData.append("file", file);
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    return request<CaseDocument>("/documents", {
      method: "POST",
      body: formData,
    });
  },

  downloadUrl: (id: string) => `${API_URL}/documents/${id}/download`,

  delete: (id: string) =>
    request<void>(`/documents/${id}`, { method: "DELETE" }),
};

// ---------- Dashboard ----------

export const dashboard = {
  stats: () => request<DashboardStats>("/dashboard/stats"),

  deadlines: () => request<DeadlineItem[]>("/dashboard/deadlines"),

  activity: () => request<ActivityLog[]>("/dashboard/activity"),
};
