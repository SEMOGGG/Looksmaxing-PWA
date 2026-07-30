import { OptionCard } from "@/components/onboarding/option-card";
import { goalOptions, type Goal, type OnboardingData } from "@/lib/onboarding";

export function StepGoals({
  data,
  update,
}: {
  data: OnboardingData;
  update: (patch: Partial<OnboardingData>) => void;
}) {
  function toggleGoal(goal: Goal) {
    const active = data.goals.includes(goal);
    update({
      goals: active ? data.goals.filter((g) => g !== goal) : [...data.goals, goal],
    });
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">
        Quels sont vos objectifs ?
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Choisissez tout ce qui vous parle, vous pourrez toujours ajuster plus
        tard.
      </p>

      <div className="mt-6 flex flex-col gap-2.5">
        {goalOptions.map((goal) => (
          <OptionCard
            key={goal.value}
            title={goal.label}
            description={goal.description}
            selected={data.goals.includes(goal.value)}
            onClick={() => toggleGoal(goal.value)}
          />
        ))}
      </div>
    </div>
  );
}
