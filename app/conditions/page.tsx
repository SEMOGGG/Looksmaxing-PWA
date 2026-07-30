import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { APP_NAME, HEALTH_DISCLAIMER } from "@/lib/navigation";

export const metadata: Metadata = {
  title: `Conditions d'utilisation — ${APP_NAME}`,
};

export default function ConditionsPage() {
  return (
    <LegalPage
      title="Conditions d'utilisation"
      updatedAt="30 juillet 2026"
      intro={
        <p>
          En créant un profil ou en utilisant {APP_NAME}, vous acceptez les présentes
          conditions. Merci de les lire attentivement, en particulier les sections
          relatives à la santé et à l&rsquo;espace Communauté.
        </p>
      }
      sections={[
        {
          heading: "1. Objet",
          body: (
            <p>
              Les présentes conditions générales d&rsquo;utilisation (CGU) régissent
              l&rsquo;accès et l&rsquo;utilisation de l&rsquo;application {APP_NAME},
              un service de coaching apparence et bien-être proposant une analyse
              indicative, un plan nutritionnel, des routines skincare et capillaires,
              ainsi qu&rsquo;un espace communautaire.
            </p>
          ),
        },
        {
          heading: "2. Âge minimum et acceptation",
          body: (
            <p>
              {APP_NAME} est strictement réservé aux personnes majeures (18 ans et
              plus), vérifié dès la première visite. En utilisant l&rsquo;application,
              vous confirmez avoir au moins 18 ans et accepter les présentes CGU dans
              leur intégralité. Si vous n&rsquo;acceptez pas ces conditions, vous ne
              devez pas utiliser le service.
            </p>
          ),
        },
        {
          heading: "3. Nature indicative du service",
          body: (
            <>
              <p>
                Les analyses, recommandations nutritionnelles, routines skincare,
                suggestions capillaires et informations sur les compléments fournies par
                {" "}
                {APP_NAME} sont générées à des fins d&rsquo;information et de
                motivation. Elles ne constituent en aucun cas un diagnostic médical, un
                avis professionnel de santé, ni une prescription.
              </p>
              <p className="font-medium text-foreground">{HEALTH_DISCLAIMER}</p>
              <p>
                Toute décision relative à votre santé, votre alimentation ou la prise de
                compléments doit être discutée avec un professionnel de santé qualifié.
              </p>
            </>
          ),
        },
        {
          heading: "4. Compte et données de profil",
          body: (
            <p>
              La création d&rsquo;un compte authentifié (email/mot de passe ou
              fournisseur tiers) sera proposée dans une prochaine version. Dans la
              version actuelle, votre profil est conservé localement sur votre appareil,
              comme détaillé dans notre{" "}
              <a
                href="/confidentialite"
                className="font-medium text-accent-strong underline underline-offset-2"
              >
                politique de confidentialité
              </a>
              . Vous êtes responsable de l&rsquo;exactitude des informations que vous
              renseignez.
            </p>
          ),
        },
        {
          heading: "5. Espace Communauté",
          body: (
            <>
              <p>
                L&rsquo;espace Communauté permet aux membres Premium de publier des
                messages, poser des questions et commenter les publications d&rsquo;autres
                membres, dans un esprit d&rsquo;entraide et de bienveillance.
              </p>
              <p className="font-medium text-foreground">Charte de bonne conduite :</p>
              <ul className="list-inside list-disc space-y-1.5">
                <li>Aucune insulte, harcèlement, discrimination ou propos haineux.</li>
                <li>
                  Aucun conseil médical ou de santé présenté comme un diagnostic ; en cas
                  de doute, orientez toujours vers un professionnel de santé.
                </li>
                <li>Aucun contenu à caractère sexuel, violent ou illégal.</li>
                <li>Aucune promotion commerciale, spam ou démarchage.</li>
                <li>Respect de la vie privée des autres membres.</li>
              </ul>
              <p>
                Chaque publication et commentaire est soumis à une vérification de
                modération avant publication, incluant à terme un examen automatisé par
                intelligence artificielle complété par une revue humaine en cas de
                signalement. Tout membre peut signaler un contenu via le bouton dédié.
              </p>
              <p>
                {APP_NAME} se réserve le droit de retirer tout contenu contrevenant à
                cette charte et de suspendre ou résilier, sans préavis en cas de
                manquement grave, l&rsquo;accès à l&rsquo;espace Communauté ou au compte
                du membre concerné.
              </p>
              <p>
                Le contenu publié reste la propriété de son auteur, qui garantit
                disposer des droits nécessaires sur ce qu&rsquo;il publie et accorde à
                {" "}
                {APP_NAME} une licence non exclusive d&rsquo;affichage, nécessaire au
                fonctionnement du service.
              </p>
            </>
          ),
        },
        {
          heading: "6. Abonnement Premium",
          body: (
            <p>
              Un plan Premium payant, incluant notamment un suivi illimité, un plan
              nutrition détaillé, une analyse capillaire approfondie et l&rsquo;accès à
              la publication dans la Communauté, est proposé en complément du plan
              gratuit. Dans la version actuelle, la structure d&rsquo;abonnement est
              présentée à titre visuel : aucun paiement réel n&rsquo;est traité tant que
              l&rsquo;intégration de paiement (Stripe) n&rsquo;est pas activée. Les
              modalités de facturation, de renouvellement et de résiliation seront
              précisées ici avant l&rsquo;activation des paiements réels.
            </p>
          ),
        },
        {
          heading: "7. Propriété intellectuelle",
          body: (
            <p>
              L&rsquo;ensemble des contenus édités par {APP_NAME} (articles, textes,
              graphismes, logo, code) est protégé par le droit d&rsquo;auteur. Toute
              reproduction non autorisée est interdite, comme précisé dans nos{" "}
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
          heading: "8. Limitation de responsabilité",
          body: (
            <p>
              {APP_NAME} met tout en œuvre pour fournir des informations fiables mais ne
              garantit aucun résultat spécifique. Le service est fourni « en l&rsquo;état
              », sans garantie de disponibilité continue. {APP_NAME} ne saurait être
              tenu responsable des contenus publiés par les membres dans
              l&rsquo;espace Communauté, ni d&rsquo;éventuels dommages résultant de
              l&rsquo;usage des informations fournies en dehors d&rsquo;un avis
              professionnel.
            </p>
          ),
        },
        {
          heading: "9. Résiliation",
          body: (
            <p>
              Vous pouvez cesser d&rsquo;utiliser {APP_NAME} à tout moment. {APP_NAME}
              peut suspendre ou résilier l&rsquo;accès d&rsquo;un membre en cas de
              violation des présentes CGU, notamment de la charte de la Communauté.
            </p>
          ),
        },
        {
          heading: "10. Modification des CGU",
          body: (
            <p>
              {APP_NAME} peut modifier les présentes CGU à tout moment ; la date de
              dernière mise à jour figure en haut de cette page. Il est recommandé de
              les consulter régulièrement.
            </p>
          ),
        },
        {
          heading: "11. Droit applicable",
          body: (
            <p>
              Les présentes CGU sont soumises au droit français. Tout litige relève de
              la compétence des tribunaux français, sous réserve des règles
              impératives applicables aux consommateurs.
            </p>
          ),
        },
        {
          heading: "12. Contact",
          body: (
            <p>
              Pour toute question relative à ces conditions :{" "}
              <span className="text-foreground">[adresse email de contact]</span>.
            </p>
          ),
        },
      ]}
    />
  );
}
