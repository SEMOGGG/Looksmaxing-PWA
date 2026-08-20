import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Logo } from "@/components/logo";
import { PhoneMockup } from "@/components/phone-mockup";
import { Reveal } from "@/components/reveal";
import { HeroCta, FinalCta } from "@/components/hero-cta";
import {
  CameraIcon,
  CheckIcon,
  DropletIcon,
  FlagIcon,
  LeafIcon,
  LockIcon,
  SparklesIcon,
} from "@/components/icons";
import { APP_NAME } from "@/lib/navigation";

const demoScreens = [
  {
    src: "/marketing/screenshot-analyse.png",
    alt: "Capture d'écran du bilan Analyse dans l'app Faciem, avec le score global",
    title: "Un bilan clair, en un coup d'œil",
    description: "Un score global et une analyse par catégorie, générés par IA à partir de vos photos.",
  },
  {
    src: "/marketing/screenshot-coach.png",
    alt: "Capture d'écran d'une conversation avec le Coach IA dans l'app Faciem",
    title: "Un coach disponible au quotidien",
    description: "Des conseils concrets et personnalisés, à chaque fois que vous en avez besoin.",
  },
  {
    src: "/marketing/screenshot-nutrition.png",
    alt: "Capture d'écran du plan nutritionnel dans l'app Faciem, avec besoins caloriques et macronutriments",
    title: "Un plan nutrition sur mesure",
    description: "Vos besoins caloriques et votre répartition de macros, calculés et expliqués simplement.",
  },
  {
    src: "/marketing/screenshot-routine.png",
    alt: "Capture d'écran de la routine skincare du matin dans l'app Faciem",
    title: "Une routine skincare guidée",
    description: "Chaque étape expliquée simplement, matin et soir, pour une routine qui tient dans le temps.",
  },
  {
    src: "/marketing/screenshot-communaute.png",
    alt: "Capture d'écran de la Communauté Faciem, avec des articles sur l'apparence et le bien-être",
    title: "Une communauté qui partage",
    description: "Des articles courts et concrets, écrits pour avancer, jamais pour culpabiliser.",
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
    icon: CameraIcon,
    title: "Vous partagez quelques informations",
    description:
      "Une photo (avec votre consentement explicite) et un court questionnaire sur vos objectifs et votre mode de vie.",
  },
  {
    icon: SparklesIcon,
    title: "Nous préparons votre bilan",
    description:
      "Une synthèse claire de votre profil : points forts, axes de travail et recommandations personnalisées.",
  },
  {
    icon: FlagIcon,
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

              <HeroCta />
            </div>

            <Reveal className="relative mx-auto flex h-[340px] w-full max-w-sm items-center justify-center sm:h-[420px]">
              <PhoneMockup
                src="/marketing/screenshot-analyse.png"
                alt="Capture d'écran du bilan Analyse dans l'app Faciem"
                tilt={-6}
                className="absolute left-2 top-6 z-10 max-w-[190px] opacity-90 sm:top-2 sm:max-w-[210px]"
              />
              <PhoneMockup
                src="/marketing/screenshot-coach.png"
                alt="Capture d'écran d'une conversation avec le Coach IA dans l'app Faciem"
                tilt={5}
                className="glow relative z-20 max-w-[210px] sm:max-w-[230px]"
              />
            </Reveal>
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

            <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6">
              {demoScreens.map((screen, i) => (
                <Reveal
                  key={screen.src}
                  delay={(i % 3) * 120}
                  className="flex flex-col items-center text-center"
                >
                  <PhoneMockup src={screen.src} alt={screen.alt} className="max-w-[150px] sm:max-w-[200px]" />
                  <h3 className="mt-5 text-sm font-semibold text-foreground sm:text-base">
                    {screen.title}
                  </h3>
                  <p className="mt-1.5 max-w-[200px] text-xs leading-relaxed text-muted sm:text-sm">
                    {screen.description}
                  </p>
                </Reveal>
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
              {benefits.map((benefit, i) => (
                <Reveal key={benefit.title} delay={(i % 2) * 120}>
                  <div className="group h-full rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-accent/50">
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
                </Reveal>
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

          <div className="relative mt-12">
            <div
              aria-hidden
              className="absolute top-6 bottom-6 left-6 w-px bg-border sm:left-7"
            />
            <ol className="flex flex-col gap-10">
              {steps.map((step, i) => (
                <li key={step.title} className="relative">
                  <Reveal delay={i * 120} className="flex gap-5">
                    <span className="bg-gradient-accent relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white shadow-lg sm:h-14 sm:w-14">
                      <step.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </span>
                    <div className="pt-1.5">
                      <h3 className="text-base font-semibold text-foreground sm:text-lg">
                        {step.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted sm:text-base">
                        {step.description}
                      </p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Confiance / RGPD */}
        <section className="border-t border-border bg-surface-muted">
          <div className="mx-auto w-full max-w-5xl px-5 py-16 sm:py-20">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:items-center">
              <Reveal>
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
              </Reveal>

              <Reveal delay={120} className="flex flex-col gap-3">
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
              </Reveal>
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
            <FinalCta />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
