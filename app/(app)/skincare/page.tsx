import { AppTopBar } from "@/components/app-top-bar";
import { HealthDisclaimer } from "@/components/health-disclaimer";

const morningRoutine = [
  {
    title: "Nettoyant doux",
    why: "Élimine l'excès de sébum accumulé pendant la nuit sans agresser la peau.",
  },
  {
    title: "Sérum vitamine C",
    why: "Protège des agressions extérieures et aide à unifier le teint sur la durée.",
  },
  {
    title: "Hydratant léger",
    why: "Maintient la barrière cutanée et évite les tiraillements dans la journée.",
  },
  {
    title: "Protection solaire SPF 30+",
    why: "Prévient le vieillissement prématuré et les taches, même par temps couvert.",
  },
];

const eveningRoutine = [
  {
    title: "Démaquillant / nettoyant",
    why: "Retire les impuretés, le sébum et les résidus de crème solaire de la journée.",
  },
  {
    title: "Actif ciblé (rétinol ou AHA/BHA, en alternance)",
    why: "Stimule le renouvellement cellulaire ; à introduire progressivement, une à deux fois par semaine au début.",
  },
  {
    title: "Crème de nuit",
    why: "Nourrit et répare la peau pendant le sommeil, quand elle se régénère le plus.",
  },
];

function RoutineList({
  title,
  steps,
}: {
  title: string;
  steps: { title: string; why: string }[];
}) {
  return (
    <div>
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <ol className="mt-3 flex flex-col gap-3">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className="flex gap-4 rounded-2xl border border-border bg-surface p-4"
          >
            <span className="font-heading shrink-0 text-xl font-semibold text-accent-strong">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">{step.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{step.why}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function SkincarePage() {
  return (
    <>
      <AppTopBar title="Routine skincare" idPrefix="skincare-logo" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-6">
        <HealthDisclaimer />

        <div className="mt-6 flex flex-col gap-8">
          <RoutineList title="Routine du matin" steps={morningRoutine} />
          <RoutineList title="Routine du soir" steps={eveningRoutine} />
        </div>

        <p className="mt-8 text-xs leading-relaxed text-muted">
          Introduisez un nouveau produit à la fois et laissez quelques jours à
          votre peau pour s&rsquo;y habituer. En cas de réaction (rougeur,
          irritation), arrêtez et demandez conseil à un dermatologue.
        </p>
      </main>
    </>
  );
}
