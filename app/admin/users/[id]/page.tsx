"use client";

import { useEffect, useState, use as usePromise } from "react";
import Link from "next/link";
import {
  getUserDetailAdmin,
  updateUserPlanAdmin,
  updateUserProfileAdmin,
  type AdminUserDetail,
} from "../../actions/users";
import { sexOptions, activityLevels, goalOptions, type Goal, type OnboardingData } from "@/lib/onboarding";
import type { Plan } from "@/lib/user-data";

const emptyProfile: OnboardingData = {
  consentGiven: true,
  photoDataUrl: null,
  photoProfileDataUrl: null,
  photoBodyDataUrl: null,
  age: "",
  sex: null,
  heightCm: "",
  weightKg: "",
  activityLevel: null,
  steps: "",
  goals: [],
};

export default function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params);
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [form, setForm] = useState<OnboardingData>(emptyProfile);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    getUserDetailAdmin(id).then((data) => {
      setDetail(data);
      if (data?.profile) setForm(data.profile);
      setReady(true);
    });
  }, [id]);

  async function handlePlanChange(plan: Plan) {
    if (!detail) return;
    setSaving(true);
    const result = await updateUserPlanAdmin(detail.id, plan);
    setSaving(false);
    if (result.ok) setDetail({ ...detail, plan });
  }

  async function handleSaveProfile() {
    setSaving(true);
    setMessage(null);
    const result = await updateUserProfileAdmin(id, form);
    setSaving(false);
    setMessage(result.ok ? "Profil enregistré." : result.error);
  }

  function toggleGoal(goal: Goal) {
    setForm((f) => ({
      ...f,
      goals: f.goals.includes(goal) ? f.goals.filter((g) => g !== goal) : [...f.goals, goal],
    }));
  }

  if (!ready) return null;
  if (!detail) {
    return (
      <div>
        <Link href="/admin/users" className="text-sm text-accent-strong underline underline-offset-2">
          ← Retour
        </Link>
        <p className="mt-4 text-sm text-muted">Utilisateur introuvable.</p>
      </div>
    );
  }

  return (
    <div>
      <Link href="/admin/users" className="text-sm text-accent-strong underline underline-offset-2">
        ← Retour aux utilisateurs
      </Link>

      <div className="mt-4 flex items-center gap-4 rounded-2xl border border-border bg-surface p-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={detail.imageUrl} alt="" className="h-14 w-14 shrink-0 rounded-full object-cover" />
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-foreground">{detail.displayName}</p>
          <p className="text-sm text-muted">{detail.email ?? "Pas d'e-mail"}</p>
          <p className="mt-1 text-xs text-muted">
            Membre depuis le {new Date(detail.createdAt).toLocaleDateString("fr-FR")}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-xs text-muted">Contributions</p>
          <p className="font-heading mt-1 text-xl font-semibold text-foreground">{detail.contributionCount}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-xs text-muted">Points de réputation</p>
          <p className="font-heading mt-1 text-xl font-semibold text-foreground">{detail.points}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-xs text-muted">Badge</p>
          <p className="font-heading mt-1 text-xl font-semibold text-foreground">{detail.reputationLabel}</p>
        </div>
        <Link
          href={`/admin/badges?userId=${detail.id}`}
          className="flex flex-col justify-center rounded-2xl border border-dashed border-accent/40 bg-accent-soft/30 p-4 text-xs font-medium text-accent-strong transition-colors hover:bg-accent-soft/50"
        >
          Ajuster ses points →
        </Link>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-base font-semibold text-foreground">Abonnement</h2>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={() => handlePlanChange("free")}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              detail.plan === "free"
                ? "border-accent bg-accent-soft text-accent-strong"
                : "border-border text-muted hover:border-accent/40"
            }`}
          >
            Gratuit
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => handlePlanChange("premium")}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              detail.plan === "premium"
                ? "border-accent bg-accent-soft text-accent-strong"
                : "border-border text-muted hover:border-accent/40"
            }`}
          >
            Premium
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-base font-semibold text-foreground">Profil (onboarding)</h2>
        {!detail.profile && (
          <p className="mt-1 text-xs text-muted">
            Cet utilisateur n&rsquo;a pas encore complété l&rsquo;onboarding — vous pouvez tout de même créer
            son profil ici.
          </p>
        )}

        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <label className="text-xs text-muted">
            Âge
            <input
              type="text"
              value={form.age}
              onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
            />
          </label>
          <label className="text-xs text-muted">
            Taille (cm)
            <input
              type="text"
              value={form.heightCm}
              onChange={(e) => setForm((f) => ({ ...f, heightCm: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
            />
          </label>
          <label className="text-xs text-muted">
            Poids (kg)
            <input
              type="text"
              value={form.weightKg}
              onChange={(e) => setForm((f) => ({ ...f, weightKg: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
            />
          </label>
          <label className="text-xs text-muted">
            Pas / jour
            <input
              type="text"
              value={form.steps}
              onChange={(e) => setForm((f) => ({ ...f, steps: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
            />
          </label>
        </div>

        <div className="mt-3">
          <p className="text-xs text-muted">Sexe</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {sexOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm((f) => ({ ...f, sex: opt.value }))}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  form.sex === opt.value
                    ? "border-accent bg-accent-soft text-accent-strong"
                    : "border-border text-muted hover:border-accent/40"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3">
          <p className="text-xs text-muted">Niveau d&rsquo;activité</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {activityLevels.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm((f) => ({ ...f, activityLevel: opt.value }))}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  form.activityLevel === opt.value
                    ? "border-accent bg-accent-soft text-accent-strong"
                    : "border-border text-muted hover:border-accent/40"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3">
          <p className="text-xs text-muted">Objectifs</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {goalOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleGoal(opt.value)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  form.goals.includes(opt.value)
                    ? "border-accent bg-accent-soft text-accent-strong"
                    : "border-border text-muted hover:border-accent/40"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {message && <p className="mt-3 text-xs text-accent-strong">{message}</p>}

        <button
          type="button"
          disabled={saving}
          onClick={handleSaveProfile}
          className="bg-gradient-accent mt-4 rounded-full px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Enregistrement…" : "Enregistrer le profil"}
        </button>
      </div>
    </div>
  );
}
