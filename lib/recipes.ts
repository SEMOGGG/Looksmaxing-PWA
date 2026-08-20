// Livre de recettes de l'onglet Nutrition : recettes éditoriales (gérées
// depuis /admin/recipes) + recettes proposées par les membres, mises en
// attente jusqu'à validation par un admin (voir app/actions/recipes.ts).
//
// Ce fichier ne contient que ce qui est sûr à utiliser aussi bien côté
// client que serveur (types, étiquettes, contenu de démo/seed). L'accès aux
// données réelles (Supabase) vit dans les Server Actions correspondantes.

export type RecipeTag = { id: string; label: string };

// Étiquettes fixes, affichées comme des filtres cliquables au-dessus du
// livre de recettes (même principe que skincareNeeds dans lib/skincare.ts).
export const recipeTags: RecipeTag[] = [
  { id: "proteine", label: "Riche en protéines" },
  { id: "glucides", label: "Riche en glucides" },
  { id: "potassium", label: "Riche en potassium" },
  { id: "whey", label: "À la whey" },
  { id: "creme-de-riz", label: "À la crème de riz" },
  { id: "rapide", label: "Rapide (< 10 min)" },
  { id: "petit-dejeuner", label: "Petit-déjeuner" },
  { id: "collation", label: "Collation / snack" },
];

export type Recipe = {
  id: string;
  title: string;
  description: string;
  // Identifiants de recipeTags.
  tags: string[];
  prepMinutes: number;
  servings: number;
  // Valeurs approximatives par portion.
  calories: number;
  proteinG: number;
  carbsG: number;
  ingredients: string[];
  steps: string[];
  tip: string | null;
  // Photo ajoutée depuis /admin/recipes (jamais fournie par une proposition
  // de membre : une URL d'image externe non modérée ne doit jamais
  // s'afficher publiquement sans validation d'un admin). Tant qu'aucune
  // photo n'est définie, getRecipeVisual fournit un habillage par défaut.
  imageUrl: string | null;
};

// Habillage visuel par défaut (dégradé + emoji) tant qu'aucune photo n'a été
// ajoutée depuis /admin/recipes — dérivé des étiquettes plutôt que stocké,
// pour ne pas ajouter de colonne rien que pour ça. L'ordre reflète une
// priorité d'affichage (une recette "whey" prime sur "riche en protéines").
const VISUAL_BY_TAG: Record<string, { emoji: string; gradient: string }> = {
  "creme-de-riz": { emoji: "🍚", gradient: "linear-gradient(135deg, #f4d9a0 0%, #ffb86b 100%)" },
  whey: { emoji: "🥤", gradient: "linear-gradient(135deg, #8b5cf6 0%, #ff5da2 100%)" },
  proteine: { emoji: "🍗", gradient: "linear-gradient(135deg, #ff8a65 0%, #ff5da2 100%)" },
  potassium: { emoji: "🍌", gradient: "linear-gradient(135deg, #4ade80 0%, #22d3ee 100%)" },
  glucides: { emoji: "🍞", gradient: "linear-gradient(135deg, #ffd166 0%, #ff8a65 100%)" },
  collation: { emoji: "🍫", gradient: "linear-gradient(135deg, #a78bfa 0%, #ff8a65 100%)" },
  "petit-dejeuner": { emoji: "🌅", gradient: "linear-gradient(135deg, #ffd166 0%, #a78bfa 100%)" },
  rapide: { emoji: "⚡", gradient: "linear-gradient(135deg, #22d3ee 0%, #8b5cf6 100%)" },
};

export function getRecipeVisual(tags: string[]): { emoji: string; gradient: string } {
  for (const tagId of Object.keys(VISUAL_BY_TAG)) {
    if (tags.includes(tagId)) return VISUAL_BY_TAG[tagId];
  }
  return { emoji: "🍽️", gradient: "linear-gradient(135deg, #8b5cf6 0%, #ff5da2 100%)" };
}

