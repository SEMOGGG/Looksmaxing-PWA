import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import {
  ArrowRightIcon,
  CameraIcon,
  CheckIcon,
  DropletIcon,
  LeafIcon,
  LockIcon,
  SparklesIcon,
} from "@/components/icons";
import { APP_NAME } from "@/lib/navigation";

const benefits = [
  {
    icon: SparklesIcon,
    title: "Une analyse bienveillante",
    description:
      "Un état des lieux clair de vos points forts et de vos axes de progression, sans jugement ni jargon médical.",
  },
  {
    icon: LeafIcon,
    title: "Nutrition sur mesure",
    description:
      "Vos besoins caloriques et votre répartition de macronutriments, calculés simplement et expliqués clairement.",
  },
  {
    icon: DropletIcon,
    title: "Routine skincare guidée",
    description:
      "Des gestes matin et soir, expliqués pas à pas, pour prendre soin de votre peau durablement.",
  },
  {
    icon: CheckIcon,
    title: "Un suivi dans le temps",
    description:
      "Retrouvez l'historique de vos analyses et votre progression, pour avancer à votre rythme.",
  },
];

const steps = [
  {
    number: "01",
    title: "Vous partagez quelques informations",
    description:
      "Une photo (avec votre consentement explicite) et un court questionnaire sur vos objectifs et votre mode de vie.",
  },
  {
    number: "02",
    title: "Nous préparons votre bilan",
    description:
      "Une synthèse claire de votre profil : points forts, axes de travail et recommandations personnalisées.",
  },
  {
    number: "03",
    title: "Vous avancez à votre rythme",
    description:
      "Un plan nutrition, une routine skincare et un suivi pensés pour s'intégrer simplement à votre quotidien.",
  },
];

export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto w-full max-w-5xl px-5 pt-14 pb-16 sm:pt-20 sm:pb-24">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
              Coaching apparence &amp; bien-être
            </span>
            <h1 className="font-heading mt-5 text-4xl font-medium leading-tight tracking-tight text-foreground sm:text-5xl">
              Révélez le meilleur de vous-même,{" "}
              <span className="italic text-accent-strong">à votre rythme</span>
            </h1>
            <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
              {APP_NAME} vous accompagne avec bienveillance : analyse claire de votre
              profil, nutrition personnalisée, routine skincare et suivi dans le temps.
              Un espace pensé pour vous encourager, jamais pour vous juger.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/onboarding"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent-strong px-6 py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-90 sm:w-auto"
              >
                Commencer
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <span className="text-xs text-muted">
                Gratuit pour commencer · réservé aux 18 ans et plus
              </span>
            </div>
          </div>
        </section>

        {/* Bénéfices */}
        <section className="border-t border-border bg-surface-muted">
          <div className="mx-auto w-full max-w-5xl px-5 py-16 sm:py-20">
            <div className="mx-auto max-w-xl text-center">
              <h2 className="font-heading text-2xl font-medium text-foreground sm:text-3xl">
                Un accompagnement complet, pensé pour vous
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                Chaque recommandation part de vos objectifs, pas de standards
                impossibles à atteindre.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {benefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="rounded-2xl border border-border bg-surface p-5"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent-strong">
                    <benefit.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-medium text-foreground">
                    {benefit.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comment ça marche */}
        <section className="mx-auto w-full max-w-5xl px-5 py-16 sm:py-20">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="font-heading text-2xl font-medium text-foreground sm:text-3xl">
              Comment ça marche
            </h2>
          </div>

          <ol className="mt-10 flex flex-col gap-4">
            {steps.map((step) => (
              <li
                key={step.number}
                className="flex gap-4 rounded-2xl border border-border bg-surface p-5"
              >
                <span className="font-heading shrink-0 text-2xl font-medium text-accent">
                  {step.number}
                </span>
                <div>
                  <h3 className="text-base font-medium text-foreground">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Confiance / RGPD */}
        <section className="border-t border-border bg-surface-muted">
          <div className="mx-auto w-full max-w-5xl px-5 py-16 sm:py-20">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:items-center">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent-strong">
                  <LockIcon className="h-5 w-5" />
                </div>
                <h2 className="font-heading mt-4 text-2xl font-medium text-foreground sm:text-3xl">
                  Vos données et vos photos vous appartiennent
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                  Aucune photo n&rsquo;est utilisée sans votre consentement explicite,
                  demandé clairement avant chaque envoi. Vous gardez à tout moment le
                  contrôle sur vos informations personnelles.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4">
                  <CameraIcon className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <p className="text-sm text-foreground">
                    Consentement RGPD explicite demandé avant tout envoi de photo.
                  </p>
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4">
                  <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <p className="text-sm text-foreground">
                    Un ton bienveillant à chaque étape : on valorise vos progrès, jamais
                    vos défauts.
                  </p>
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4">
                  <LockIcon className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <p className="text-sm text-foreground">
                    Réservé aux personnes majeures, vérifié dès la première visite.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="mx-auto w-full max-w-5xl px-5 py-16 sm:py-20">
          <div className="rounded-3xl border border-border bg-foreground px-6 py-12 text-center sm:px-12">
            <h2 className="font-heading text-2xl font-medium text-background sm:text-3xl">
              Prêt·e à prendre soin de vous, sans pression ?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-background/70 sm:text-base">
              Créez votre profil en quelques minutes et recevez votre premier bilan
              personnalisé.
            </p>
            <Link
              href="/onboarding"
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-background px-6 py-3.5 text-sm font-medium text-foreground transition-opacity hover:opacity-90"
            >
              Commencer gratuitement
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
