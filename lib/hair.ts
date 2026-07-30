// Données mock pour l'analyse capillaire (cheveux & barbe). Aucune analyse
// d'image réelle : la personne choisit elle-même la forme de son visage
// parmi les silhouettes proposées, et reçoit des suggestions générales
// (contenu éditorial, pas un diagnostic).

export type FaceShape = "ovale" | "rond" | "carre" | "rectangle" | "coeur" | "triangle";

export type FaceShapeInfo = {
  value: FaceShape;
  label: string;
  description: string;
  hairStyles: string[];
  beardStyles: string[];
};

export const faceShapes: FaceShapeInfo[] = [
  {
    value: "ovale",
    label: "Ovale",
    description:
      "Des proportions équilibrées qui s'accordent avec la plupart des coupes et styles de barbe.",
    hairStyles: [
      "Quasiment toutes les coupes fonctionnent : dégradé classique, texturé sur le dessus, ou coupe longue.",
      "C'est une bonne base pour oser une frange ou une raie marquée.",
    ],
    beardStyles: [
      "Barbe pleine ou courte : les deux mettent en valeur des traits déjà équilibrés.",
      "Une barbe légèrement dégradée sur les joues garde une ligne nette sans casser les proportions.",
    ],
  },
  {
    value: "rond",
    label: "Rond",
    description:
      "Des joues pleines et une largeur de visage proche de la hauteur ; les coupes qui allongent visuellement font ressortir les traits.",
    hairStyles: [
      "Volume sur le dessus, court sur les côtés : ça allonge visuellement le visage.",
      "Éviter les coupes très courtes sur toute la tête, qui accentuent la rondeur.",
    ],
    beardStyles: [
      "Barbe plus fournie au menton, dégradée sur les joues : ça structure et allonge le bas du visage.",
      "Garder une ligne de contour nette le long de la mâchoire pour marquer l'angle.",
    ],
  },
  {
    value: "carre",
    label: "Carré",
    description:
      "Une mâchoire marquée et un front large ; les coupes qui adoucissent les angles créent un bel équilibre.",
    hairStyles: [
      "Des textures souples sur le dessus (mèches mi-longues, mouvement naturel) adoucissent les angles.",
      "Éviter les lignes très droites et nettes qui accentuent la carrure de la mâchoire.",
    ],
    beardStyles: [
      "Une barbe courte et légèrement arrondie sur les contours adoucit la mâchoire sans la cacher.",
      "Éviter les lignes trop géométriques qui renforcent l'effet carré.",
    ],
  },
  {
    value: "rectangle",
    label: "Rectangle / long",
    description:
      "Un visage plus long que large ; les coupes qui apportent de la largeur équilibrent les proportions.",
    hairStyles: [
      "Volume sur les côtés plutôt qu'en hauteur, pour apporter de la largeur visuelle.",
      "Une frange courte peut raccourcir visuellement le visage.",
    ],
    beardStyles: [
      "Une barbe plus fournie sur les côtés (favoris, joues) élargit visuellement le visage.",
      "Éviter une barbe longue au menton, qui accentue encore la longueur.",
    ],
  },
  {
    value: "coeur",
    label: "Cœur",
    description:
      "Un front plus large que le menton ; les styles qui apportent du volume au niveau du menton rééquilibrent les proportions.",
    hairStyles: [
      "Une frange balayée ou une raie sur le côté atténue la largeur du front.",
      "Éviter trop de volume tout en haut, qui accentue le déséquilibre front/menton.",
    ],
    beardStyles: [
      "Une barbe pleine, un peu plus fournie au menton, ajoute de la largeur dans le bas du visage.",
      "Le bouc ou la barbe très courte sont à éviter, ils dégagent trop le menton.",
    ],
  },
  {
    value: "triangle",
    label: "Triangle",
    description:
      "Une mâchoire plus large que le front ; les styles qui ajoutent du volume en haut créent un bel équilibre.",
    hairStyles: [
      "Du volume sur le dessus et les côtés dégagés équilibrent une mâchoire plus large.",
      "Éviter les coupes très plates sur le dessus.",
    ],
    beardStyles: [
      "Une barbe plus courte sur la mâchoire évite d'accentuer sa largeur.",
      "Garder les favoris fournis pour équilibrer avec le haut du visage.",
    ],
  },
];

const FACE_SHAPE_KEY = "faciem_face_shape";

export function loadFaceShape(): FaceShape | null {
  try {
    const stored = window.localStorage.getItem(FACE_SHAPE_KEY);
    return (faceShapes.find((f) => f.value === stored)?.value as FaceShape) ?? null;
  } catch {
    return null;
  }
}

export function saveFaceShape(shape: FaceShape) {
  try {
    window.localStorage.setItem(FACE_SHAPE_KEY, shape);
  } catch {
    // stockage indisponible : on ignore silencieusement
  }
}

export const beardTrimSteps = [
  {
    title: "Peignez à sec avant de commencer",
    why: "Ça révèle la vraie longueur et le sens de pousse, pour ne pas tailler trop court par erreur.",
  },
  {
    title: "Définissez la ligne de contour",
    why: "Marquez la ligne de joue et le contour du cou avant de tailler le reste, ça évite les asymétries.",
  },
  {
    title: "Taillez du plus long sabot au plus court",
    why: "Commencez avec une garde longue, puis raccourcissez progressivement : c'est réversible dans ce sens, pas l'inverse.",
  },
  {
    title: "Égalisez les deux côtés en miroir",
    why: "Comparez régulièrement les deux joues face à un miroir pour garder une symétrie naturelle.",
  },
  {
    title: "Finissez le contour au rasoir ou à la tondeuse fine",
    why: "Une ligne nette sur le cou et les joues change complètement le rendu final, même avec une barbe fournie.",
  },
];

export const haircutTips = [
  {
    title: "Apportez une photo de référence",
    why: "Même approximative, elle aide votre coiffeur à viser précisément ce que vous voulez plutôt qu'une description verbale.",
  },
  {
    title: "Mentionnez votre routine réelle",
    why: "Une coupe qui demande du coiffage quotidien si vous n'en avez pas le temps se dégradera vite visuellement.",
  },
  {
    title: "Prévoyez un entretien toutes les 3 à 4 semaines",
    why: "Les dégradés et contours nets se déforment vite ; un entretien régulier garde la coupe nette plus longtemps que la coupe elle-même.",
  },
];
