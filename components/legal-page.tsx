import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export type LegalSection = {
  heading: string;
  body: ReactNode;
};

export function LegalPage({
  title,
  updatedAt,
  intro,
  sections,
}: {
  title: string;
  updatedAt: string;
  intro?: ReactNode;
  sections: LegalSection[];
}) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-3xl px-5 py-12 sm:py-16">
          <h1 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-muted">Dernière mise à jour : {updatedAt}</p>

          {intro && (
            <div className="mt-6 rounded-2xl border border-border bg-surface-muted p-5 text-sm leading-relaxed text-muted">
              {intro}
            </div>
          )}

          <div className="mt-8 flex flex-col gap-8">
            {sections.map((section) => (
              <section key={section.heading}>
                <h2 className="font-heading text-xl font-semibold text-foreground">
                  {section.heading}
                </h2>
                <div className="mt-2.5 flex flex-col gap-3 text-sm leading-relaxed text-muted">
                  {section.body}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
