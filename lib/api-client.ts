// API Client for be-pro backend services

const UPLOAD_SERVICE_URL =
  process.env.NEXT_PUBLIC_UPLOAD_SERVICE_URL || "http://localhost:8000";
const QUERY_SERVICE_URL =
  process.env.NEXT_PUBLIC_QUERY_SERVICE_URL || "http://localhost:8001";
const AI_BACKEND_URL =
  process.env.NEXT_PUBLIC_AI_BACKEND_URL || "http://localhost:8002";

// Types for API requests and responses
export interface RegisterRequest {
  username: string;
  phone: string;
  password: string;
}

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface UserResponse {
  id: number;
  username: string;
  phone: string;
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

// Auth API
export const authApi = {
  register: async (
    data: RegisterRequest,
  ): Promise<UserResponse | { error: string }> => {
    const response = await fetch(`${UPLOAD_SERVICE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  login: async (
    data: LoginRequest,
  ): Promise<UserResponse | { error: string }> => {
    const response = await fetch(`${UPLOAD_SERVICE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};

// Document API
export const documentApi = {
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
};
