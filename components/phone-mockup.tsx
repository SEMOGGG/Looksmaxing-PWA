import Image from "next/image";
import type { CSSProperties } from "react";

// Cadre de téléphone stylisé pour présenter de vraies captures d'écran de
// l'app sur la page d'accueil — nos captures ne sont pas au format 9:19.5
// exact d'un téléphone, donc on force ce ratio ici. object-contain (plutôt
// que cover) affiche l'image en entier, quitte à laisser un peu de fond
// visible en bas de l'écran, pour ne jamais couper de texte sur les bords.
export function PhoneMockup({
  src,
  alt,
  className = "",
  tilt = 0,
}: {
  src: string;
  alt: string;
  className?: string;
  tilt?: number;
}) {
  return (
    <div
      className={`phone-mockup relative aspect-[9/18.5] w-full rounded-[2.2rem] border-[6px] border-[#242230] bg-[#050409] p-1.5 shadow-2xl ${className}`}
      style={tilt ? ({ "--tilt": `${tilt}deg` } as CSSProperties) : undefined}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[1.6rem] bg-background">
        <Image src={src} alt={alt} fill sizes="220px" className="object-contain object-top" />
      </div>
      <div className="absolute left-1/2 top-3 h-1.5 w-14 -translate-x-1/2 rounded-full bg-[#242230]" />
    </div>
  );
}
