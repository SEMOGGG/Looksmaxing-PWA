// Espace communautaire : articles éditoriaux (contenu fixe, non modifiable
// par les membres) + fil de discussion entre membres Premium.
//
// Ce fichier ne contient que ce qui est sûr à utiliser aussi bien côté
// client que serveur (types, contenu éditorial, modération). L'accès aux
// données de la communauté (Supabase) vit dans
// app/(app)/communaute/actions.ts, qui est un module serveur uniquement.

export type ArticleCategory = "apparence" | "nutrition" | "cardio" | "style" | "general";

export const categoryLabels: Record<ArticleCategory, string> = {
  apparence: "Apparence",
  nutrition: "Nutrition",
  cardio: "Cardio & Sport",
  style: "Style",
  general: "Général",
};

export type Article = {
  id: string;
  category: ArticleCategory;
  title: string;
  excerpt: string;
  content: string[];
  readMinutes: number;
};

export const articles: Article[] = [
  {
    id: "routine-cheveux-bases",
    category: "apparence",
    title: "Les bases d'une routine capillaire qui fonctionne",
    excerpt: "Trois habitudes simples qui font une vraie différence sur la durée.",
    readMinutes: 4,
    content: [
      "Une routine capillaire efficace tient en peu de choses : un lavage adapté à votre type de cheveu (pas trop fréquent pour ne pas assécher le cuir chevelu), un séchage en douceur plutôt qu'un frottement agressif à la serviette, et un entretien régulier chez le coiffeur pour garder une forme nette entre deux coupes.",
      "Si vous avez les cheveux secs ou bouclés, un après-shampoing ou un masque hydratant une fois par semaine change beaucoup de choses sur la texture et la casse.",
      "Pour la barbe, la régularité prime sur la quantité de produit : un peigne, une huile légère et une taille des contours toutes les 1 à 2 semaines suffisent à garder une allure propre.",
    ],
  },
  {
    id: "posture-exercices",
    category: "apparence",
    title: "Posture : 3 exercices simples pour se tenir plus droit",
    excerpt: "Pas besoin de salle de sport, 10 minutes par jour suffisent pour commencer.",
    readMinutes: 5,
    content: [
      "La posture se travaille avant tout par le renforcement du haut du dos et des épaules, souvent négligés face aux muscles du torse.",
      "Trois mouvements simples : le rowing élastique (tirer un élastique vers soi en gardant les coudes près du corps), le \"wall slide\" (dos contre un mur, faire glisser les bras le long du mur en gardant le contact), et le gainage classique pour stabiliser le tronc.",
      "L'essentiel est la régularité : 10 minutes par jour, 4 à 5 fois par semaine, donnent des résultats visibles en quelques semaines sur la façon de se tenir au quotidien.",
    ],
  },
  {
    id: "comprendre-tdee",
    category: "nutrition",
    title: "Comprendre son TDEE sans se prendre la tête",
    excerpt: "Ce que veulent vraiment dire BMR, TDEE et déficit calorique.",
    readMinutes: 5,
    content: [
      "Le BMR (métabolisme de base) est l'énergie que votre corps brûle au repos complet. Le TDEE y ajoute votre activité physique quotidienne : c'est votre dépense énergétique totale sur une journée.",
      "Manger en dessous de son TDEE crée un déficit qui favorise la perte de gras ; manger au-dessus crée un surplus qui favorise la prise de masse. Il n'y a pas de bon ou mauvais chiffre dans l'absolu, tout dépend de votre objectif.",
      "Le calcul reste une estimation : ajustez sur 2 à 3 semaines en fonction de ce que vous observez réellement, plutôt que de suivre le chiffre au gramme près.",
    ],
  },
  {
    id: "hydratation-repere",
    category: "nutrition",
    title: "Hydratation : le repère le plus sous-estimé",
    excerpt: "Un facteur simple qui influence l'énergie, la peau et la récupération.",
    readMinutes: 3,
    content: [
      "Une hydratation insuffisante se traduit souvent par de la fatigue, des maux de tête et une peau qui paraît plus terne — des signaux faciles à confondre avec autre chose.",
      "Un repère simple : environ 1,5 à 2 litres d'eau par jour pour la plupart des adultes, à ajuster à la hausse en cas d'activité physique ou de forte chaleur.",
      "Boire régulièrement dans la journée plutôt qu'en une fois est plus efficace pour l'absorption et le confort digestif.",
    ],
  },
  {
    id: "cardio-vs-muscu",
    category: "cardio",
    title: "Cardio ou musculation : que choisir pour votre objectif ?",
    excerpt: "Les deux ont leur rôle, la répartition dépend de ce que vous visez.",
    readMinutes: 6,
    content: [
      "La musculation construit et préserve la masse musculaire, ce qui façonne la silhouette et soutient le métabolisme sur la durée.",
      "Le cardio améliore l'endurance et la santé cardiovasculaire, et aide à créer un déficit calorique sans réduire drastiquement l'alimentation.",
      "Pour la plupart des objectifs esthétiques, une base de 2 à 3 séances de musculation par semaine complétée par 1 à 3 séances de cardio est un bon point de départ, à ajuster selon vos préférences et votre récupération.",
    ],
  },
  {
    id: "cardio-zone-2",
    category: "cardio",
    title: "La zone 2 : le cardio le plus simple à tenir dans la durée",
    excerpt: "Une intensité modérée, facile à répéter, sans s'épuiser à chaque séance.",
    readMinutes: 4,
    content: [
      "Le cardio en \"zone 2\" correspond à une intensité modérée où vous pouvez encore tenir une conversation sans être essoufflé — ni marche tranquille, ni sprint.",
      "C'est l'intensité la plus facile à répéter régulièrement sans s'épuiser, ce qui en fait un excellent point d'entrée pour construire une habitude durable.",
      "30 à 45 minutes, 2 à 4 fois par semaine (marche rapide, vélo, rameur léger) suffisent pour en tirer des bénéfices réels sur la durée.",
    ],
  },
  {
    id: "vetements-morphologie",
    category: "style",
    title: "Bien choisir des vêtements à sa morphologie",
    excerpt: "Quelques repères simples pour des vêtements qui tombent mieux.",
    readMinutes: 4,
    content: [
      "Le premier réflexe à avoir est de connaître ses mesures réelles plutôt que de se fier à une taille générique : les coupes varient énormément d'une marque à l'autre.",
      "Une coupe ajustée (sans être trop serrée) valorise presque toutes les morphologies mieux qu'un vêtement trop large qui gomme les proportions.",
      "Les couleurs sombres et unies en haut et en bas, avec une seule pièce plus marquante, donnent souvent un rendu plus soigné qu'une multiplication de motifs.",
    ],
  },
  {
    id: "sommeil-levier",
    category: "general",
    title: "Sommeil : le levier le plus rentable pour votre apparence",
    excerpt: "Peau, récupération musculaire, énergie : tout en dépend un peu.",
    readMinutes: 5,
    content: [
      "Le manque de sommeil se voit : teint terne, cernes, récupération musculaire ralentie et appétit dérégulé sont directement liés à la qualité du sommeil.",
      "Viser 7 à 9 heures par nuit, avec des horaires de coucher réguliers, a souvent plus d'impact visible sur quelques semaines que n'importe quel produit cosmétique.",
      "Limiter les écrans et la lumière vive avant de dormir, et garder une chambre fraîche et sombre, sont les ajustements les plus simples à mettre en place.",
    ],
  },
];

