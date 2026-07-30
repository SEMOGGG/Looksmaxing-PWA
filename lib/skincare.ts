// Contenu éditorial de l'onglet Skincare : routines, bibliothèque
// d'ingrédients/produits et routine gua sha. Contenu fixe, pas de données
// utilisateur ici.

export type RoutineStep = { title: string; why: string };

export const morningRoutine: RoutineStep[] = [
  {
    title: "Nettoyant doux",
    why: "Élimine l'excès de sébum accumulé pendant la nuit sans agresser la peau.",
  },
  {
    title: "Sérum vitamine C",
    why: "Protège des agressions extérieures et aide à unifier le teint sur la durée.",
  },
  {
    title: "Hydratant léger",
    why: "Maintient la barrière cutanée et évite les tiraillements dans la journée.",
  },
  {
    title: "Protection solaire SPF 30+",
    why: "Prévient le vieillissement prématuré et les taches, même par temps couvert.",
  },
];

export const eveningRoutine: RoutineStep[] = [
  {
    title: "Démaquillant / nettoyant",
    why: "Retire les impuretés, le sébum et les résidus de crème solaire de la journée.",
  },
  {
    title: "Actif ciblé (rétinol ou AHA/BHA, en alternance)",
    why: "Stimule le renouvellement cellulaire ; à introduire progressivement, une à deux fois par semaine au début.",
  },
  {
    title: "Crème de nuit",
    why: "Nourrit et répare la peau pendant le sommeil, quand elle se régénère le plus.",
  },
];

export const guaShaRoutine: RoutineStep[] = [
  {
    title: "Appliquez une huile ou un sérum avant de commencer",
    why: "L'outil doit glisser sans tirer sur la peau ; sans lubrification, le geste devient inconfortable et moins efficace.",
  },
  {
    title: "Partez du centre du visage vers l'extérieur",
    why: "Menton vers l'oreille, puis joue vers l'oreille, puis front vers la tempe : ce sens accompagne le drainage plutôt que de le contrarier.",
  },
  {
    title: "Glissez le long du cou, de bas en haut",
    why: "Quelques passages doux le long du cou avant de remonter vers le visage préparent la zone et évitent une sensation de tension.",
  },
  {
    title: "Un angle plat, une pression légère à modérée",
    why: "L'outil incliné à environ 15-30° contre la peau, sans appuyer fort : c'est un massage, pas un raclage.",
  },
  {
    title: "5 à 10 minutes, 2 à 4 fois par semaine",
    why: "La régularité compte plus que la durée ; beaucoup ressentent un effet déjà après la séance (moins de tension, teint plus frais).",
  },
];

export type SkincareIngredient = {
  id: string;
  name: string;
  whatItDoes: string;
  howToUse: string;
  caution: string;
  exampleProduct: string;
};

export const skincareIngredients: SkincareIngredient[] = [
  {
    id: "niacinamide",
    name: "Niacinamide (vitamine B3)",
    whatItDoes:
      "Régule le sébum, resserre l'apparence des pores et renforce la barrière cutanée. Convient à presque tous les types de peau.",
    howToUse: "Matin et/ou soir, en sérum à 5-10 %, avant la crème hydratante.",
    caution: "Bien tolérée en général ; à de très fortes concentrations, peut légèrement irriter les peaux sensibles.",
    exampleProduct: "The Ordinary Niacinamide 10% + Zinc 1%",
  },
  {
    id: "retinol",
    name: "Rétinol",
    whatItDoes:
      "Accélère le renouvellement cellulaire, lisse le grain de peau et aide sur les marques d'acné et les premières rides.",
    howToUse: "Le soir uniquement, 1 à 2 fois par semaine au début, en augmentant progressivement.",
    caution:
      "Rend la peau plus sensible au soleil : SPF impératif le matin. Ne jamais combiner avec un AHA/BHA le même soir. Déconseillé pendant la grossesse.",
    exampleProduct: "CeraVe Resurfacing Retinol Serum",
  },
  {
    id: "vitamine-c",
    name: "Vitamine C (acide ascorbique)",
    whatItDoes: "Antioxydant qui aide à unifier le teint et protège des agressions extérieures (pollution, UV).",
    howToUse: "Le matin, avant la crème et la protection solaire.",
    caution: "Certaines formes s'oxydent vite (couleur qui fonce) ; conserver à l'abri de la lumière.",
    exampleProduct: "La Roche-Posay Vitamine C10 Sérum",
  },
  {
    id: "acide-hyaluronique",
    name: "Acide hyaluronique",
    whatItDoes: "Retient l'eau dans la peau : hydratation immédiate, effet repulpant.",
    howToUse: "Matin et soir, sur peau humide, avant de sceller avec une crème.",
    caution: "Sur peau très sèche et air sec, peut avoir l'effet inverse s'il n'est pas suivi d'une crème occlusive.",
    exampleProduct: "CeraVe Sérum Hydratant à l'Acide Hyaluronique",
  },
  {
    id: "aha-bha",
    name: "AHA / BHA (acides exfoliants)",
    whatItDoes:
      "Les AHA (glycolique, lactique) lissent la surface et unifient le teint ; le BHA (acide salicylique) pénètre dans les pores, utile contre les points noirs.",
    howToUse: "Le soir, 1 à 3 fois par semaine, jamais en même temps que le rétinol.",
    caution: "Photosensibilisant : SPF obligatoire le matin qui suit. Ne pas cumuler plusieurs exfoliants le même soir.",
    exampleProduct: "Paula's Choice Skin Perfecting 2% BHA",
  },
  {
    id: "ceramides",
    name: "Céramides",
    whatItDoes: "Restaurent la barrière cutanée et limitent la perte en eau : essentiels pour les peaux sèches ou irritées.",
    howToUse: "Matin et/ou soir, en dernière étape (crème), seuls ou associés à d'autres actifs.",
    caution: "Très bien tolérés, y compris avec du rétinol ou des exfoliants.",
    exampleProduct: "CeraVe Crème Hydratante Visage (céramides + acide hyaluronique)",
  },
  {
    id: "spf",
    name: "Protection solaire (SPF 30-50)",
    whatItDoes:
      "Le geste le plus rentable de toute la routine : prévient le vieillissement prématuré, les taches et protège la peau après un actif exfoliant.",
    howToUse: "Tous les matins, même en hiver ou par temps couvert, en dernière étape avant le maquillage.",
    caution: "À réappliquer en cas d'exposition prolongée au soleil.",
    exampleProduct: "La Roche-Posay Anthelios UVMune 400",
  },
];
