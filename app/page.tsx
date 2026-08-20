import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Logo } from "@/components/logo";
import { PhoneMockup } from "@/components/phone-mockup";
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

const demoScreens = [
  {
    src: "/marketing/screenshot-analyse.jpg",
    alt: "Capture d'écran du bilan Analyse dans l'app Faciem, avec le score global",
    title: "Un bilan clair, en un coup d'œil",
    description: "Un score global et une analyse par catégorie, générés par IA à partir de vos photos.",
  },
  {
    src: "/marketing/screenshot-coach.jpg",
    alt: "Capture d'écran d'une conversation avec le Coach IA dans l'app Faciem",
    title: "Un coach disponible au quotidien",
    description: "Des conseils concrets et personnalisés, à chaque fois que vous en avez besoin.",
  },
  {
    src: "/marketing/screenshot-nutrition.jpg",
    alt: "Capture d'écran du plan nutritionnel dans l'app Faciem, avec besoins caloriques et macronutriments",
    title: "Un plan nutrition sur mesure",
    description: "Vos besoins caloriques et votre répartition de macros, calculés et expliqués simplement.",
  },
];

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
      <main className="flex-1 overflow-x-clip">
        {/* Hero */}
        <section className="relative overflow-hidden px-5 pt-14 pb-16 sm:pt-20 sm:pb-24">
          <div
            aria-hidden
            className="animate-drift pointer-events-none absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-accent opacity-25 blur-[100px] sm:h-[28rem] sm:w-[28rem]"
          />
          <div
            aria-hidden
            className="animate-drift-slow pointer-events-none absolute top-10 right-0 h-64 w-64 rounded-full bg-accent-2 opacity-20 blur-[100px]"
          />
          <Logo
            idPrefix="hero-watermark"
            aria-hidden
            className="pointer-events-none absolute top-6 right-4 h-24 w-24 opacity-[0.08] sm:h-36 sm:w-36 sm:right-10"
          />

          <div className="relative mx-auto grid max-w-5xl grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="text-center lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-3 py-1 text-xs font-medium text-muted backdrop-blur">
                <Logo idPrefix="badge-logo" className="h-3.5 w-3.5" />
                Coaching apparence &amp; bien-être
              </span>
              <h1 className="font-heading mt-5 text-4xl leading-[1.05] font-semibold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                Révélez le meilleur
                <br />
                de vous-même,{" "}
                <span className="text-gradient font-heading-italic">à votre rythme</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg lg:mx-0 lg:mr-auto">
                {APP_NAME} vous accompagne avec bienveillance : analyse claire de votre
                profil, nutrition personnalisée, routine skincare et suivi dans le temps.
                Un espace pensé pour vous encourager, jamais pour vous juger.
              </p>

              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Link
                  href="/onboarding"
                  className="glow bg-gradient-accent inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] sm:w-auto"
                >
                  Commencer
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
                <span className="text-xs text-muted">
                  Gratuit pour commencer · réservé aux 18 ans et plus
                </span>
              </div>
            </div>

            <div className="relative mx-auto flex h-[340px] w-full max-w-sm items-center justify-center sm:h-[420px]">
              <PhoneMockup
                src="/marketing/screenshot-analyse.jpg"
                alt="Capture d'écran du bilan Analyse dans l'app Faciem"
                tilt={-6}
                className="absolute left-2 top-6 z-10 max-w-[190px] opacity-90 sm:top-2 sm:max-w-[210px]"
              />
              <PhoneMockup
                src="/marketing/screenshot-coach.jpg"
                alt="Capture d'écran d'une conversation avec le Coach IA dans l'app Faciem"
                tilt={5}
                className="glow relative z-20 max-w-[210px] sm:max-w-[230px]"
              />
            </div>
          </div>
        </section>

        {/* Démonstration */}
        <section className="border-t border-border bg-surface-muted">
          <div className="mx-auto w-full max-w-5xl px-5 py-16 sm:py-20">
            <div className="mx-auto max-w-xl text-center">
              <h2 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
                Découvrez l&rsquo;app en images
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                Ce ne sont pas des maquettes : ce sont de vraies captures d&rsquo;écran de
                l&rsquo;application.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-6">
              {demoScreens.map((screen) => (
                <div key={screen.src} className="flex flex-col items-center text-center">
                  <PhoneMockup src={screen.src} alt={screen.alt} className="max-w-[200px]" />
                  <h3 className="mt-5 text-base font-semibold text-foreground">{screen.title}</h3>
                  <p className="mt-1.5 max-w-[220px] text-sm leading-relaxed text-muted">
                    {screen.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bénéfices */}
        <section className="border-t border-border bg-surface-muted">
          <div className="mx-auto w-full max-w-5xl px-5 py-16 sm:py-20">
            <div className="mx-auto max-w-xl text-center">
              <h2 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
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
                  className="group rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-accent/50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent-strong">
                    <benefit.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-foreground">
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
            <h2 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
              Comment ça marche
            </h2>
          </div>

          <ol className="mt-10 flex flex-col gap-4">
            {steps.map((step) => (
              <li
                key={step.number}
                className="flex gap-4 rounded-2xl border border-border bg-surface p-5"
              >
                <span className="text-gradient font-heading shrink-0 text-2xl font-semibold">
                  {step.number}
                </span>
                <div>
                  <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
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
                <h2 className="font-heading mt-4 text-2xl font-semibold text-foreground sm:text-3xl">
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
          <div className="bg-gradient-accent glow relative overflow-hidden rounded-3xl px-6 py-12 text-center sm:px-12">
            <Logo
              idPrefix="cta-watermark"
              aria-hidden
              className="pointer-events-none absolute -top-6 -right-6 h-24 w-24 opacity-20 mix-blend-overlay sm:h-56 sm:w-56"
            />
            <h2 className="font-heading relative text-2xl font-semibold text-white sm:text-3xl">
              Prêt·e à prendre soin de vous, sans pression ?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/80 sm:text-base">
              Créez votre profil en quelques minutes et recevez votre premier bilan
              personnalisé.
            </p>
            <Link
              href="/onboarding"
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#0a0a0f] transition-transform hover:scale-[1.02]"
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
