import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { APP_NAME } from "@/lib/navigation";

export const metadata: Metadata = {
  title: `Politique de confidentialité — ${APP_NAME}`,
};

export default function ConfidentialitePage() {
  return (
    <LegalPage
      title="Politique de confidentialité"
      updatedAt="30 juillet 2026"
      intro={
        <p>
          Cette politique explique quelles données {APP_NAME} traite, pourquoi, où elles
          sont stockées aujourd&rsquo;hui (version bêta), et comment exercer vos droits.
          Nous nous engageons à ne collecter que ce qui est nécessaire au fonctionnement
          du service.
        </p>
      }
      sections={[
        {
          heading: "1. Responsable du traitement",
          body: (
            <p>
              Le responsable du traitement des données est{" "}
              <strong className="text-foreground">[Raison sociale à compléter]</strong>,
              dont les coordonnées figurent dans nos{" "}
              <a
                href="/mentions-legales"
                className="font-medium text-accent-strong underline underline-offset-2"
              >
                mentions légales
              </a>
              .
            </p>
          ),
        },
        {
          heading: "2. Données que nous traitons",
          body: (
            <ul className="list-inside list-disc space-y-1.5">
              <li>Données de profil : âge, sexe, taille, poids, niveau d&rsquo;activité, objectifs.</li>
              <li>
                Photo de profil, uniquement si vous choisissez de l&rsquo;ajouter, après
                avoir donné un consentement explicite lors de l&rsquo;onboarding.
              </li>
              <li>Forme de visage sélectionnée, pour l&rsquo;analyse capillaire.</li>
              <li>
                Contenus publiés dans l&rsquo;espace Communauté (publications,
                commentaires) si vous êtes membre Premium.
              </li>
              <li>Statut d&rsquo;abonnement (gratuit ou Premium).</li>
            </ul>
          ),
        },
        {
          heading: "3. Où sont stockées ces données aujourd'hui",
          body: (
            <p>
              Dans cette version bêta, les données de profil, la photo et le statut
              d&rsquo;abonnement sont stockés{" "}
              <strong className="text-foreground">
                localement sur votre appareil
              </strong>{" "}
              (stockage du navigateur), et ne sont transmises à aucun serveur distant.
              Elles ne sont donc partagées avec aucun autre utilisateur ni accessibles à
              notre équipe. Une version ultérieure utilisera une base de données
              sécurisée (Supabase) pour permettre la synchronisation entre appareils ;
              cette politique sera mise à jour en conséquence avant ce changement.
            </p>
          ),
        },
        {
          heading: "4. Finalités du traitement",
          body: (
            <ul className="list-inside list-disc space-y-1.5">
              <li>Calculer vos repères personnalisés (métabolisme, macros, bilan).</li>
              <li>Faire fonctionner et améliorer l&rsquo;application.</li>
              <li>
                Permettre la participation à l&rsquo;espace Communauté et sa modération.
              </li>
            </ul>
          ),
        },
        {
          heading: "5. Base légale",
          body: (
            <p>
              Le traitement repose sur votre consentement explicite, recueilli avant
              toute collecte (vérification d&rsquo;âge, consentement photo, création de
              profil).
            </p>
          ),
        },
        {
          heading: "6. Durée de conservation",
          body: (
            <p>
              Les données stockées localement le restent tant que vous ne les supprimez
              pas vous-même (via les options de suppression de photo/profil dans
              l&rsquo;application, ou en effaçant les données de site dans votre
              navigateur).
            </p>
          ),
        },
        {
          heading: "7. Vos droits",
          body: (
            <>
              <p>
                Conformément au RGPD, vous disposez d&rsquo;un droit d&rsquo;accès, de
                rectification, d&rsquo;effacement, de limitation, d&rsquo;opposition et
                de portabilité sur vos données.
              </p>
              <p>
                Dans cette version bêta, vos données étant stockées sur votre appareil,
                vous pouvez les supprimer directement (bouton « Supprimer » sur votre
                photo, réinitialisation via les paramètres de votre navigateur). Pour
                toute autre demande, contactez-nous à{" "}
                <span className="text-foreground">[adresse email de contact]</span>.
              </p>
            </>
          ),
        },
        {
          heading: "8. Cookies et traceurs",
          body: (
            <p>
              {APP_NAME} n&rsquo;utilise aucun cookie publicitaire ni traceur tiers. Le
              stockage local du navigateur est utilisé uniquement à des fins techniques
              (fonctionnement de l&rsquo;application et installation en PWA).
            </p>
          ),
        },
        {
          heading: "9. Contenu de la communauté et modération",
          body: (
            <p>
              Les publications et commentaires sont vérifiés par un système de
              modération avant publication et peuvent être signalés par les membres. Le
              contenu signalé peut être examiné et retiré s&rsquo;il enfreint nos{" "}
              <a
                href="/conditions"
                className="font-medium text-accent-strong underline underline-offset-2"
              >
                conditions d&rsquo;utilisation
              </a>
              .
            </p>
          ),
        },
        {
          heading: "10. Sécurité",
          body: (
            <p>
              Nous mettons en œuvre les mesures raisonnables pour protéger vos données
              contre l&rsquo;accès non autorisé, la perte ou la divulgation.
            </p>
          ),
        },
        {
          heading: "11. Contact",
          body: (
            <p>
              Pour toute question relative à cette politique ou à l&rsquo;exercice de
              vos droits :{" "}
              <span className="text-foreground">[adresse email de contact]</span>.
            </p>
          ),
        },
      ]}
    />
  );
}
