import { OptionCard } from "@/components/onboarding/option-card";
import { sexOptions, type OnboardingData } from "@/lib/onboarding";

const inputClass =
  "w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none";

export function StepProfile({
  data,
  update,
}: {
  data: OnboardingData;
  update: (patch: Partial<OnboardingData>) => void;
}) {
  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">
        Parlez-nous un peu de vous
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Ces informations nous servent uniquement à calculer vos repères
        personnalisés.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-foreground">Âge</span>
          <input
            type="number"
            inputMode="numeric"
            min={16}
            max={99}
            placeholder="25"
            value={data.age}
            onChange={(e) => update({ age: e.target.value })}
            className={inputClass}
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-foreground">
              Taille (cm)
            </span>
            <input
              type="number"
              inputMode="numeric"
              min={120}
              max={230}
              placeholder="178"
              value={data.heightCm}
              onChange={(e) => update({ heightCm: e.target.value })}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-foreground">
              Poids (kg)
            </span>
            <input
              type="number"
              inputMode="numeric"
              min={30}
              max={250}
              placeholder="72"
              value={data.weightKg}
              onChange={(e) => update({ weightKg: e.target.value })}
              className={inputClass}
            />
          </label>
        </div>

        <div>
          <span className="mb-2 block text-sm font-medium text-foreground">Sexe</span>
          <div className="flex flex-col gap-2.5">
            {sexOptions.map((option) => (
              <OptionCard
                key={option.value}
                title={option.label}
                selected={data.sex === option.value}
                onClick={() => update({ sex: option.value })}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
