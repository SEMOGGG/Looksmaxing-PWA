import type { LeaderboardBadge, LeaderboardEntry } from "@/lib/community";
import { CrownIcon } from "@/components/icons";

// Étiquette de réputation affichée à côté d'un pseudo (publication ou
// commentaire) : dorée avec couronne pour les Chad classés, discrète pour
// les autres paliers. Rien n'est affiché pour "Débutant" (palier de départ,
// pas encore un vrai signal).
export function ReputationBadge({ badge }: { badge: LeaderboardBadge }) {
  if (badge.kind === "chad") {
    return (
      <span className="bg-gradient-accent flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white">
        <CrownIcon className="h-2.5 w-2.5" />
        CHAD #{badge.rank}
      </span>
    );
  }

  if (badge.tier.id === "debutant") return null;

  return (
    <span className="rounded-full bg-surface-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted">
      {badge.tier.label}
    </span>
  );
}

// Carte spotlight pour le Chad n°1 du classement : nettement plus visible
// que les autres lignes, pour que la place de tête se remarque vraiment.
export function ChadSpotlight({ entry }: { entry: LeaderboardEntry }) {
  return (
    <div className="bg-gradient-accent flex flex-col items-center gap-1.5 rounded-2xl p-6 text-center text-white shadow-lg">
      <CrownIcon className="h-8 w-8" />
      <p className="text-xs font-semibold tracking-wide text-white/80 uppercase">Chad n°1</p>
      <p className="font-heading text-2xl font-bold">{entry.displayName}</p>
      <p className="text-sm text-white/90">{entry.points} points de réputation</p>
    </div>
  );
}

// Ligne de classement standard (Chads #2-5 en surbrillance, reste du
// classement en discret).
export function LeaderboardRow({ entry, highlight = false }: { entry: LeaderboardEntry; highlight?: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border p-4 transition-colors ${
        highlight ? "border-accent/50 bg-accent-soft/40" : "border-border bg-surface hover:border-accent/30"
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
          highlight ? "bg-gradient-accent text-white" : "bg-surface-muted text-muted"
        }`}
      >
        {entry.rank}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-semibold text-foreground">{entry.displayName}</p>
          <ReputationBadge badge={entry.badge} />
        </div>
      </div>
      <p className="font-heading shrink-0 text-base font-semibold text-accent-strong">{entry.points} pts</p>
    </div>
  );
}
