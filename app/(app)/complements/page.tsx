import { AppTopBar } from "@/components/app-top-bar";
import { HealthDisclaimer } from "@/components/health-disclaimer";
import { InfoIcon } from "@/components/icons";

const supplements = [
  {
    name: "Magnésium",
    description:
      "Contribue à la récupération musculaire et à un sommeil de meilleure qualité.",
  },
  {
    name: "Oméga-3",
    description:
      "Soutient la santé cardiovasculaire et peut favoriser l'éclat de la peau.",
  },
  {
    name: "Vitamine D",
    description:
      "Souvent insuffisante en hiver ou en cas de faible exposition au soleil ; utile à l'énergie et à l'immunité.",
  },
  {
    name: "Probiotiques",
    description:
      "Participent à l'équilibre de la flore intestinale, lié au confort digestif et parfois à la peau.",
  },
  {
    name: "Ashwagandha",
    description:
      "Plante adaptogène traditionnellement utilisée pour aider à mieux gérer le stress au quotidien.",
  },
  {
    name: "Zinc",
    description:
      "Intervient dans de nombreuses fonctions, dont la cicatrisation et la régulation hormonale.",
  },
  {
    name: "Créatine",
    description:
      "L'un des compléments les plus étudiés pour soutenir la force et la performance à l'entraînement.",
  },
  {
    name: "Collagène",
    description:
      "Souvent utilisé pour soutenir l'élasticité de la peau et le confort articulaire.",
  },
];

export default function ComplementsPage() {
  return (
    <>
      <AppTopBar title="Compléments" idPrefix="complements-logo" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-6">
        <HealthDisclaimer />

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {supplements.map((supplement) => (
            <div
              key={supplement.name}
              className="rounded-2xl border border-border bg-surface p-5"
            >
              <h3 className="text-base font-semibold text-foreground">
                {supplement.name}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {supplement.description}
              </p>
              <p className="mt-3 flex items-start gap-1.5 text-xs text-accent-strong">
                <InfoIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                À discuter avec un professionnel de santé avant toute prise.
              </p>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
