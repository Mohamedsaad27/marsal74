import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Send, Paperclip, Phone } from "lucide-react";

export const Route = createFileRoute("/_authenticated/chat")({
  component: ChatPage,
});

const contacts = [
  { name: "خالد العتيبي", last: "تم تسليم الشحنة الآن", time: "10:24", unread: 2, online: true },
  { name: "محمد الزهراني", last: "في الطريق إلى العميل", time: "09:48", unread: 0, online: true },
  { name: "فريق الدعم — أرامكس", last: "سنتابع التسوية اليوم", time: "أمس", unread: 0, online: false },
  { name: "سعد القحطاني", last: "العميل لم يرد، ماذا أفعل؟", time: "أمس", unread: 1, online: false },
  { name: "ناصر الدوسري", last: "تم استلام الشحنة من المستودع", time: "السبت", unread: 0, online: true },
];

const messages = [
  { from: "them", text: "السلام عليكم، وصلت إلى موقع العميل", time: "10:18" },
  { from: "me", text: "وعليكم السلام، تمام. هل تواصلت معه؟", time: "10:19" },
  { from: "them", text: "نعم، نازل الآن لاستلام الشحنة", time: "10:21" },
  { from: "them", text: "تم التسليم بنجاح ✅", time: "10:24" },
];

function ChatPage() {
  const [active, setActive] = useState(0);
  return (
    <AppShell>
      <div className="grid h-[calc(100vh-9rem)] grid-cols-1 gap-4 lg:grid-cols-[340px_1fr]">
        {/* Contacts */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <div className="border-b border-border p-4">
            <h2 className="text-lg font-extrabold">المحادثات</h2>
            <div className="relative mt-3">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="ابحث..." className="h-10 rounded-xl pr-10" />
            </div>
          </div>
          <ul className="flex-1 overflow-y-auto p-2">
            {contacts.map((c, i) => (
              <li key={c.name}>
                <button
                  onClick={() => setActive(i)}
                  className={`flex w-full items-start gap-3 rounded-xl p-3 text-right transition-colors ${
                    active === i ? "bg-accent" : "hover:bg-muted/50"
                  }`}
                >
                  <div className="relative">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl gradient-brand text-sm font-bold text-white">
                      {c.name.charAt(0)}
                    </div>
                    {c.online && <span className="absolute -bottom-0.5 -left-0.5 h-3 w-3 rounded-full bg-success ring-2 ring-card" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-bold">{c.name}</p>
                      <span className="text-[11px] text-muted-foreground">{c.time}</span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{c.last}</p>
                  </div>
                  {c.unread > 0 && (
                    <span className="mt-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">
                      {c.unread}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Chat thread */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <div className="flex items-center justify-between border-b border-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl gradient-brand text-sm font-bold text-white">
                {contacts[active].name.charAt(0)}
              </div>
              <div>
                <p className="font-bold">{contacts[active].name}</p>
                <p className="text-xs text-success">متصل الآن</p>
              </div>
            </div>
            <Button variant="outline" size="icon" className="rounded-xl"><Phone className="h-4 w-4" /></Button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-muted/30 p-5">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === "me" ? "justify-start" : "justify-end"}`}>
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-soft ${
                    m.from === "me"
                      ? "rounded-bl-sm gradient-brand text-primary-foreground"
                      : "rounded-br-sm bg-card text-foreground"
                  }`}
                >
                  <p>{m.text}</p>
                  <p className={`mt-1 text-[10px] ${m.from === "me" ? "text-white/70" : "text-muted-foreground"}`}>{m.time}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 border-t border-border p-3">
            <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground"><Paperclip className="h-5 w-5" /></Button>
            <Input placeholder="اكتب رسالة..." className="h-11 flex-1 rounded-xl bg-muted/50" />
            <Button className="h-11 rounded-xl gradient-brand px-5 shadow-glow">
              <Send className="h-4 w-4" /> إرسال
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
