"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  listReputationTiersAdmin,
  createReputationTier,
  updateReputationTier,
  deleteReputationTier,
  getSettingsAdmin,
  updateSettingAdmin,
  listPointAdjustmentsAdmin,
  addPointAdjustmentAdmin,
  type AdminReputationTier,
  type AdminPointAdjustment,
} from "../actions/badges";
import type { CommunitySettings } from "@/lib/community-data.server";
import { formatRelativeTime } from "@/lib/format-time";

function TiersSection() {
  const [tiers, setTiers] = useState<AdminReputationTier[]>([]);
  const [newTier, setNewTier] = useState({ id: "", label: "", minPoints: 0 });
  const [error, setError] = useState<string | null>(null);

  function load() {
    listReputationTiersAdmin().then(setTiers);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleUpdate(id: string, label: string, minPoints: number) {
    await updateReputationTier(id, { label, minPoints });
    load();
  }

  async function handleCreate() {
    setError(null);
    const result = await createReputationTier(newTier);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setNewTier({ id: "", label: "", minPoints: 0 });
    load();
  }

  async function handleDelete(id: string) {
    await deleteReputationTier(id);
    load();
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <h2 className="text-base font-semibold text-foreground">Paliers de réputation</h2>
      <p className="mt-1 text-xs text-muted">
        Badge affiché sur les publications selon les points. Chad n&rsquo;est pas un palier : voir les
        réglages ci-dessous.
      </p>

      <div className="mt-3 flex flex-col gap-2">
        {tiers.map((tier) => (
          <div key={tier.id} className="flex items-center gap-2 rounded-xl border border-border bg-surface-muted p-2.5">
            <span className="w-20 shrink-0 text-xs text-muted">{tier.id}</span>
            <input
              type="text"
              defaultValue={tier.label}
              onBlur={(e) => handleUpdate(tier.id, e.target.value, tier.minPoints)}
              className="w-32 rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-foreground focus:border-accent focus:outline-none"
            />
            <input
              type="number"
              defaultValue={tier.minPoints}
              onBlur={(e) => handleUpdate(tier.id, tier.label, Number(e.target.value) || 0)}
              className="w-24 rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-foreground focus:border-accent focus:outline-none"
            />
            <span className="text-xs text-muted">points min.</span>
            <button
              type="button"
              onClick={() => handleDelete(tier.id)}
              className="ml-auto text-xs text-muted hover:text-danger"
            >
              Supprimer
            </button>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-border p-2.5">
        <input
          type="text"
          placeholder="identifiant (ex. gtn)"
          value={newTier.id}
          onChange={(e) => setNewTier((t) => ({ ...t, id: e.target.value }))}
          className="w-32 rounded-lg border border-border bg-surface-muted px-2 py-1.5 text-sm text-foreground focus:border-accent focus:outline-none"
        />
        <input
          type="text"
          placeholder="Libellé (ex. GTN)"
          value={newTier.label}
          onChange={(e) => setNewTier((t) => ({ ...t, label: e.target.value }))}
          className="w-32 rounded-lg border border-border bg-surface-muted px-2 py-1.5 text-sm text-foreground focus:border-accent focus:outline-none"
        />
        <input
          type="number"
          placeholder="Points min."
          value={newTier.minPoints}
          onChange={(e) => setNewTier((t) => ({ ...t, minPoints: Number(e.target.value) || 0 }))}
          className="w-24 rounded-lg border border-border bg-surface-muted px-2 py-1.5 text-sm text-foreground focus:border-accent focus:outline-none"
        />
        <button
          type="button"
          onClick={handleCreate}
          disabled={!newTier.id.trim() || !newTier.label.trim()}
          className="bg-gradient-accent rounded-full px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
        >
          Ajouter
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
}

function SettingsSection() {
  const [settings, setSettings] = useState<CommunitySettings | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    getSettingsAdmin().then(setSettings);
  }, []);

  async function handleSave(key: "chad_slots" | "chad_min_points" | "media_unlock_threshold", value: number) {
    await updateSettingAdmin(key, value);
    setSaved(key);
    setTimeout(() => setSaved(null), 1500);
  }

  if (!settings) return null;

  const fields: { key: "chad_slots" | "chad_min_points" | "media_unlock_threshold"; label: string; value: number }[] = [
    { key: "chad_slots", label: "Nombre de places Chad", value: settings.chadSlots },
    { key: "chad_min_points", label: "Points minimum pour être Chad", value: settings.chadMinPoints },
    { key: "media_unlock_threshold", label: "Contributions pour débloquer photos/vidéos", value: settings.mediaUnlockThreshold },
  ];

  return (
    <div className="mt-4 rounded-2xl border border-border bg-surface p-5">
      <h2 className="text-base font-semibold text-foreground">Réglages</h2>
      <div className="mt-3 flex flex-col gap-3">
        {fields.map((field) => (
          <label key={field.key} className="flex items-center justify-between gap-3">
            <span className="text-sm text-foreground">{field.label}</span>
            <span className="flex items-center gap-2">
              <input
                type="number"
                defaultValue={field.value}
                onBlur={(e) => handleSave(field.key, Number(e.target.value) || 0)}
                className="w-24 rounded-lg border border-border bg-surface-muted px-2 py-1.5 text-sm text-foreground focus:border-accent focus:outline-none"
              />
              {saved === field.key && <span className="text-xs text-accent-strong">Enregistré ✓</span>}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

function PointsSection() {
  const searchParams = useSearchParams();
  const [userId, setUserId] = useState(searchParams.get("userId") ?? "");
  const [adjustments, setAdjustments] = useState<AdminPointAdjustment[]>([]);
  const [points, setPoints] = useState(0);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function load(id: string) {
    if (!id.trim()) {
      setAdjustments([]);
      return;
    }
    listPointAdjustmentsAdmin(id.trim()).then(setAdjustments);
  }

  useEffect(() => {
    if (userId) load(userId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAdd() {
    setError(null);
    setSaving(true);
    const result = await addPointAdjustmentAdmin({ userId: userId.trim(), points, reason });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setPoints(0);
    setReason("");
    load(userId);
  }

  return (
    <div className="mt-4 rounded-2xl border border-border bg-surface p-5">
      <h2 className="text-base font-semibold text-foreground">Ajustement manuel de points</h2>
      <p className="mt-1 text-xs text-muted">
        S&rsquo;ajoute aux points gagnés par likes/votes — bonus ou malus, avec raison conservée.
      </p>

      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="ID utilisateur Clerk (voir la fiche utilisateur)"
          className="flex-1 rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
        />
        <button
          type="button"
          onClick={() => load(userId)}
          className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:border-accent/40"
        >
          Charger
        </button>
      </div>

      {userId.trim() && (
        <>
          <div className="mt-3 flex flex-wrap items-end gap-2">
            <label className="text-xs text-muted">
              Points (+/-)
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value) || 0)}
                className="mt-1 block w-24 rounded-lg border border-border bg-surface-muted px-2 py-1.5 text-sm text-foreground focus:border-accent focus:outline-none"
              />
            </label>
            <label className="flex-1 text-xs text-muted">
              Raison
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="ex. Aide exceptionnelle en modération"
                className="mt-1 w-full rounded-lg border border-border bg-surface-muted px-2 py-1.5 text-sm text-foreground focus:border-accent focus:outline-none"
              />
            </label>
            <button
              type="button"
              disabled={saving || points === 0 || reason.trim().length < 3}
              onClick={handleAdd}
              className="bg-gradient-accent rounded-full px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
            >
              Ajouter
            </button>
          </div>
          {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}

          <div className="mt-3 flex flex-col gap-1.5">
            {adjustments.length === 0 ? (
              <p className="text-xs text-muted">Aucun ajustement pour cet utilisateur.</p>
            ) : (
              adjustments.map((adj) => (
                <div key={adj.id} className="flex items-center justify-between rounded-lg bg-surface-muted px-3 py-2 text-xs">
                  <span className="text-foreground">{adj.reason}</span>
                  <span className={adj.points > 0 ? "text-success" : "text-danger"}>
                    {adj.points > 0 ? "+" : ""}
                    {adj.points} · {formatRelativeTime(adj.createdAt)}
                  </span>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminBadgesPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Badges & points</h1>
      <p className="mt-1 text-sm text-muted">
        Le système de réputation qui pilote les badges Débutant/LTN/MTN/HTN/Chad.
      </p>

      <div className="mt-4 flex flex-col gap-4">
        <TiersSection />
        <SettingsSection />
        <Suspense fallback={null}>
          <PointsSection />
        </Suspense>
      </div>
    </div>
  );
}
