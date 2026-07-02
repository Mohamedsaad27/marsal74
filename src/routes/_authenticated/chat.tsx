import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/input";
import { Search, Eye, Loader2 } from "lucide-react";
import { adminChatApi, ChatConversation, ChatMessage } from "@/lib/admin/admin-chat.api";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export const Route = createFileRoute("/_authenticated/chat")({
  component: ChatPage,
});

function formatSidebarTime(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) {
    return date.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "أمس";
  return date.toLocaleDateString("ar-EG", { day: "2-digit", month: "2-digit" });
}

function formatMessageTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
}

/** The "other side" of the conversation, from the admin's point of view. */
function getConversationTitle(
  conversation: ChatConversation,
  currentUserId: string | null,
): string {
  const other = conversation.participants.find((p) => p.user_id !== currentUserId);
  return other?.name ?? conversation.order.company_name ?? conversation.order.agent_name;
}

function ChatPage() {
  const { user: currentUser, hydrated } = useCurrentUser();
  const currentUserId = currentUser?.user_id ?? null;

  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const conversationsQuery = useQuery({
    queryKey: ["admin-chat-conversations", search],
    queryFn: () => adminChatApi.listConversations({ per_page: 20, search }),
    enabled: hydrated,
    refetchInterval: 15000,
  });

  const conversations = conversationsQuery.data?.data.items ?? [];

  // Default to the first conversation once loaded.
  useEffect(() => {
    if (!activeId && conversations.length > 0) {
      setActiveId(conversations[0].id);
    }
  }, [activeId, conversations]);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId],
  );

  const messagesQuery = useQuery({
    queryKey: ["admin-chat-messages", activeId],
    queryFn: () => adminChatApi.listMessages(activeId as string, { per_page: 50 }),
    enabled: hydrated && !!activeId,
    refetchInterval: 5000,
  });

  const messages: ChatMessage[] = messagesQuery.data?.data.items ?? [];

  if (!hydrated) {
    return (
      <AppShell>
        <div className="flex h-[calc(100vh-9rem)] items-center justify-center text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="grid h-[calc(100vh-9rem)] grid-cols-1 gap-4 lg:grid-cols-[340px_1fr]">
        {/* Conversations */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <div className="border-b border-border p-4">
            <h2 className="text-lg font-extrabold">المحادثات</h2>
            <div className="relative mt-3">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ابحث..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 rounded-xl pr-10"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {conversationsQuery.isLoading && (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            )}

            {conversationsQuery.isError && (
              <div className="p-4 text-center text-sm text-destructive">تعذّر تحميل المحادثات</div>
            )}

            {!conversationsQuery.isLoading && conversations.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">لا توجد محادثات</div>
            )}

            <ul>
              {conversations.map((c) => {
                const title = getConversationTitle(c, currentUserId);
                return (
                  <li key={c.id}>
                    <button
                      onClick={() => setActiveId(c.id)}
                      className={`flex w-full items-start gap-3 rounded-xl p-3 text-right transition-colors ${
                        activeId === c.id ? "bg-accent" : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl gradient-brand text-sm font-bold text-white">
                        {title.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-bold">{title}</p>
                          <span className="text-[11px] text-muted-foreground">
                            {formatSidebarTime(c.last_message_at)}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {c.order.reference_code} · {c.type.label}
                        </p>
                      </div>
                      {!!c.messages_count && (
                        <span className="mt-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">
                          {c.messages_count}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Thread */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          {activeConversation ? (
            <>
              <div className="flex items-center justify-between border-b border-border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl gradient-brand text-sm font-bold text-white">
                    {getConversationTitle(activeConversation, currentUserId).charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold">
                      {getConversationTitle(activeConversation, currentUserId)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activeConversation.order.reference_code} —{" "}
                      {activeConversation.order.company_name}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto bg-muted/30 p-5">
                {messagesQuery.isLoading && (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                )}

                {messagesQuery.isError && (
                  <div className="p-4 text-center text-sm text-destructive">
                    تعذّر تحميل الرسائل
                  </div>
                )}

                {!messagesQuery.isLoading &&
                  messages.map((m) => {
                    const isMe = m.sender.id === currentUserId;
                    return (
                      <div key={m.id} className={`flex ${isMe ? "justify-start" : "justify-end"}`}>
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-soft ${
                            isMe
                              ? "rounded-bl-sm gradient-brand text-primary-foreground"
                              : "rounded-br-sm bg-card text-foreground"
                          }`}
                        >
                          {!isMe && (
                            <p className="mb-0.5 text-[11px] font-bold opacity-70">
                              {m.sender.name}
                            </p>
                          )}
                          <p>{m.body}</p>
                          <p
                            className={`mt-1 text-[10px] ${
                              isMe ? "text-white/70" : "text-muted-foreground"
                            }`}
                          >
                            {formatMessageTime(m.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Admin is view-only — no composer */}
              <div className="flex items-center justify-center gap-2 border-t border-border p-3 text-xs text-muted-foreground">
                <Eye className="h-4 w-4" />
                أنت تشاهد هذه المحادثة فقط، ولا يمكنك إرسال رسائل
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              اختر محادثة لعرضها
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
