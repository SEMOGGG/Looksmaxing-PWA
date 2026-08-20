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
  // true = actif plus confidentiel, rarement mis en avant en grande surface ;
  // false = grand classique qu'on retrouve dans la plupart des routines.
  niche: boolean;
  // Mots-clés de recherche (besoins exprimés par l'utilisateur) pour la
  // barre "Vous cherchez un produit pour...".
  needs: string[];
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
    niche: false,
    needs: ["pores", "sebum", "peau grasse", "acne", "boutons", "brillance"],
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
    niche: false,
    needs: ["rides", "anti-age", "grain de peau", "acne", "cicatrices", "fermete"],
  },
  {
    id: "vitamine-c",
    name: "Vitamine C (acide ascorbique)",
    whatItDoes: "Antioxydant qui aide à unifier le teint et protège des agressions extérieures (pollution, UV).",
    howToUse: "Le matin, avant la crème et la protection solaire.",
    caution: "Certaines formes s'oxydent vite (couleur qui fonce) ; conserver à l'abri de la lumière.",
    exampleProduct: "La Roche-Posay Vitamine C10 Sérum",
    niche: false,
    needs: ["teint terne", "eclat", "taches", "antioxydant", "pollution", "teint irregulier"],
  },
  {
    id: "acide-hyaluronique",
    name: "Acide hyaluronique",
    whatItDoes: "Retient l'eau dans la peau : hydratation immédiate, effet repulpant.",
    howToUse: "Matin et soir, sur peau humide, avant de sceller avec une crème.",
    caution: "Sur peau très sèche et air sec, peut avoir l'effet inverse s'il n'est pas suivi d'une crème occlusive.",
    exampleProduct: "CeraVe Sérum Hydratant à l'Acide Hyaluronique",
    niche: false,
    needs: ["hydratation", "peau seche", "tiraillements", "repulpant"],
  },
  {
    id: "aha-bha",
    name: "AHA / BHA (acides exfoliants)",
    whatItDoes:
      "Les AHA (glycolique, lactique) lissent la surface et unifient le teint ; le BHA (acide salicylique) pénètre dans les pores, utile contre les points noirs.",
    howToUse: "Le soir, 1 à 3 fois par semaine, jamais en même temps que le rétinol.",
    caution: "Photosensibilisant : SPF obligatoire le matin qui suit. Ne pas cumuler plusieurs exfoliants le même soir.",
    exampleProduct: "Paula's Choice Skin Perfecting 2% BHA",
    niche: false,
    needs: ["points noirs", "grain de peau", "exfoliation", "pores", "teint irregulier", "boutons"],
  },
  {
    id: "ceramides",
    name: "Céramides",
    whatItDoes: "Restaurent la barrière cutanée et limitent la perte en eau : essentiels pour les peaux sèches ou irritées.",
    howToUse: "Matin et/ou soir, en dernière étape (crème), seuls ou associés à d'autres actifs.",
    caution: "Très bien tolérés, y compris avec du rétinol ou des exfoliants.",
    exampleProduct: "CeraVe Crème Hydratante Visage (céramides + acide hyaluronique)",
    niche: false,
    needs: ["barriere cutanee", "peau seche", "irritation", "sensibilite"],
  },
  {
    id: "spf",
    name: "Protection solaire (SPF 30-50)",
    whatItDoes:
      "Le geste le plus rentable de toute la routine : prévient le vieillissement prématuré, les taches et protège la peau après un actif exfoliant.",
    howToUse: "Tous les matins, même en hiver ou par temps couvert, en dernière étape avant le maquillage.",
    caution: "À réappliquer en cas d'exposition prolongée au soleil.",
    exampleProduct: "La Roche-Posay Anthelios UVMune 400",
    niche: false,
    needs: ["protection solaire", "vieillissement", "taches", "uv"],
  },
  {
    id: "acide-salicylique",
    name: "Acide salicylique (BHA ciblé)",
    whatItDoes:
      "Pénètre dans le pore pour dissoudre l'excès de sébum : idéal en soin ciblé sur boutons et points noirs, sans agresser tout le visage.",
    howToUse: "En stick ou gel, appliqué localement sur le bouton dès son apparition.",
    caution: "Peut assécher si utilisé sur toute la surface du visage trop souvent.",
    exampleProduct: "La Roche-Posay Effaclar Duo+",
    niche: false,
    needs: ["boutons", "points noirs", "peau grasse", "pores", "acne"],
  },
  {
    id: "acide-glycolique",
    name: "Acide glycolique",
    whatItDoes:
      "Le plus petit des AHA, il pénètre profondément : lisse la texture, atténue les petites cicatrices et redonne de l'éclat au teint terne.",
    howToUse: "Le soir, en tonique ou sérum, 1 à 2 fois par semaine au début.",
    caution: "Photosensibilisant, SPF indispensable le lendemain matin.",
    exampleProduct: "Pixi Glow Tonic",
    niche: false,
    needs: ["teint terne", "grain de peau", "texture", "eclat", "cicatrices"],
  },
  {
    id: "acide-lactique",
    name: "Acide lactique",
    whatItDoes:
      "L'AHA le plus doux : exfolie tout en hydratant, une bonne porte d'entrée pour qui n'a jamais utilisé d'acide exfoliant.",
    howToUse: "Le soir, 2 à 3 fois par semaine, en sérum ou lotion.",
    caution: "Moins irritant que le glycolique mais reste photosensibilisant.",
    exampleProduct: "The Ordinary Lactic Acid 5% + HA",
    niche: false,
    needs: ["peau sensible", "exfoliation douce", "hydratation", "debutant"],
  },
  {
    id: "squalane",
    name: "Squalane",
    whatItDoes:
      "Hydratant proche du sébum naturel de la peau : nourrit sans laisser de film gras et sans boucher les pores.",
    howToUse: "Quelques gouttes matin et/ou soir, seul ou mélangé à la crème.",
    caution: "Très bien toléré, y compris peaux grasses et acnéiques.",
    exampleProduct: "The Ordinary 100% Plant-Derived Squalane",
    niche: false,
    needs: ["hydratation", "peau grasse", "non comedogene", "sebum", "peau mixte"],
  },
  {
    id: "peptides",
    name: "Peptides de signalisation (Matrixyl)",
    whatItDoes:
      "Envoient à la peau le signal de produire plus de collagène : fermeté et rebond sur le moyen terme, en complément du rétinol.",
    howToUse: "Matin et/ou soir, en sérum, sous la crème.",
    caution: "Aucune précaution particulière, se combine bien avec le reste de la routine.",
    exampleProduct: "The Inkey List Multi-Peptide Serum",
    niche: false,
    needs: ["fermete", "rides", "anti-age", "elasticite"],
  },
  {
    id: "cafeine",
    name: "Caféine",
    whatItDoes:
      "Resserre les vaisseaux sanguins et décongestionne : très utile en soin contour des yeux contre les poches et cernes du matin.",
    howToUse: "Le matin, en roll-on ou crème contour des yeux, en tapotant sans frotter.",
    caution: "Aucune, applicable même sur peau sensible.",
    exampleProduct: "The Ordinary Caffeine Solution 5% + EGCG",
    niche: false,
    needs: ["cernes", "poches", "contour des yeux", "fatigue", "yeux gonfles"],
  },
  {
    id: "vitamine-e",
    name: "Vitamine E",
    whatItDoes:
      "Antioxydant nourrissant, souvent associé à la vitamine C pour la stabiliser et renforcer son efficacité contre le stress oxydatif.",
    howToUse: "Matin ou soir, en sérum ou huile, seule ou en complément d'un soin vitamine C.",
    caution: "Peut être comédogène en trop grande quantité sur peau grasse.",
    exampleProduct: "NIVEA Q10 Huile Sèche Vitamine E",
    niche: false,
    needs: ["antioxydant", "peau seche", "nourrissant"],
  },
  {
    id: "aloe-vera",
    name: "Aloe vera",
    whatItDoes:
      "Apaisant et légèrement cicatrisant : calme rapidement les rougeurs, les coups de soleil et les irritations post-rasage.",
    howToUse: "En gel pur, appliqué directement, autant de fois que nécessaire.",
    caution: "Vérifier l'absence d'alcool ou de parfum ajouté dans les gels du commerce.",
    exampleProduct: "Lily of the Desert Aloe Vera Gel 99.5%",
    niche: false,
    needs: ["apaisant", "coup de soleil", "irritation", "hydratation legere", "rasage"],
  },
  {
    id: "argile-verte",
    name: "Argile verte",
    whatItDoes:
      "Absorbe l'excès de sébum et les impuretés en profondeur : le masque purifiant de référence pour peau grasse à tendance acnéique.",
    howToUse: "En masque, 1 fois par semaine, 10 minutes maximum sans laisser sécher complètement.",
    caution: "Asséchante : à éviter sur peau déjà sensibilisée ou en cours de traitement rétinol.",
    exampleProduct: "L'Argile Verte Surfine Argiletz",
    niche: false,
    needs: ["peau grasse", "points noirs", "purifiant", "masque", "pores", "sebum"],
  },
  {
    id: "huile-jojoba",
    name: "Huile de jojoba",
    whatItDoes:
      "Sa composition proche du sébum humain permet de réguler la production naturelle de la peau sans l'obstruer, même sur peau mixte.",
    howToUse: "Quelques gouttes en dernière étape, matin ou soir.",
    caution: "Patch test recommandé, comme pour toute huile végétale.",
    exampleProduct: "Huile de Jojoba Bio Weleda",
    niche: false,
    needs: ["peau mixte", "hydratation", "non comedogene", "sebum"],
  },
  {
    id: "bakuchiol",
    name: "Bakuchiol",
    whatItDoes:
      "L'alternative végétale au rétinol, extraite d'une plante : effet lissant comparable, sans la sensibilité au soleil qui va avec.",
    howToUse: "Matin ou soir, en sérum, seul ou en alternance avec le rétinol.",
    caution: "Très bien toléré, y compris par les peaux réactives et pendant la grossesse.",
    exampleProduct: "Typology Sérum Bakuchiol",
    niche: true,
    needs: ["rides", "anti-age", "grain de peau", "peau sensible", "alternative retinol"],
  },
  {
    id: "acide-azelaique",
    name: "Acide azélaïque",
    whatItDoes:
      "Anti-imperfections et anti-taches très bien toléré, y compris par les peaux sensibles. Peut se combiner avec le rétinol, contrairement aux AHA/BHA.",
    howToUse: "Matin et/ou soir, en crème ou gel à 10-20 %.",
    caution: "Léger picotement possible les premiers jours, disparaît avec l'accoutumance.",
    exampleProduct: "The Ordinary Azelaic Acid Suspension 10%",
    niche: true,
    needs: ["boutons", "acne", "taches", "rosacee", "rougeurs", "teint irregulier"],
  },
  {
    id: "centella-asiatica",
    name: "Centella Asiatica (Cica)",
    whatItDoes:
      "Star du skincare coréen : répare la barrière cutanée et apaise les rougeurs. Parfait en soin de secours après un actif exfoliant trop agressif.",
    howToUse: "Le soir, en crème ou sérum, sur peau irritée ou fragilisée.",
    caution: "Aucune précaution particulière, convient aux peaux les plus réactives.",
    exampleProduct: "Purito Centella Green Level Buffet Serum",
    niche: true,
    needs: ["apaisant", "rougeurs", "sensibilite", "reparation", "barriere cutanee"],
  },
  {
    id: "peptides-cuivre",
    name: "Peptides de cuivre (GHK-Cu)",
    whatItDoes:
      "Stimulent la production naturelle de collagène : utiles en soin ciblé anti-âge, en général sous forme d'ampoule ou de sérum concentré.",
    howToUse: "Le soir, en cure de quelques semaines, sur peau nettoyée.",
    caution: "Ne pas mélanger avec la vitamine C ou les acides le même soir : ça neutralise l'effet du cuivre.",
    exampleProduct: "Osmosis MD Catalyst AC-11",
    niche: true,
    needs: ["fermete", "rides", "anti-age", "collagene", "cicatrisation"],
  },
  {
    id: "panthenol",
    name: "Panthénol (provitamine B5)",
    whatItDoes:
      "Apaise quasi instantanément : à utiliser après un exfoliant, un léger coup de soleil ou tout simplement en hydratant du quotidien.",
    howToUse: "Matin et/ou soir, seul ou mélangé à la crème habituelle.",
    caution: "Aucune, convient à tous les types de peau.",
    exampleProduct: "La Roche-Posay Cicaplast Baume B5",
    niche: true,
    needs: ["apaisant", "hydratation", "irritation", "reparation", "sensibilite"],
  },
  {
    id: "huile-rose-musquee",
    name: "Huile de rose musquée",
    whatItDoes:
      "Riche en acides gras et en vitamine A naturelle : aide à estomper les cicatrices d'acné et les taches sur plusieurs semaines d'utilisation régulière.",
    howToUse: "Le soir, quelques gouttes sur les zones marquées ou tout le visage.",
    caution: "S'oxyde vite : conserver au frais et à l'abri de la lumière.",
    exampleProduct: "Trilogy Rosehip Oil Antioxidant+",
    niche: true,
    needs: ["cicatrices", "taches", "anti-age", "nourrissant"],
  },
  {
    id: "acide-tranexamique",
    name: "Acide tranexamique",
    whatItDoes:
      "Cible spécifiquement les taches pigmentaires tenaces et le mélasma, souvent là où la vitamine C ne suffit plus.",
    howToUse: "Matin et/ou soir, en sérum, en cure de plusieurs semaines.",
    caution: "Résultats visibles seulement après plusieurs semaines d'usage régulier.",
    exampleProduct: "Naturium Tranexamic Acid Topical Acid Serum",
    niche: true,
    needs: ["taches", "melasma", "hyperpigmentation", "teint irregulier"],
  },
  {
    id: "acide-kojique",
    name: "Acide kojique",
    whatItDoes:
      "Éclaircissant dérivé de la fermentation du riz, utilisé pour uniformiser le teint et atténuer les marques post-acné.",
    howToUse: "Le soir, en sérum, en alternance avec les autres actifs pour éviter la surcharge.",
    caution: "Peut sensibiliser la peau au soleil : SPF impératif le lendemain.",
    exampleProduct: "PIXI Beauty Kojic Serum",
    niche: true,
    needs: ["taches", "eclaircissant", "teint irregulier", "marques"],
  },
  {
    id: "arbutine",
    name: "Arbutine",
    whatItDoes:
      "Alternative plus douce à l'hydroquinone pour éclaircir les taches, extraite de plantes comme la busserole.",
    howToUse: "Matin et/ou soir, en sérum, sur plusieurs semaines.",
    caution: "Bien tolérée, mais efficacité progressive : pas de résultat en quelques jours.",
    exampleProduct: "The Ordinary Alpha Arbutin 2% + HA",
    niche: true,
    needs: ["taches", "eclaircissant doux", "hyperpigmentation", "teint irregulier"],
  },
  {
    id: "zinc-pca",
    name: "Zinc PCA",
    whatItDoes:
      "Régule le sébum et calme l'inflammation liée à l'acné, sans assécher autant qu'un actif exfoliant classique.",
    howToUse: "Matin et/ou soir, en sérum ou lotion, sur peau grasse à imperfections.",
    caution: "Aucune précaution particulière.",
    exampleProduct: "The Ordinary Niacinamide 10% + Zinc 1%",
    niche: true,
    needs: ["peau grasse", "acne", "sebum", "inflammation", "boutons"],
  },
  {
    id: "bisabolol",
    name: "Bisabolol",
    whatItDoes:
      "Extrait de camomille purifié, un des apaisants les plus puissants du marché : calme les rougeurs en quelques minutes.",
    howToUse: "Matin et/ou soir, en sérum, seul ou associé à un actif potentiellement irritant.",
    caution: "Aucune, très bien toléré même par les peaux les plus réactives.",
    exampleProduct: "Typology Sérum au Bisabolol",
    niche: true,
    needs: ["apaisant", "rougeurs", "sensibilite", "camomille"],
  },
  {
    id: "ectoine",
    name: "Ectoïne",
    whatItDoes:
      "Molécule protectrice qui retient l'eau et bouclier la peau contre le stress environnemental (pollution, écrans, air sec).",
    howToUse: "Matin, sous la crème, particulièrement utile en environnement urbain ou climatisé.",
    caution: "Aucune, convient aux peaux les plus fragiles.",
    exampleProduct: "Gallinée Ectoine Shield Serum",
    niche: true,
    needs: ["hydratation extreme", "peau reactive", "pollution", "stress environnemental"],
  },
  {
    id: "argireline",
    name: "Argireline",
    whatItDoes:
      "Peptide surnommé « botox naturel » : détend légèrement les muscles du visage pour atténuer les rides d'expression, notamment le front.",
    howToUse: "Le soir, en sérum, sur les zones d'expression (front, contour des yeux).",
    caution: "Effet plus subtil que le botox, résultats progressifs sur plusieurs semaines.",
    exampleProduct: "The Inkey List Peptide Moisturizer",
    niche: true,
    needs: ["rides d'expression", "anti-age", "front", "peptide"],
  },
  {
    id: "extrait-reglisse",
    name: "Extrait de réglisse",
    whatItDoes:
      "Éclaircissant doux et apaisant à la fois : atténue les taches tout en calmant les rougeurs, un deux-en-un peu connu.",
    howToUse: "Matin et/ou soir, en sérum ou essence.",
    caution: "Aucune précaution particulière.",
    exampleProduct: "COSRX Licorice Extract Vitamin C Serum",
    niche: true,
    needs: ["taches", "apaisant", "eclaircissant", "rougeurs"],
  },
  {
    id: "huile-nigelle",
    name: "Huile de nigelle (habba sawda)",
    whatItDoes:
      "Utilisée depuis des siècles pour ses propriétés antibactériennes naturelles : apaise les imperfections sans agresser la barrière cutanée.",
    howToUse: "Quelques gouttes le soir, en soin ciblé ou mélangées à la crème de nuit.",
    caution: "Odeur prononcée ; patch test recommandé avant application sur tout le visage.",
    exampleProduct: "Huile de Nigelle Bio Aromazone",
    niche: true,
    needs: ["acne", "antibacterien naturel", "apaisant", "imperfections"],
  },
  {
    id: "charbon-actif",
    name: "Charbon actif",
    whatItDoes:
      "Absorbe l'excès de sébum et les impuretés en surface : un masque purifiant ponctuel plutôt qu'un soin du quotidien.",
    howToUse: "En masque, 1 fois par semaine maximum, 10 minutes.",
    caution: "Peut être asséchant : à réserver aux zones grasses (zone T) sur peau mixte.",
    exampleProduct: "Origins Clear Improvement Charcoal Mask",
    niche: true,
    needs: ["purifiant", "peau grasse", "masque", "pores", "points noirs"],
  },
];

const DIACRITICS_PATTERN = new RegExp("[\\u0300-\\u036f]", "g");

function normalize(value: string) {
  return value.toLowerCase().normalize("NFD").replace(DIACRITICS_PATTERN, "");
}

// Recherche par besoin exprimé librement ("j'ai des boutons", "peau sèche"...) :
// tout mot de 2 caractères ou plus retrouvé dans le nom, l'usage ou les
// mots-clés d'un ingrédient suffit à le faire remonter.
export function searchSkincareIngredients(query: string): SkincareIngredient[] {
  const words = normalize(query)
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 2);
  if (words.length === 0) return skincareIngredients;

  return skincareIngredients.filter((ingredient) => {
    const haystack = normalize(
      [ingredient.name, ingredient.whatItDoes, ...ingredient.needs].join(" ")
    );
    return words.some((word) => haystack.includes(word));
  });
}