export type Comment = {
  id: string;
  author: string;
  content: string;
  createdAt: string;
};

export type Post = {
  id: string;
  author: string;
  category: ArticleCategory;
  content: string;
  createdAt: string;
  likes: number;
  comments: Comment[];
  mediaUrl: string | null;
  mediaType: "image" | "video" | null;
  authorTier: ContributionTier;
};

// Paliers d'ancienneté/activité dans la Communauté, basés sur le nombre
// total de publications + commentaires (tous auteurs confondus, calculé à
// la volée — voir getAuthorTiers dans actions.ts). "Vérifié" est le seuil
// qui débloque l'envoi de photos/vidéos.
export type ContributionTier = { id: string; label: string; minCount: number };

export const contributionTiers: ContributionTier[] = [
  { id: "nouveau", label: "Nouveau", minCount: 0 },
  { id: "actif", label: "Actif", minCount: 10 },
  { id: "habitue", label: "Habitué", minCount: 50 },
  { id: "verifie", label: "Vérifié", minCount: 200 },
];

export const MEDIA_UNLOCK_THRESHOLD = 200;

export function getContributionTier(count: number): ContributionTier {
  let current = contributionTiers[0];
  for (const tier of contributionTiers) {
    if (count >= tier.minCount) current = tier;
  }
  return current;
}

// Sujet mis en avant en haut du composeur, qui change chaque semaine (index
// dérivé de la date, même principe que dailyRoutineTip dans
// lib/routine-tips.ts) pour donner un point de départ facile plutôt qu'une
// page blanche.
export type WeeklyTopic = { question: string; category: ArticleCategory };

const weeklyTopics: WeeklyTopic[] = [
  { question: "Quelle habitude a le plus changé votre apparence cette année ?", category: "general" },
  { question: "Un produit skincare qui vous a vraiment surpris, en bien ?", category: "apparence" },
  { question: "Comment organisez-vous vos repas les jours où l'entraînement tombe tard ?", category: "nutrition" },
  { question: "Un exercice cardio que vous arrivez enfin à tenir dans la durée, sans vous forcer ?", category: "cardio" },
  { question: "Une pièce ou une coupe qui a changé votre style récemment ?", category: "style" },
  { question: "Un petit changement qui a eu un effet disproportionné sur votre confiance ?", category: "general" },
  { question: "Votre routine du soir en 3 étapes, pas plus : à quoi elle ressemble ?", category: "apparence" },
];

