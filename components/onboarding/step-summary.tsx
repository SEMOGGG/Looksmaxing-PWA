import { CheckIcon } from "@/components/icons";
import {
  activityLevels,
  goalOptions,
  sexOptions,
  type OnboardingData,
} from "@/lib/onboarding";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-3 last:border-b-0">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

export function StepSummary({ data }: { data: OnboardingData }) {
  const sexLabel = sexOptions.find((o) => o.value === data.sex)?.label ?? "—";
  const activityLabel =
    activityLevels.find((a) => a.value === data.activityLevel)?.label ?? "—";
  const goalLabels = data.goals.map(
    (g) => goalOptions.find((o) => o.value === g)?.label ?? g
  );

  return (
    <div>
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-accent-strong">
        <CheckIcon className="h-5 w-5" />
      </div>
      <h1 className="font-heading mt-4 text-2xl font-semibold text-foreground">
        Tout est prêt
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Vérifiez vos informations avant de découvrir votre premier bilan.
      </p>

      <div className="mt-6 flex items-center gap-4 rounded-2xl border border-border bg-surface p-4">
        {data.photoDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.photoDataUrl}
            alt="Votre photo"
            className="h-16 w-16 rounded-xl object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-xs text-muted">
            Pas de photo
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">
            {data.age ? `${data.age} ans` : "Âge non renseigné"} · {sexLabel}
          </p>
          <p className="text-sm text-muted">
            {data.heightCm || "—"} cm · {data.weightKg || "—"} kg
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-surface p-4">
        <Row label="Niveau d'activité" value={activityLabel} />
        <Row label="Pas quotidiens" value={data.steps || "Non renseigné"} />
        <Row
          label="Objectifs"
          value={goalLabels.length ? goalLabels.join(", ") : "Aucun sélectionné"}
        />
      </div>
    </div>
  );
}
