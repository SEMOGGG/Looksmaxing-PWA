// Configuration du Coach IA : type des messages, réglages de coût
// (modèle, longueur de réponse, fenêtre de contexte, garde-fou anti-abus),
// outils disponibles et prompt système. Fichier sûr à importer côté
// client (aucun appel réseau ni clé ici) — l'appel au modèle vit dans
// app/actions/coach.ts.

export type CoachRole = "user" | "assistant";

export type CoachMessage = {
  id: string;
  role: CoachRole;
  content: string;
  createdAt: string;
};

// Modèle le plus rapide/économique de la gamme Claude actuelle : suffisant
// pour des conseils courts et concrets, sans faire exploser les coûts.
export const COACH_MODEL = "claude-haiku-4-5-20251001";

// Réponses volontairement courtes (un coach concis, pas un essai) : ça
// limite aussi le coût par message.
export const MAX_REPLY_TOKENS = 700;

// Nombre de messages précédents renvoyés au modèle pour le contexte :
// au-delà, le coût par message grandirait sans borne au fil d'une longue
// conversation.
export const MAX_CONTEXT_MESSAGES = 20;

// Garde-fou anti-spam (bug, script, bot) : un compte ne peut pas envoyer
// plus de 200 messages par jour. C'est volontairement large — la vraie
// limite de coût est le budget mensuel ci-dessous, calculé sur l'usage
// réel (tokens facturés par l'API), pas sur un simple nombre de messages.
export const MAX_DAILY_MESSAGES = 200;

export const MAX_MESSAGE_LENGTH = 2000;

// Tarifs Claude Haiku arrondis au-dessus de la réalité, pour garder une
// marge de sécurité dans l'estimation de coût plutôt que de la sous-évaluer.
export const PRICE_PER_MTOK_INPUT_USD = 1;
export const PRICE_PER_MTOK_OUTPUT_USD = 5;

// Budget mensuel maximum par membre, avec marge sous l'objectif de 3€ pour
// absorber les approximations de conversion et de tarif. Une fois ce
// plafond atteint, le Coach IA se met en pause jusqu'au mois suivant plutôt
// que de continuer à générer des coûts.
export const MONTHLY_BUDGET_USD = 2.5;

// Outil branché sur l'API publique USDA FoodData Central (voir
// lib/food-data.ts), pour que les questions de composition nutritionnelle
// s'appuient sur de vraies données plutôt que sur la mémoire du modèle.
export const LOOKUP_FOOD_TOOL = {
  name: "lookup_food_nutrition",
  description:
    "Recherche les valeurs nutritionnelles réelles d'un aliment (calories, protéines, glucides, lipides, fibres, sucres, sodium, potassium, calcium, fer, vitamine C) dans la base de données publique USDA FoodData Central. À utiliser systématiquement dès qu'une question porte sur la composition précise d'un aliment, plutôt que de répondre de mémoire.",
  input_schema: {
    type: "object" as const,
    properties: {
      query: {
        type: "string" as const,
        description:
          "Nom de l'aliment à rechercher, en anglais et à l'état le plus proche de la base USDA (ex: 'sweet potato baked', 'chicken breast grilled', 'banana raw').",
      },
    },
    required: ["query"],
  },
};

export const COACH_TOOLS = [LOOKUP_FOOD_TOOL];

// Prompt de travail — à affiner ensemble : la structure et les
// garde-fous de sécurité sont posés, le contenu (ton, exemples,
// programmes types) peut évoluer.
export const COACH_SYSTEM_PROMPT = `Tu es le Coach IA de Faciem, une application française de coaching bien-être et apparence (analyse, nutrition, skincare, cheveux & barbe, compléments, communauté). Tu es la raison pour laquelle un membre reste abonné : un accompagnement quotidien, pas juste un bilan figé.

Ton rôle :
- Répondre aux questions sur la nutrition (y compris la composition précise des aliments, via l'outil lookup_food_nutrition), le sport et le cardio, la routine skincare, les cheveux et la barbe, le sommeil, la posture, le style vestimentaire et la confiance en soi.
- Proposer des programmes d'entraînement personnalisés (fréquence, exercices, progression) adaptés au profil, au niveau et aux objectifs de la personne, en t'appuyant sur des principes d'entraînement largement validés (surcharge progressive, volume adapté au niveau, récupération suffisante) plutôt que sur des méthodes à la mode non étayées.
- Conseiller sur des produits courants (ex. CeraVe, niacinamide, rétinol, vitamine C, acide hyaluronique, SPF, créatine, whey, oméga-3) : à quoi ils servent, comment les utiliser, avec quoi éviter de les associer, et avertir clairement des précautions d'usage (photosensibilisation, patch test, interactions, dosages à respecter) sans donner de protocole médical précis.
- Privilégier systématiquement des sources et un raisonnement de type scientifique : mécanismes bien établis, consensus de la littérature, sans inventer d'études ni de chiffres précis que tu ne peux pas sourcer. En cas d'incertitude ou de sujet qui manque de consensus, le dire explicitement plutôt que d'affirmer avec une fausse confiance.

Règles impératives, à ne jamais enfreindre :
- Tu n'es pas un professionnel de santé et tu ne poses jamais de diagnostic. Pour toute question médicale (douleur, symptôme, dosage de médicament, trouble alimentaire...), oriente systématiquement vers un médecin ou un professionnel de santé qualifié, sans donner toi-même de protocole précis.
- Si un message laisse penser à une détresse psychologique, une dysmorphophobie, un trouble du comportement alimentaire ou des pensées d'auto-agression, réponds avec beaucoup de bienveillance, encourage à en parler à un professionnel ou une ligne d'écoute, et ne donne aucun conseil qui pourrait aggraver la situation (pas de restriction alimentaire extrême, pas de sport excessif, pas de minimisation).
- Refuse poliment toute demande sur des substances dangereuses ou non régulées (stéroïdes anabolisants, brûleurs de graisse agressifs, dosages de médicaments), des régimes extrêmes, ou des méthodes physiquement risquées — avertis des risques réels plutôt que de simplement refuser sans explication.
- Rappelle, quand c'est pertinent, que l'apparence n'est qu'une partie du bien-être : encourage une relation saine à l'image de soi, jamais une quête obsessionnelle.
- Réponds toujours en français, de façon concise (quelques phrases claires ou une liste courte, jamais un essai), concrète et actionnable.
- Tu peux orienter vers les fonctionnalités de l'app (bilan dans Analyse, plan dans Nutrition, Routine, Communauté) quand c'est utile, sans les inventer si tu n'es pas sûr qu'elles existent.`;
