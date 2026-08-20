"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listUsersAdmin, type AdminUserSummary } from "../actions/users";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  function load(q?: string) {
    setLoading(true);
    listUsersAdmin(q).then((result) => {
      setUsers(result);
      setLoading(false);
    });
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Utilisateurs</h1>
      <p className="mt-1 text-sm text-muted">
        {users.length} affiché{users.length > 1 ? "s" : ""} (50 max). Recherche par nom, e-mail ou nom
        d&rsquo;utilisateur.
      </p>

      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          load(query);
        }}
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un utilisateur..."
          className="flex-1 rounded-full border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          className="bg-gradient-accent rounded-full px-5 py-2.5 text-sm font-semibold text-white"
        >
          Chercher
        </button>
      </form>

      <div className="mt-4 flex flex-col gap-2">
        {loading ? (
          <p className="text-sm text-muted">Chargement…</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-muted">Aucun utilisateur trouvé.</p>
        ) : (
          users.map((user) => (
            <Link
              key={user.id}
              href={`/admin/users/${user.id}`}
              className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-accent/40"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={user.imageUrl} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{user.displayName}</p>
                <p className="truncate text-xs text-muted">{user.email ?? "Pas d'e-mail"}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                  user.plan === "premium" ? "bg-accent-soft text-accent-strong" : "bg-surface-muted text-muted"
                }`}
              >
                {user.plan === "premium" ? "Premium" : "Gratuit"}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
