"use client";

import { useEffect, useState } from "react";
import {
  listPostsAdmin,
  listCommentsAdmin,
  listReportsAdmin,
  setPostModerationStatus,
  setCommentModerationStatus,
  deletePostAdmin,
  deleteCommentAdmin,
  resolveReportAdmin,
  type AdminPost,
  type AdminComment,
  type AdminReport,
} from "../actions/community";
import { formatRelativeTime } from "@/lib/format-time";

const statusLabels: Record<string, string> = {
  approved: "Approuvé",
  pending: "En attente",
  flagged: "Signalé",
  removed: "Retiré",
};

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "approved"
      ? "bg-accent-soft text-accent-strong"
      : status === "removed"
        ? "bg-danger/20 text-danger"
        : "bg-surface-muted text-muted";
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${color}`}>{statusLabels[status] ?? status}</span>;
}

export default function AdminCommunityPage() {
  const [tab, setTab] = useState<"posts" | "comments" | "reports">("reports");
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  function load() {
    listPostsAdmin().then(setPosts);
    listCommentsAdmin().then(setComments);
    listReportsAdmin().then(setReports);
  }

  useEffect(() => {
    load();
  }, []);

  async function handlePostStatus(id: string, status: string) {
    await setPostModerationStatus(id, status);
    load();
  }

  async function handleCommentStatus(id: string, status: string) {
    await setCommentModerationStatus(id, status);
    load();
  }

  async function handleDeletePost(id: string) {
    await deletePostAdmin(id);
    setConfirmingId(null);
    load();
  }

  async function handleDeleteComment(id: string) {
    await deleteCommentAdmin(id);
    setConfirmingId(null);
    load();
  }

  async function handleResolveReport(id: string) {
    await resolveReportAdmin(id);
    load();
  }

  const pendingReports = reports.filter((r) => !r.resolved);
  const resolvedReports = reports.filter((r) => r.resolved);

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Communauté</h1>
      <p className="mt-1 text-sm text-muted">Modération des publications, commentaires et signalements.</p>

      <div className="mt-4 flex gap-2 rounded-full border border-border bg-surface p-1 text-sm">
        {(["reports", "posts", "comments"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 rounded-full py-2 font-medium transition-colors ${
              tab === t ? "bg-gradient-accent text-white" : "text-muted"
            }`}
          >
            {t === "reports" ? `Signalements (${pendingReports.length})` : t === "posts" ? "Publications" : "Commentaires"}
          </button>
        ))}
      </div>

      {tab === "reports" && (
        <div className="mt-4 flex flex-col gap-2">
          {pendingReports.length === 0 && resolvedReports.length === 0 && (
            <p className="text-sm text-muted">Aucun signalement.</p>
          )}
          {pendingReports.map((report) => (
            <div key={report.id} className="rounded-2xl border border-danger/40 bg-surface p-4">
              <p className="text-xs text-muted">
                Signalé {formatRelativeTime(report.createdAt)} · publication de {report.postAuthor ?? "?"}
              </p>
              {report.postContent && (
                <p className="mt-1.5 text-sm text-foreground">{report.postContent}</p>
              )}
              {report.reason && <p className="mt-1 text-xs text-muted">Motif : {report.reason}</p>}
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleResolveReport(report.id)}
                  className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:border-accent/40"
                >
                  Marquer comme traité
                </button>
                {report.postId && (
                  <button
                    type="button"
                    onClick={() => handlePostStatus(report.postId as string, "removed")}
                    className="rounded-full bg-danger px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    Retirer la publication
                  </button>
                )}
              </div>
            </div>
          ))}
          {resolvedReports.length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-muted">
                {resolvedReports.length} signalement{resolvedReports.length > 1 ? "s" : ""} traité
                {resolvedReports.length > 1 ? "s" : ""}
              </summary>
              <div className="mt-2 flex flex-col gap-2">
                {resolvedReports.map((report) => (
                  <div key={report.id} className="rounded-2xl border border-border bg-surface p-4 opacity-60">
                    <p className="text-xs text-muted">
                      {formatRelativeTime(report.createdAt)} · {report.postAuthor ?? "?"}
                    </p>
                    {report.postContent && <p className="mt-1 text-sm text-foreground">{report.postContent}</p>}
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}

      {tab === "posts" && (
        <div className="mt-4 flex flex-col gap-2">
          {posts.map((post) => (
            <div key={post.id} className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground">{post.author}</p>
                <StatusBadge status={post.moderationStatus} />
                <span className="text-xs text-muted">· {formatRelativeTime(post.createdAt)}</span>
              </div>
              <p className="mt-1.5 text-sm text-foreground">{post.content}</p>
              {post.mediaUrl && <p className="mt-1 text-xs text-muted">Média : {post.mediaType}</p>}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {post.moderationStatus !== "approved" && (
                  <button
                    type="button"
                    onClick={() => handlePostStatus(post.id, "approved")}
                    className="rounded-full border border-border px-3 py-1 text-xs text-foreground hover:border-accent/40"
                  >
                    Approuver
                  </button>
                )}
                {post.moderationStatus !== "removed" && (
                  <button
                    type="button"
                    onClick={() => handlePostStatus(post.id, "removed")}
                    className="rounded-full border border-border px-3 py-1 text-xs text-foreground hover:border-accent/40"
                  >
                    Retirer
                  </button>
                )}
                {confirmingId === post.id ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleDeletePost(post.id)}
                      className="rounded-full bg-danger px-3 py-1 text-xs font-semibold text-white"
                    >
                      Confirmer suppression
                    </button>
                    <button type="button" onClick={() => setConfirmingId(null)} className="text-xs text-muted">
                      Non
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmingId(post.id)}
                    className="rounded-full border border-border px-3 py-1 text-xs text-muted hover:text-danger"
                  >
                    Supprimer définitivement
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "comments" && (
        <div className="mt-4 flex flex-col gap-2">
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground">{comment.author}</p>
                <StatusBadge status={comment.moderationStatus} />
                <span className="text-xs text-muted">· {formatRelativeTime(comment.createdAt)}</span>
              </div>
              <p className="mt-1.5 text-sm text-foreground">{comment.content}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {comment.moderationStatus !== "approved" && (
                  <button
                    type="button"
                    onClick={() => handleCommentStatus(comment.id, "approved")}
                    className="rounded-full border border-border px-3 py-1 text-xs text-foreground hover:border-accent/40"
                  >
                    Approuver
                  </button>
                )}
                {comment.moderationStatus !== "removed" && (
                  <button
                    type="button"
                    onClick={() => handleCommentStatus(comment.id, "removed")}
                    className="rounded-full border border-border px-3 py-1 text-xs text-foreground hover:border-accent/40"
                  >
                    Retirer
                  </button>
                )}
                {confirmingId === comment.id ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleDeleteComment(comment.id)}
                      className="rounded-full bg-danger px-3 py-1 text-xs font-semibold text-white"
                    >
                      Confirmer suppression
                    </button>
                    <button type="button" onClick={() => setConfirmingId(null)} className="text-xs text-muted">
                      Non
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmingId(comment.id)}
                    className="rounded-full border border-border px-3 py-1 text-xs text-muted hover:text-danger"
                  >
                    Supprimer définitivement
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
