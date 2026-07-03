import { apiFetch } from "./users.api";

// ─── Types ────────────────────────────────────────────────────────────────

export interface ChatOrderSummary {
  id: string;
  reference_code: string;
  reference_no: string;
  status: number;
  company_name: string;
  agent_name: string;
}

export interface ChatConversationType {
  code: number;
  label: string;
}

export interface ChatParticipant {
  user_id: string;
  name: string;
  last_read_at: string | null;
}

export interface ChatConversation {
  id: string;
  order_id: string;
  order: ChatOrderSummary;
  type: ChatConversationType;
  participants: ChatParticipant[];
  messages_count?: number;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessageSender {
  id: string;
  name: string;
}

export interface ChatMessageType {
  code: number;
  label: string;
}

interface PaginatedData<T> {
  items: T[];
  type: string;
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
  has_more: boolean;
}

export interface ConversationsListResponse {
  isSuccess: boolean;
  message: string;
  data: PaginatedData<ChatConversation>;
}

export interface ConversationResponse {
  isSuccess: boolean;
  message: string;
  data: ChatConversation;
}

export interface MessagesListResponse {
  isSuccess: boolean;
  message: string;
  data: PaginatedData<ChatMessage>;
}

// ─── API ──────────────────────────────────────────────────────────────────

export const adminChatApi = {
  /**
   * List conversations (server-side pagination + optional search).
   */
  listConversations(
    params: { page?: number; per_page?: number; search?: string } = {},
  ): Promise<ConversationsListResponse> {
    const { page = 1, per_page = 15, search = "" } = params;
    const qs = new URLSearchParams({
      page: String(page),
      per_page: String(per_page),
    });
    if (search) qs.set("search", search);
    return apiFetch<ConversationsListResponse>(`/admin/chat/conversations?${qs}`);
  },

  /**
   * Get a single conversation by its own id.
   */
  getConversation(conversationId: string): Promise<ConversationResponse> {
    return apiFetch<ConversationResponse>(`/admin/chat/conversations/${conversationId}`);
  },

  /**
   * Get a conversation by the related order id.
   */
  getConversationByOrder(orderId: string): Promise<ConversationResponse> {
    return apiFetch<ConversationResponse>(`/admin/chat/orders/${orderId}`);
  },

  /**
   * List messages for a conversation (server-side pagination).
   */
  listMessages(
    conversationId: string,
    params: { page?: number; per_page?: number } = {},
  ): Promise<MessagesListResponse> {
    const { page = 1, per_page = 30 } = params;
    const qs = new URLSearchParams({
      page: String(page),
      per_page: String(per_page),
    });
    return apiFetch<MessagesListResponse>(
      `/admin/chat/conversations/${conversationId}/messages?${qs}`,
    );
  },
};
export interface ChatMessageAttachment {
  media_file_id: string;
  collection: string;
  disk: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  original_name: string;
  url: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender: ChatMessageSender;
  body: string | null;
  type: ChatMessageType;
  attachment?: ChatMessageAttachment;
  created_at: string;
}
