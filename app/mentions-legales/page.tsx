import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { APP_NAME } from "@/lib/navigation";

export const metadata: Metadata = {
  title: `Mentions légales — ${APP_NAME}`,
};

export default function MentionsLegalesPage() {
  return (
    <LegalPage
      title="Mentions légales"
      updatedAt="30 juillet 2026"
      intro={
        <p>
          {APP_NAME} est actuellement une version bêta (MVP) en cours de développement.
          Les informations d&rsquo;identification de l&rsquo;éditeur ci-dessous seront
          complétées avec les données définitives de la société avant toute mise en
          production commerciale.
        </p>
      }
      sections={[
        {
          heading: "1. Éditeur du site",
          body: (
            <>
              <p>
                Le site et l&rsquo;application {APP_NAME} sont édités par :{" "}
                <strong className="text-foreground">[Raison sociale à compléter]</strong>,{" "}
                [forme juridique — ex. SAS, EI], au capital de [montant] €, immatriculée
                au Registre du Commerce et des Sociétés de [ville] sous le numéro
                [SIREN/SIRET], dont le siège social est situé au [adresse complète].
              </p>
              <p>
                Numéro de TVA intracommunautaire : [à compléter].
              </p>
              <p>
                Contact : <span className="text-foreground">[adresse email de contact]</span>
              </p>
            </>
          ),
        },
        {
          heading: "2. Directeur de la publication",
          body: <p>[Nom et prénom du responsable de la publication à compléter].</p>,
        },
        {
          heading: "3. Hébergement",
          body: (
            <p>
              L&rsquo;application est hébergée par Vercel Inc., dont les coordonnées
              complètes sont disponibles à l&rsquo;adresse{" "}
              <span className="text-foreground">vercel.com/legal</span>. Le code source
              est versionné sur GitHub.
            </p>
          ),
        },
        {
          heading: "4. Propriété intellectuelle",
          body: (
            <>
              <p>
                L&rsquo;ensemble des éléments composant {APP_NAME} (textes, graphismes,
                logo, structure de navigation, code source, articles éditoriaux) est
                protégé par le droit de la propriété intellectuelle. Toute reproduction,
                représentation, modification ou exploitation, totale ou partielle, sans
                autorisation préalable écrite, est interdite.
              </p>
              <p>
                Les contenus publiés par les membres dans l&rsquo;espace Communauté
                restent la propriété de leurs auteurs, qui accordent à {APP_NAME} une
                licence d&rsquo;affichage nécessaire au fonctionnement du service (voir
                les{" "}
                <a
                  href="/conditions"
                  className="font-medium text-accent-strong underline underline-offset-2"
                >
                  conditions d&rsquo;utilisation
                </a>
                ).
              </p>
            </>
          ),
        },
        {
          heading: "5. Liens hypertextes",
          body: (
            <p>
              {APP_NAME} ne pourra être tenu responsable des liens hypertextes présents
              sur le site qui pointeraient vers d&rsquo;autres ressources sur le réseau
              Internet, ni du contenu de ces ressources.
            </p>
          ),
        },
        {
          heading: "6. Données personnelles",
          body: (
            <p>
              Le traitement des données personnelles est détaillé dans notre{" "}
              <a
                href="/confidentialite"
                className="font-medium text-accent-strong underline underline-offset-2"
              >
                politique de confidentialité
              </a>
              .
            </p>
          ),
        },
        {
          heading: "7. Contact",
          body: (
            <p>
              Pour toute question relative à ces mentions légales, écrivez à{" "}
              <span className="text-foreground">[adresse email de contact]</span>.
            </p>
          ),
        },
      ]}
    />
  );
}
