// API Client for be-pro backend services

const UPLOAD_SERVICE_URL =
  process.env.NEXT_PUBLIC_UPLOAD_SERVICE_URL || "http://localhost:8000";
const QUERY_SERVICE_URL =
  process.env.NEXT_PUBLIC_QUERY_SERVICE_URL || "http://localhost:8001";
const AI_BACKEND_URL =
  process.env.NEXT_PUBLIC_AI_BACKEND_URL || "http://localhost:8002";

// Helper function to get auth headers automatically
function getAuthHeaders(includeContentType = true): Record<string, string> {
  const headers: Record<string, string> = {};

  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }

  // Auto-inject token from localStorage if available
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
}

// Types for API requests and responses
export interface RegisterRequest {
  username: string;
  password: string;
  full_name?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface UserResponse {
  id: number;
  username: string;
  full_name?: string;
  is_active: boolean;
  is_admin: boolean;
  subscription_plan: "free" | "normal" | "pro";
  subscription_expires_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface UpdateProfileRequest {
  full_name?: string;
  phone?: string;
  company?: string;
  address?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface AdminUserUpdateRequest {
  full_name?: string;
  is_active?: boolean;
  is_admin?: boolean;
}

export type DocumentType = "pdf" | "docx" | "image" | "xlsx";
export type DocumentStatus = "processing" | "processed" | "error";
export type FeedbackType = "like" | "dislike";

export interface DocumentResponse {
  id: number;
  user_id: number;
  name: string;
  type?: DocumentType;
  size: number;
  uploaded_at: string;
  status: DocumentStatus;
  processing_time?: number;
  chunks?: number;
  embeddings?: number;
}

export interface DocumentCreateRequest {
  name: string;
  type?: DocumentType;
  size: number;
}

export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
}

export interface FeedbackCreateRequest {
  message: string;
  ai_response?: string; // Optional
  feedback_type: FeedbackType;
  comment?: string;
}

export interface FeedbackResponse {
  id: number;
  user_id: number;
  message: string;
  ai_response?: string; // Optional
  feedback_type: FeedbackType;
  comment?: string;
  created_at: string;
  username?: string; // For admin view
}

export interface FeedbackStatsResponse {
  total_feedbacks: number;
  total_likes: number;
  total_dislikes: number;
  like_percentage: number;
}

export interface UploadDocumentRequest {
  files: File[];
  user_id: string;
  max_workers?: number;
}

export interface UploadDocumentResponse {
  conversation_id: number;
  summary: {
    total_files: number;
    successful_files: number;
    failed_files: number;
    total_chunks_processed: number;
    total_embeddings_created: number;
    total_processing_time: number;
    workers_used: number;
  };
  results: Array<{
    filename: string;
    status: string;
    message: string;
    processed_chunks: number;
    embeddings_created: number;
    processing_time: number;
    error?: string;
  }>;
  errors: string[];
}

export interface ChatRequest {
  message: string;
  chat_history?: Array<{ role: string; content: string }>;
  documents?: string[];
  conversation_id?: number;
}

export interface ChatResponse {
  message: string;
  sources?: Array<{
    title?: string;
    content?: string;
    metadata?: Record<string, any>;
  }>;
}

export interface Conversation {
  id: number;
  title: string;
  history: string;
}

export interface ConversationDetail extends Conversation {
  documents: Array<{
    id: number;
    name: string;
    size: number;
  }>;
}

// Auth API - Using AI Backend
export const authApi = {
  register: async (data: RegisterRequest): Promise<UserResponse> => {
    const response = await fetch(`${AI_BACKEND_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Registration failed");
    }

    return response.json();
  },

  login: async (data: LoginRequest): Promise<AuthTokenResponse> => {
    const response = await fetch(`${AI_BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Login failed");
    }

    return response.json();
  },

  getCurrentUser: async (token: string): Promise<UserResponse> => {
    const response = await fetch(`${AI_BACKEND_URL}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get user info");
    }

    return response.json();
  },

  updateProfile: async (
    data: UpdateProfileRequest,
    token: string,
  ): Promise<UserResponse> => {
    const response = await fetch(`${AI_BACKEND_URL}/users/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to update profile");
    }

    return response.json();
  },

  changePassword: async (
    data: ChangePasswordRequest,
    token: string,
  ): Promise<{ message: string }> => {
    const response = await fetch(`${AI_BACKEND_URL}/users/me/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to change password");
    }

    return response.json();
  },
};

// Legacy Document API (Upload Service)
export const legacyDocumentApi = {
  upload: async (
    data: UploadDocumentRequest,
  ): Promise<UploadDocumentResponse> => {
    const formData = new FormData();

    data.files.forEach((file) => {
      formData.append("files", file);
    });

    formData.append("user_id", data.user_id);

    if (data.max_workers) {
      formData.append("max_workers", data.max_workers.toString());
    }

    const response = await fetch(`${UPLOAD_SERVICE_URL}/api/document/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  },

  uploadSingle: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      `${UPLOAD_SERVICE_URL}/api/document/upload/single`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  },
};

// Conversation API
export const conversationApi = {
  getUserConversations: async (userId: number): Promise<Conversation[]> => {
    const response = await fetch(
      `${UPLOAD_SERVICE_URL}/api/conversation/conversations/user/${userId}`,
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch conversations: ${response.statusText}`);
    }

    return response.json();
  },

  getConversationDetail: async (
    conversationId: number,
  ): Promise<ConversationDetail> => {
    const response = await fetch(
      `${UPLOAD_SERVICE_URL}/api/conversation/conversations/${conversationId}`,
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch conversation: ${response.statusText}`);
    }

    return response.json();
  },
};

// Chat API (Query Service with Documents)
export const chatApi = {
  sendMessage: async (data: ChatRequest): Promise<ChatResponse> => {
    const response = await fetch(`${QUERY_SERVICE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Chat request failed: ${response.statusText}`);
    }

    return response.json();
  },
};

// AI Backend API (Simple Chat without Documents)
export const aiBackendApi = {
  chat: async (message: string): Promise<{ reply: string }> => {
    const response = await fetch(`${AI_BACKEND_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`AI Backend request failed: ${response.statusText}`);
    }

    return response.json();
  },

  chatWithImage: async (formData: FormData): Promise<{ reply: string }> => {
    const response = await fetch(`${AI_BACKEND_URL}/chat-image`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw { response: { data: errorData } };
    }

    return response.json();
  },
};

// Admin API
export const adminApi = {
  listUsers: async (
    token: string,
    skip = 0,
    limit = 100,
  ): Promise<UserResponse[]> => {
    const response = await fetch(
      `${AI_BACKEND_URL}/admin/users?skip=${skip}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to fetch users");
    }

    return response.json();
  },

  getUser: async (userId: number, token: string): Promise<UserResponse> => {
    const response = await fetch(`${AI_BACKEND_URL}/admin/users/${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to fetch user");
    }

    return response.json();
  },

  updateUser: async (
    userId: number,
    data: AdminUserUpdateRequest,
    token: string,
  ): Promise<UserResponse> => {
    const response = await fetch(`${AI_BACKEND_URL}/admin/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to update user");
    }

    return response.json();
  },

  deleteUser: async (
    userId: number,
    token: string,
  ): Promise<{ message: string }> => {
    const response = await fetch(`${AI_BACKEND_URL}/admin/users/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to delete user");
    }

    return response.json();
  },
};

// Document API
export const documentApi = {
  upload: async (
    data: DocumentCreateRequest,
    token: string,
  ): Promise<DocumentResponse> => {
    const response = await fetch(`${AI_BACKEND_URL}/documents/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to upload document");
    }

    return response.json();
  },

  list: async (
    token: string,
    skip = 0,
    limit = 100,
  ): Promise<DocumentResponse[]> => {
    const response = await fetch(
      `${AI_BACKEND_URL}/documents?skip=${skip}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to fetch documents");
    }

    return response.json();
  },

  get: async (documentId: number, token: string): Promise<DocumentResponse> => {
    const response = await fetch(`${AI_BACKEND_URL}/documents/${documentId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to fetch document");
    }

    return response.json();
  },

  delete: async (
    documentId: number,
    token: string,
  ): Promise<{ message: string }> => {
    const response = await fetch(`${AI_BACKEND_URL}/documents/${documentId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to delete document");
    }

    return response.json();
  },

  // Admin only
  listAll: async (
    token: string,
    skip = 0,
    limit = 100,
  ): Promise<DocumentResponse[]> => {
    const response = await fetch(
      `${AI_BACKEND_URL}/admin/documents?skip=${skip}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to fetch all documents");
    }

    return response.json();
  },
};

// Feedback API
export const feedbackApi = {
  create: async (data: FeedbackCreateRequest): Promise<FeedbackResponse> => {
    const response = await fetch(`${AI_BACKEND_URL}/feedbacks`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to submit feedback");
    }

    return response.json();
  },

  listMine: async (skip = 0, limit = 100): Promise<FeedbackResponse[]> => {
    const response = await fetch(
      `${AI_BACKEND_URL}/feedbacks/me?skip=${skip}&limit=${limit}`,
      {
        method: "GET",
        headers: getAuthHeaders(false),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to fetch feedbacks");
    }

    return response.json();
  },

  // Admin only
  listAll: async (
    skip = 0,
    limit = 100,
    feedbackType?: FeedbackType,
  ): Promise<FeedbackResponse[]> => {
    let url = `${AI_BACKEND_URL}/admin/feedbacks?skip=${skip}&limit=${limit}`;
    if (feedbackType) {
      url += `&feedback_type=${feedbackType}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(false),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to fetch all feedbacks");
    }

    return response.json();
  },

  getStats: async (): Promise<FeedbackStatsResponse> => {
    const response = await fetch(`${AI_BACKEND_URL}/admin/feedbacks/stats`, {
      method: "GET",
      headers: getAuthHeaders(false),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to fetch feedback stats");
    }

    return response.json();
  },
};