// Recettes injectées une seule fois si la table recipes est vide (voir
// seedIfEmpty dans app/actions/recipes.ts), pour que le livre de recettes
// ne démarre pas vide — modifiables ensuite depuis /admin/recipes. Un mélange
// de classiques "riches en protéines/glucides/potassium" et de recettes à la
// whey / crème de riz, dans l'esprit de ce qu'on trouve couramment partagé
// et testé dans la communauté fitness.
export const seedRecipes: Omit<Recipe, "id" | "imageUrl">[] = [
  {
    title: "Bowl de poulet, riz et brocolis",
    description: "Le grand classique post-training : simple, rapide à préparer en quantité, et qui tient toute la soirée.",
    tags: ["proteine", "glucides"],
    prepMinutes: 20,
    servings: 1,
    calories: 520,
    proteinG: 45,
    carbsG: 55,
    ingredients: [
      "150 g de blanc de poulet",
      "80 g de riz basmati (poids cru)",
      "150 g de brocolis",
      "1 c. à soupe d'huile d'olive",
      "Sel, poivre, paprika",
    ],
    steps: [
      "Faites cuire le riz dans l'eau bouillante salée selon les indications du paquet.",
      "Coupez le poulet en morceaux, assaisonnez et faites-le dorer à la poêle avec l'huile d'olive, 8-10 minutes.",
      "Faites cuire les brocolis à la vapeur 5-6 minutes, ils doivent rester légèrement croquants.",
      "Assemblez le riz, le poulet et les brocolis dans un bol.",
    ],
    tip: "Doublez les quantités et gardez une portion au frigo : c'est encore meilleur réchauffé le lendemain.",
  },
  {
    title: "Pancakes protéinés à la whey",
    description: "Des pancakes moelleux qui remplacent la version classique sans perdre en gourmandise.",
    tags: ["proteine", "whey", "petit-dejeuner"],
    prepMinutes: 15,
    servings: 1,
    calories: 380,
    proteinG: 35,
    carbsG: 30,
    ingredients: [
      "1 dose (30 g) de whey vanille ou nature",
      "2 œufs",
      "40 g de flocons d'avoine mixés",
      "1/2 banane écrasée",
      "1/2 sachet de levure chimique",
      "Un peu de lait pour ajuster la texture",
    ],
    steps: [
      "Mixez ou fouettez tous les ingrédients ensemble jusqu'à obtenir une pâte lisse et coulante.",
      "Faites chauffer une poêle antiadhésive à feu moyen, légèrement huilée.",
      "Versez une petite louche de pâte par pancake, cuisez 2 minutes de chaque côté jusqu'à coloration.",
      "Empilez et servez avec des fruits frais ou un filet de miel.",
    ],
    tip: "Si la pâte est trop épaisse, ajoutez du lait cuillère par cuillère plutôt que d'en mettre trop d'un coup.",
  },
  {
    title: "Porridge à la crème de riz et banane",
    description: "Une base de crème de riz simple, sucrée naturellement avec la banane, pour un petit-déjeuner qui cale.",
    tags: ["glucides", "creme-de-riz", "potassium", "petit-dejeuner"],
    prepMinutes: 10,
    servings: 1,
    calories: 340,
    proteinG: 8,
    carbsG: 65,
    ingredients: [
      "50 g de crème de riz (poids sec)",
      "250 ml de lait (ou lait végétal)",
      "1 banane",
      "1 c. à café de cannelle",
      "Une pincée de sel",
    ],
    steps: [
      "Faites chauffer le lait dans une casserole à feu moyen.",
      "Versez la crème de riz en pluie tout en fouettant pour éviter les grumeaux.",
      "Laissez épaissir 3-4 minutes à feu doux sans cesser de remuer.",
      "Servez avec la banane coupée en rondelles et la cannelle saupoudrée dessus.",
    ],
    tip: "La crème de riz épaissit vite en refroidissant : servez-la légèrement plus liquide que la texture voulue.",
  },
  {
    title: "Smoothie whey, banane et lait d'avoine",
    description: "Le shake post-training le plus rapide à préparer, prêt en moins de 5 minutes.",
    tags: ["proteine", "whey", "potassium", "rapide", "collation"],
    prepMinutes: 5,
    servings: 1,
    calories: 310,
    proteinG: 30,
    carbsG: 35,
    ingredients: [
      "1 dose (30 g) de whey vanille",
      "1 banane",
      "250 ml de lait d'avoine",
      "5-6 glaçons",
      "1 c. à café de beurre de cacahuète (facultatif)",
    ],
    steps: [
      "Placez tous les ingrédients dans un blender.",
      "Mixez 30-40 secondes jusqu'à obtenir une texture bien lisse.",
      "Servez immédiatement dans un grand verre.",
    ],
    tip: "Congelez vos bananes mûres à l'avance : le smoothie sera plus onctueux, façon milkshake.",
  },
  {
    title: "Patate douce rôtie au four",
    description: "L'accompagnement riche en potassium le plus simple à préparer, qui se marie avec n'importe quelle protéine.",
    tags: ["glucides", "potassium"],
    prepMinutes: 40,
    servings: 2,
    calories: 180,
    proteinG: 3,
    carbsG: 40,
    ingredients: [
      "2 patates douces moyennes",
      "1 c. à soupe d'huile d'olive",
      "Paprika, sel, poivre",
    ],
    steps: [
      "Préchauffez le four à 200°C.",
      "Coupez les patates douces en quartiers, sans les éplucher.",
      "Mélangez-les avec l'huile et les épices dans un saladier.",
      "Étalez sur une plaque et enfournez 35-40 minutes, en retournant à mi-cuisson.",
    ],
    tip: "Ne les serrez pas trop sur la plaque : elles doivent rôtir, pas cuire à la vapeur.",
  },
  {
    title: "Omelette au fromage blanc et épinards",
    description: "Une omelette moelleuse grâce au fromage blanc, avec un bon apport en potassium via les épinards.",
    tags: ["proteine", "potassium", "rapide"],
    prepMinutes: 10,
    servings: 1,
    calories: 320,
    proteinG: 28,
    carbsG: 6,
    ingredients: [
      "3 œufs",
      "2 c. à soupe de fromage blanc 0-3%",
      "80 g d'épinards frais",
      "Sel, poivre, muscade",
    ],
    steps: [
      "Fouettez les œufs avec le fromage blanc, salez et poivrez.",
      "Faites tomber les épinards 1-2 minutes dans une poêle chaude, réservez.",
      "Versez le mélange d'œufs dans la poêle légèrement huilée, cuisez à feu doux.",
      "Ajoutez les épinards sur la moitié de l'omelette, repliez et servez.",
    ],
    tip: "Le fromage blanc remplace une partie du lait classique : l'omelette reste moelleuse sans matière grasse ajoutée.",
  },
  {
    title: "Riz au thon et maïs",
    description: "Un repas qui se prépare en avance sans problème, parfait pour les lunchbox de la semaine.",
    tags: ["proteine", "glucides"],
    prepMinutes: 20,
    servings: 2,
    calories: 460,
    proteinG: 32,
    carbsG: 60,
    ingredients: [
      "150 g de riz (poids cru)",
      "2 boîtes de thon au naturel",
      "150 g de maïs",
      "1 c. à soupe de sauce soja",
      "1 filet de citron",
    ],
    steps: [
      "Faites cuire le riz selon les indications du paquet, puis laissez tiédir.",
      "Égouttez le thon et le maïs.",
      "Mélangez le riz, le thon et le maïs dans un grand saladier.",
      "Assaisonnez avec la sauce soja et le jus de citron, mélangez bien.",
    ],
    tip: "Se mange aussi bien tiède que froid : parfait pour préparer plusieurs portions à l'avance.",
  },
  {
    title: "Overnight oats à la whey",
    description: "À préparer la veille au soir : le petit-déjeuner est prêt en sortant du lit, aucune cuisson nécessaire.",
    tags: ["proteine", "whey", "glucides", "petit-dejeuner"],
    prepMinutes: 5,
    servings: 1,
    calories: 400,
    proteinG: 32,
    carbsG: 45,
    ingredients: [
      "50 g de flocons d'avoine",
      "1 dose (30 g) de whey",
      "150 ml de lait",
      "1 c. à soupe de yaourt grec",
      "Fruits rouges au moment de servir",
    ],
    steps: [
      "Mélangez les flocons d'avoine, la whey, le lait et le yaourt grec dans un bocal.",
      "Fermez et placez au réfrigérateur toute la nuit (minimum 4 heures).",
      "Le lendemain, mélangez et ajoutez les fruits rouges avant de déguster.",
    ],
    tip: "Si le mélange est trop épais le matin, détendez avec un peu de lait froid.",
  },
  {
    title: "Salade de quinoa, pois chiches et avocat",
    description: "Un plat complet et frais, riche en protéines végétales et en potassium grâce à l'avocat.",
    tags: ["proteine", "glucides", "potassium"],
    prepMinutes: 20,
    servings: 2,
    calories: 420,
    proteinG: 16,
    carbsG: 48,
    ingredients: [
      "150 g de quinoa (poids cru)",
      "1 boîte de pois chiches",
      "1 avocat",
      "1/2 concombre",
      "Jus de citron, huile d'olive, sel",
    ],
    steps: [
      "Rincez le quinoa et faites-le cuire dans deux fois son volume d'eau salée, 15 minutes.",
      "Égouttez et rincez les pois chiches.",
      "Coupez l'avocat et le concombre en dés.",
      "Mélangez tous les ingrédients dans un saladier, assaisonnez avec citron et huile d'olive.",
    ],
    tip: "Ajoutez l'avocat juste avant de servir pour qu'il ne s'oxyde pas si vous préparez la salade à l'avance.",
  },
  {
    title: "Wrap au poulet et yaourt grec",
    description: "Une sauce au yaourt grec plutôt qu'à la mayonnaise classique, pour un wrap léger mais qui tient bien en bouche.",
    tags: ["proteine", "rapide"],
    prepMinutes: 15,
    servings: 1,
    calories: 440,
    proteinG: 38,
    carbsG: 35,
    ingredients: [
      "1 galette de blé complet",
      "120 g de blanc de poulet cuit et effiloché",
      "2 c. à soupe de yaourt grec",
      "1/2 c. à café de moutarde",
      "Salade, tomate, concombre",
    ],
    steps: [
      "Mélangez le yaourt grec avec la moutarde, salez et poivrez.",
      "Étalez la sauce sur la galette.",
      "Garnissez avec le poulet effiloché et les légumes.",
      "Roulez fermement et coupez en deux.",
    ],
    tip: "Réchauffez brièvement la galette 10 secondes au micro-ondes avant de la garnir : elle se roule beaucoup mieux sans craquer.",
  },
  {
    title: "Chia pudding à la whey chocolat",
    description: "Une collation qui se prépare la veille, entre le dessert et le en-cas protéiné.",
    tags: ["proteine", "whey", "collation"],
    prepMinutes: 5,
    servings: 1,
    calories: 290,
    proteinG: 27,
    carbsG: 20,
    ingredients: [
      "3 c. à soupe de graines de chia",
      "1 dose (30 g) de whey chocolat",
      "200 ml de lait végétal",
      "Fruits ou copeaux de chocolat noir pour finir",
    ],
    steps: [
      "Mélangez les graines de chia, la whey et le lait dans un bocal.",
      "Fouettez bien pour éviter que les graines ne s'agglutinent.",
      "Placez au réfrigérateur au moins 3 heures, idéalement toute la nuit.",
      "Mélangez à nouveau avant de servir et garnissez selon vos envies.",
    ],
    tip: "Fouettez une deuxième fois après 30 minutes de repos : ça évite que les graines de chia ne forment des paquets au fond.",
  },
  {
    title: "Purée de patate douce et haricots blancs",
    description: "Une purée plus riche en protéines qu'une purée classique, grâce aux haricots blancs mixés dedans.",
    tags: ["glucides", "potassium"],
    prepMinutes: 30,
    servings: 2,
    calories: 260,
    proteinG: 10,
    carbsG: 48,
    ingredients: [
      "2 patates douces",
      "1 boîte de haricots blancs",
      "1 filet d'huile d'olive",
      "Sel, poivre, ail en poudre",
    ],
    steps: [
      "Épluchez et coupez les patates douces en cubes, faites-les cuire à l'eau bouillante 15-20 minutes.",
      "Égouttez et rincez les haricots blancs.",
      "Mixez les patates douces et les haricots blancs ensemble avec l'huile d'olive.",
      "Assaisonnez et rectifiez la texture avec un peu d'eau de cuisson si besoin.",
    ],
    tip: "Les haricots blancs sont neutres en goût une fois mixés : ils épaississent la purée sans la dénaturer.",
  },
  {
    title: "Bowl de riz, saumon et edamame",
    description: "Un bowl inspiré des poke bowls, riche en oméga-3 et en potassium grâce aux edamame.",
    tags: ["proteine", "glucides", "potassium"],
    prepMinutes: 25,
    servings: 1,
    calories: 540,
    proteinG: 38,
    carbsG: 50,
    ingredients: [
      "120 g de filet de saumon",
      "80 g de riz (poids cru)",
      "80 g d'edamame décortiqués",
      "1/2 avocat",
      "Sauce soja, graines de sésame",
    ],
    steps: [
      "Faites cuire le riz selon les indications du paquet.",
      "Faites cuire le saumon à la poêle ou au four, 4-5 minutes de chaque côté.",
      "Faites cuire les edamame à l'eau bouillante quelques minutes.",
      "Assemblez le riz, le saumon émietté, les edamame et l'avocat, arrosez de sauce soja.",
    ],
    tip: "Le saumon surgelé en filet individuel fonctionne très bien ici, pas besoin de version fraîche.",
  },
  {
    title: "Crème de riz protéinée post-training",
    description: "Le combo classique whey + crème de riz pour refaire les stocks de glycogène juste après l'entraînement.",
    tags: ["whey", "creme-de-riz", "glucides", "rapide"],
    prepMinutes: 8,
    servings: 1,
    calories: 380,
    proteinG: 32,
    carbsG: 55,
    ingredients: [
      "50 g de crème de riz (poids sec)",
      "1 dose (30 g) de whey vanille",
      "300 ml d'eau ou de lait",
      "1 c. à café de miel (facultatif)",
    ],
    steps: [
      "Faites chauffer l'eau ou le lait dans une casserole.",
      "Versez la crème de riz en pluie en fouettant, laissez épaissir 3 minutes.",
      "Retirez du feu et laissez tiédir 1-2 minutes avant d'incorporer la whey (la chaleur excessive peut la faire grumeler).",
      "Mélangez bien jusqu'à obtenir une texture lisse, ajoutez le miel si besoin.",
    ],
    tip: "N'ajoutez jamais la whey pendant que le mélange bout : attendez qu'il tiédisse pour garder une texture lisse.",
  },
  {
    title: "Toast à l'avocat et œuf poché",
    description: "Un petit-déjeuner riche en potassium, simple mais qui demande un peu de technique pour l'œuf poché.",
    tags: ["glucides", "potassium", "petit-dejeuner"],
    prepMinutes: 12,
    servings: 1,
    calories: 350,
    proteinG: 16,
    carbsG: 30,
    ingredients: [
      "2 tranches de pain complet",
      "1/2 avocat",
      "1 œuf",
      "1 c. à soupe de vinaigre blanc",
      "Sel, poivre, piment d'Espelette",
    ],
    steps: [
      "Faites chauffer une casserole d'eau avec le vinaigre, sans faire bouillir fort.",
      "Créez un tourbillon avec une cuillère et cassez l'œuf au centre, laissez cuire 3 minutes.",
      "Pendant ce temps, écrasez l'avocat à la fourchette avec sel et poivre, tartinez sur le pain toasté.",
      "Déposez l'œuf poché sur le toast, saupoudrez de piment d'Espelette.",
    ],
    tip: "Cassez l'œuf dans une petite tasse avant de le glisser dans l'eau : ça évite de rater le geste au-dessus de la casserole.",
  },
  {
    title: "Skyr aux fruits rouges et granola",
    description: "Une collation prête en 2 minutes, avec un skyr très riche en protéines pour un faible apport calorique.",
    tags: ["proteine", "glucides", "rapide", "collation"],
    prepMinutes: 3,
    servings: 1,
    calories: 280,
    proteinG: 25,
    carbsG: 30,
    ingredients: [
      "200 g de skyr nature",
      "80 g de fruits rouges (frais ou surgelés)",
      "20 g de granola",
      "1 filet de miel (facultatif)",
    ],
    steps: [
      "Versez le skyr dans un bol.",
      "Ajoutez les fruits rouges par-dessus.",
      "Terminez avec le granola et le filet de miel juste avant de servir, pour qu'il reste croustillant.",
    ],
    tip: "Ajoutez le granola au dernier moment : s'il trempe trop longtemps dans le skyr, il perd son croquant.",
  },
  {
    title: "Poêlée de bœuf haché, riz complet et brocolis",
    description: "Une version simple et rapide du bowl protéiné, avec un riz complet qui apporte plus de fibres.",
    tags: ["proteine", "glucides"],
    prepMinutes: 20,
    servings: 1,
    calories: 550,
    proteinG: 40,
    carbsG: 50,
    ingredients: [
      "150 g de bœuf haché 5% MG",
      "80 g de riz complet (poids cru)",
      "150 g de brocolis",
      "1 gousse d'ail, sauce soja",
    ],
    steps: [
      "Faites cuire le riz complet selon les indications du paquet (généralement plus long qu'un riz blanc).",
      "Faites revenir le bœuf haché à la poêle avec l'ail émincé, jusqu'à coloration.",
      "Faites cuire les brocolis à la vapeur 6-7 minutes.",
      "Assemblez le tout et ajoutez un filet de sauce soja.",
    ],
    tip: "Égouttez bien le gras rendu par le bœuf haché en cours de cuisson si vous voulez alléger le plat.",
  },
  {
    title: "Banana bread protéiné à la whey",
    description: "Une version du banana bread classique qui se prépare en grande quantité pour la semaine.",
    tags: ["proteine", "whey", "glucides"],
    prepMinutes: 50,
    servings: 8,
    calories: 190,
    proteinG: 10,
    carbsG: 26,
    ingredients: [
      "3 bananes bien mûres",
      "2 doses (60 g) de whey vanille",
      "150 g de flocons d'avoine mixés en farine",
      "2 œufs",
      "1 sachet de levure chimique",
      "1 c. à café de cannelle",
    ],
    steps: [
      "Préchauffez le four à 180°C et préparez un moule à cake.",
      "Écrasez les bananes à la fourchette dans un grand saladier.",
      "Ajoutez les œufs, la whey, la farine d'avoine, la levure et la cannelle, mélangez jusqu'à obtenir une pâte homogène.",
      "Versez dans le moule et enfournez 35-40 minutes (vérifiez la cuisson avec la pointe d'un couteau).",
    ],
    tip: "Utilisez des bananes très mûres, presque noires : elles sucrent naturellement le gâteau sans sucre ajouté.",
  },
  {
    title: "Bowl de lentilles corail et épinards",
    description: "Un plat végétarien riche en protéines et en potassium, prêt en moins de 30 minutes sans trempage.",
    tags: ["proteine", "potassium"],
    prepMinutes: 25,
    servings: 2,
    calories: 320,
    proteinG: 20,
    carbsG: 42,
    ingredients: [
      "150 g de lentilles corail (poids cru)",
      "100 g d'épinards frais",
      "1 oignon, 1 gousse d'ail",
      "1 c. à café de cumin",
      "Bouillon de légumes",
    ],
    steps: [
      "Faites revenir l'oignon et l'ail émincés dans une casserole avec un filet d'huile.",
      "Ajoutez les lentilles corail et le cumin, mélangez.",
      "Couvrez de bouillon et laissez mijoter 15-18 minutes jusqu'à ce que les lentilles soient fondantes.",
      "Ajoutez les épinards en fin de cuisson, laissez-les tomber 2 minutes avant de servir.",
    ],
    tip: "Les lentilles corail n'ont pas besoin de trempage préalable, contrairement aux lentilles vertes : un vrai gain de temps.",
  },
  {
    title: "Milkshake whey, beurre de cacahuète et banane",
    description: "Plus gourmand qu'un shake classique, pensé pour les jours où l'appétit manque après une grosse séance.",
    tags: ["proteine", "whey", "potassium", "collation"],
    prepMinutes: 5,
    servings: 1,
    calories: 420,
    proteinG: 32,
    carbsG: 32,
    ingredients: [
      "1 dose (30 g) de whey vanille ou chocolat",
      "1 banane",
      "1 c. à soupe de beurre de cacahuète",
      "250 ml de lait",
      "Glaçons",
    ],
    steps: [
      "Placez tous les ingrédients dans un blender.",
      "Mixez jusqu'à obtenir une texture bien lisse et crémeuse.",
      "Servez immédiatement, éventuellement avec un filet de beurre de cacahuète sur le dessus.",
    ],
    tip: "Comptez ce shake comme un vrai repas ou une grosse collation : avec le beurre de cacahuète, il est plus calorique qu'un shake classique.",
  },
  {
    title: "Riz au lait de crème de riz, façon dessert",
    description: "Une version dessert de la crème de riz classique, pour une envie de sucré qui reste raisonnable.",
    tags: ["glucides", "creme-de-riz", "collation"],
    prepMinutes: 12,
    servings: 1,
    calories: 300,
    proteinG: 9,
    carbsG: 52,
    ingredients: [
      "50 g de crème de riz (poids sec)",
      "300 ml de lait",
      "1 c. à soupe de sucre ou d'édulcorant",
      "1 gousse de vanille ou extrait de vanille",
      "Cannelle pour saupoudrer",
    ],
    steps: [
      "Faites chauffer le lait avec la vanille dans une casserole.",
      "Versez la crème de riz en pluie en fouettant continuellement.",
      "Laissez épaissir 3-4 minutes à feu doux, ajoutez le sucre en fin de cuisson.",
      "Versez dans un bol, saupoudrez de cannelle et laissez tiédir avant de déguster.",
    ],
    tip: "Se déguste aussi bien tiède que froid après quelques heures au réfrigérateur, comme un vrai riz au lait.",
  },
];

// Filtre par étiquette cliquable (id de recipeTags). null/absent = pas de
// filtre, on retourne le livre de recettes tel quel.
export function filterRecipes(recipes: Recipe[], tagId: string | null): Recipe[] {
  if (!tagId) return recipes;
  return recipes.filter((recipe) => recipe.tags.includes(tagId));
}
