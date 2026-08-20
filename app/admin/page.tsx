"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDashboardStats, type AdminDashboardStats } from "./actions/dashboard";
import { UsersIcon, MessageIcon, FlagIcon, TrophyIcon, HeartIcon, PillIcon } from "@/components/icons";

const sections = [
  { href: "/admin/users", label: "Utilisateurs", description: "Rechercher, voir les profils, changer de plan" },
  { href: "/admin/articles", label: "Articles", description: "Contenu éditorial de l'onglet Communauté" },
  { href: "/admin/routine", label: "Bibliothèque skincare", description: "Ingrédients/produits affichés sur /skincare" },
  { href: "/admin/community", label: "Communauté", description: "Modération des publications, commentaires, signalements" },
  { href: "/admin/badges", label: "Badges & points", description: "Paliers de réputation, réglages, ajustements manuels" },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getDashboardStats().then((s) => {
      setStats(s);
      setReady(true);
    });
  }, []);

  if (!ready) return null;

  const cards = stats
    ? [
        { icon: UsersIcon, label: "Utilisateurs", value: stats.totalUsers },
        { icon: TrophyIcon, label: "Membres Premium", value: stats.premiumUsers },
        { icon: MessageIcon, label: "Publications", value: stats.totalPosts },
        { icon: HeartIcon, label: "Commentaires", value: stats.totalComments },
        { icon: FlagIcon, label: "Signalements en attente", value: stats.pendingReports },
        { icon: PillIcon, label: "Produits skincare", value: stats.totalIngredients },
      ]
    : [];

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Tableau de bord</h1>
      <p className="mt-1 text-sm text-muted">Vue d&rsquo;ensemble de Faciem, gérable sans toucher au code.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-border bg-surface p-4">
            <card.icon className="h-4 w-4 text-accent-strong" />
            <p className="font-heading mt-2 text-2xl font-semibold text-foreground">{card.value}</p>
            <p className="text-xs text-muted">{card.label}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-8 text-sm font-semibold tracking-wide text-muted uppercase">Sections</h2>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-accent/40"
          >
            <p className="text-base font-semibold text-foreground">{section.label}</p>
            <p className="mt-1 text-sm text-muted">{section.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
