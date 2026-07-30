import { OptionCard } from "@/components/onboarding/option-card";
import { activityLevels, type OnboardingData } from "@/lib/onboarding";

export function StepActivity({
  data,
  update,
}: {
  data: OnboardingData;
  update: (patch: Partial<OnboardingData>) => void;
}) {
  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">
        Votre niveau d&rsquo;activité
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Cela nous permet d&rsquo;estimer vos besoins caloriques au quotidien.
      </p>

      <div className="mt-6 flex flex-col gap-2.5">
        {activityLevels.map((level) => (
          <OptionCard
            key={level.value}
            title={level.label}
            description={level.description}
            selected={data.activityLevel === level.value}
            onClick={() => update({ activityLevel: level.value })}
          />
        ))}
      </div>

      <label className="mt-6 block">
        <span className="mb-1.5 block text-sm font-medium text-foreground">
          Pas quotidiens (optionnel)
        </span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={40000}
          placeholder="ex. 6000"
          value={data.steps}
          onChange={(e) => update({ steps: e.target.value })}
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
        />
      </label>
    </div>
  );
}