export function currentWeeklyTopic(): WeeklyTopic {
  const start = Date.UTC(new Date().getUTCFullYear(), 0, 1);
  const weekIndex = Math.floor((Date.now() - start) / (7 * 86_400_000));
  const index = ((weekIndex % weeklyTopics.length) + weeklyTopics.length) % weeklyTopics.length;
  return weeklyTopics[index];
}

// Publications de démonstration insérées automatiquement dans Supabase la
// première fois que la table community_posts est vide (voir seedIfEmpty
// dans actions.ts), pour que la communauté ne démarre pas comme un espace
// vide. Author_id volontairement distinct ("seed") pour rester identifiable.
export const seedPosts: {
  author: string;
  category: ArticleCategory;
  content: string;
  createdAt: string;
  likes: number;
  comments: { author: string; content: string; createdAt: string }[];
}[] = [
  {
    author: "Camille",
    category: "cardio",
    content:
      "Je me suis mise à la zone 2 il y a un mois (marche rapide 30 min, 4x/semaine). Aucune galère à tenir le rythme et déjà moins essoufflée dans les escaliers. Quelqu'un d'autre a testé sur la durée ?",
    createdAt: "2026-07-24T09:12:00.000Z",
    likes: 14,
    comments: [
      {
        author: "Yanis",
        content: "Pareil ici, 2 mois de zone 2 et le sommeil s'est aussi amélioré, pas juste le cardio.",
        createdAt: "2026-07-24T10:03:00.000Z",
      },
    ],
  },
  {
    author: "Léa",
    category: "apparence",
    content:
      "Petit conseil pour ceux qui débutent une routine skincare : n'introduisez qu'un produit à la fois. J'ai voulu tout faire d'un coup et ma peau a réagi, alors qu'un produit par semaine passe beaucoup mieux.",
    createdAt: "2026-07-22T18:40:00.000Z",
    likes: 22,
    comments: [],
  },
  {
    author: "Thomas",
    category: "nutrition",
    content:
      "Quelqu'un a un repère simple pour répartir ses repas quand on s'entraîne le soir ? J'ai tendance à trop manger d'un coup après la séance.",
    createdAt: "2026-07-20T20:15:00.000Z",
    likes: 6,
    comments: [
      {
        author: "Sofia",
        content:
          "Un repas normal 1h30-2h avant, puis une petite collation protéinée juste après l'entraînement, ça m'a beaucoup aidé à ne plus tout manger d'un coup le soir.",
        createdAt: "2026-07-20T21:02:00.000Z",
      },
    ],
  },
  {
    author: "Nora",
    category: "style",
    content:
      "Je cherche des conseils pour m'habiller quand on est petite (1m58). J'ai l'impression que tout ce que j'achète me tasse encore plus.",
    createdAt: "2026-07-18T14:22:00.000Z",
    likes: 9,
    comments: [],
  },
];

// Liste volontairement courte et non exhaustive, à but de démonstration.
// À remplacer par un vrai appel serveur à un modèle de modération
// (ex. endpoint de modération OpenAI ou classification via l'API Claude)
// avant toute mise en production avec de vrais utilisateurs.
const BLOCKED_TERMS = ["connard", "salope", "pute", "débile", "abruti", "crève"];

export function moderateContent(text: string): { status: "approved" | "flagged"; reason?: string } {
  const trimmed = text.trim();
  const normalized = trimmed.toLowerCase();

  const hit = BLOCKED_TERMS.find((term) => normalized.includes(term));
  if (hit) {
    return {
      status: "flagged",
      reason:
        "Ce message contient des propos qui ne respectent pas nos règles de bienveillance. Merci de le reformuler.",
    };
  }
  if (trimmed.length < 3) {
    return { status: "flagged", reason: "Votre message est trop court." };
  }

  // Anti-spam : liens en rafale, caractères répétés (ex. "!!!!!!!!!!" ou
  // "aaaaaaaa"), messages tout en majuscules — des signaux simples mais
  // qui couvrent l'essentiel du spam automatisé sans modèle dédié.
  const linkCount = (trimmed.match(/https?:\/\//gi) ?? []).length;
  if (linkCount > 2) {
    return { status: "flagged", reason: "Trop de liens dans ce message." };
  }

  if (/(.)\1{6,}/.test(trimmed)) {
    return { status: "flagged", reason: "Ce message ressemble à du spam (caractères répétés)." };
  }

  const letters = trimmed.replace(/[^a-zA-ZÀ-ÖØ-öø-ÿ]/g, "");
  if (letters.length > 15) {
    const upper = letters.replace(/[^A-ZÀ-Ö]/g, "");
    if (upper.length / letters.length > 0.8) {
      return { status: "flagged", reason: "Merci d'éviter les messages tout en majuscules." };
    }
  }

  return { status: "approved" };
}
