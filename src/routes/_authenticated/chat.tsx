import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/input";
import { adminChatApi, ChatConversation, ChatMessage } from "@/lib/admin/admin-chat.api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Search, Eye, Loader2, CircleDot, Image as ImageIcon, X } from "lucide-react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
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
/** Assigns each of the two participants a consistent side + color for the whole thread. */
function getSenderSide(conversation: ChatConversation, senderId: string): "a" | "b" {
  const index = conversation.participants.findIndex((p) => p.user_id === senderId);
  // Unknown sender (e.g. a system message) falls back to side "b".
  return index === 0 ? "a" : "b";
}
/** The "other side" of the conversation, from the admin's point of view. */
/** The "other side" of the conversation, from the admin's point of view. */
function getConversationTitle(
  conversation: ChatConversation,
  currentUserId: string | null,
): string {
  const other = conversation.participants.find((p) => p.user_id !== currentUserId);
  return (
    other?.name ??
    conversation.order?.company_name ??
    conversation.order?.agent_name ??
    "محادثة محذوفة الطلب"
  );
}
const MESSAGE_TYPE = {
  TEXT: 1,
  IMAGE: 2,
  VOICE: 3,
} as const;

function MessageContent({ message }: { message: ChatMessage }) {
  const { type, attachment, body } = message;

  if (type.code === MESSAGE_TYPE.IMAGE && attachment) {
    return <MessageImage attachment={attachment} />;
  }

  if (type.code === MESSAGE_TYPE.VOICE && attachment) {
    return (
      <audio controls preload="none" className="h-9 w-56 max-w-full">
        <source src={attachment.url} type={attachment.mime_type} />
        متصفحك لا يدعم تشغيل الرسائل الصوتية
      </audio>
    );
  }

  return <p>{body}</p>;
}

function MessageImage({ attachment }: { attachment: NonNullable<ChatMessage["attachment"]> }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="block">
        <img
          src={attachment.url}
          alt={attachment.original_name}
          className="max-h-56 w-full rounded-lg object-cover"
          loading="lazy"
        />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute top-4 left-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={attachment.url}
            alt={attachment.original_name}
            className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
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

  const messagesQuery = useInfiniteQuery({
    queryKey: ["admin-chat-messages", activeId],
    queryFn: ({ pageParam = 1 }) =>
      adminChatApi.listMessages(activeId as string, { page: pageParam, per_page: 30 }),
    getNextPageParam: (lastPage) =>
      lastPage.data.current_page < lastPage.data.last_page
        ? lastPage.data.current_page + 1
        : undefined,
    initialPageParam: 1,
    enabled: hydrated && !!activeId,
    refetchInterval: 5000,
  });

  const messages: ChatMessage[] = useMemo(() => {
    const items = messagesQuery.data?.pages.flatMap((p) => p.data.items) ?? [];
    return [...items].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
  }, [messagesQuery.data]);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const prevScrollHeightRef = useRef<number>(0);
  const latestMessageIdRef = useRef<string | null>(null);

  // Jump to the latest message when opening/switching a conversation,
  // or when a brand-new message arrives at the bottom (not when older ones load).
  useEffect(() => {
    const newestId = messages[messages.length - 1]?.id ?? null;
    const isNewIncoming = newestId !== null && newestId !== latestMessageIdRef.current;
    latestMessageIdRef.current = newestId;

    if (isNewIncoming) {
      messagesEndRef.current?.scrollIntoView({ block: "end" });
    }
  }, [activeId, messages]);

  // Preserve scroll position after older messages are prepended.
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el || messagesQuery.isFetchingNextPage) return;
    if (prevScrollHeightRef.current) {
      el.scrollTop += el.scrollHeight - prevScrollHeightRef.current;
      prevScrollHeightRef.current = 0;
    }
  }, [messages, messagesQuery.isFetchingNextPage]);

  function handleThreadScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    if (el.scrollTop < 80 && messagesQuery.hasNextPage && !messagesQuery.isFetchingNextPage) {
      prevScrollHeightRef.current = el.scrollHeight;
      messagesQuery.fetchNextPage();
    }
  }
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
                          {c.order?.reference_code} · {c.type.label}
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
                      {activeConversation.order
                        ? `${activeConversation.order.reference_code} — ${activeConversation.order.company_name}`
                        : "تم حذف الطلب المرتبط بهذه المحادثة"}
                    </p>
                  </div>
                </div>
              </div>

              <div
                ref={scrollContainerRef}
                onScroll={handleThreadScroll}
                className="flex-1 space-y-3 overflow-y-auto bg-muted/30 p-5"
              >
                {messagesQuery.isFetchingNextPage && (
                  <div className="flex justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}{" "}
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
                  activeConversation &&
                  messages.map((m) => {
                    const side = getSenderSide(activeConversation, m.sender.id);
                    const isA = side === "a";
                    return (
                      <div key={m.id} className={`flex ${isA ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-soft ${
                            isA ? "bg-blue-950 text-slate-300" : "bg-slate-200 text-slate-500"
                          }`}
                        >
                          <p
                            className={`mb-0.5 text-[11px] font-bold ${isA ? "text-white/80" : "text-gray/80"}`}
                          >
                            {m.sender.name}
                          </p>
                          <MessageContent message={m} />
                          <p
                            className={`mt-1 text-[10px] ${isA ? "text-white/80" : "text-slate-500"}`}
                          >
                            {formatMessageTime(m.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                <div ref={messagesEndRef} />
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
