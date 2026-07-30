"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AppTopBar } from "@/components/app-top-bar";
import { HealthDisclaimer } from "@/components/health-disclaimer";
import { LockIcon } from "@/components/icons";
import { getUserData } from "@/app/actions/user-data";
import { getCoachHistory, sendCoachMessage } from "@/app/actions/coach";
import type { CoachMessage } from "@/lib/coach";

const WELCOME: CoachMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Bonjour, je suis votre coach Faciem. Posez-moi vos questions sur votre routine, votre nutrition, votre cardio, vos cheveux ou votre barbe — je suis là au quotidien pour vous accompagner.",
  createdAt: new Date(0).toISOString(),
};

export default function CoachPage() {
  const [isPremium, setIsPremium] = useState(false);
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([getUserData(), getCoachHistory()])
      .then(([userData, history]) => {
        setIsPremium(userData.plan === "premium");
        setMessages(history);
      })
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  async function handleSend() {
    const content = draft.trim();
    if (!content || sending) return;

    setSending(true);
    setError(null);
    setMessages((prev) => [
      ...prev,
      { id: `pending-${Date.now()}`, role: "user", content, createdAt: new Date().toISOString() },
    ]);
    setDraft("");

    const result = await sendCoachMessage(content);
    setSending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMessages(result.messages);
  }

  if (!ready) return null;

  const displayMessages = messages.length > 0 ? messages : [WELCOME];

  return (
    <>
      <AppTopBar title="Coach IA" idPrefix="coach-logo" />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 py-6">
        <HealthDisclaimer />

        {!isPremium ? (
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-dashed border-border bg-surface p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-muted text-muted">
              <LockIcon className="h-5 w-5" />
            </div>
            <p className="text-sm text-muted">
              Le Coach IA est réservé aux membres{" "}
              <span className="font-medium text-foreground">Premium</span>.{" "}
              <Link
                href="/compte"
                className="font-medium text-accent-strong underline underline-offset-2"
              >
                Débloquer
              </Link>
            </p>
          </div>
        ) : (
          <>
            <div className="mt-4 flex flex-1 flex-col gap-3 overflow-y-auto pb-4">
              {displayMessages.map((message) => (
                <div
                  key={message.id}
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    message.role === "user"
                      ? "bg-gradient-accent ml-auto text-white"
                      : "mr-auto border border-border bg-surface text-foreground"
                  }`}
                >
                  {message.content}
                </div>
              ))}
              {sending && (
                <div className="mr-auto flex items-center gap-1.5 rounded-2xl border border-border bg-surface px-4 py-3">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted" />
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {error && (
              <p className="mb-2 rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
                {error}
              </p>
            )}

            <div className="sticky bottom-0 flex gap-2 border-t border-border bg-background/95 py-3 backdrop-blur">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Posez votre question…"
                className="flex-1 rounded-full border border-border bg-surface-muted px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!draft.trim() || sending}
                className="bg-gradient-accent rounded-full px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Envoyer
              </button>
            </div>
          </>
        )}
      </main>
    </>
  );
}
