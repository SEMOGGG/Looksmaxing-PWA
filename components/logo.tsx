import type { SVGProps } from "react";

type LogoProps = SVGProps<SVGSVGElement> & {
  idPrefix?: string;
};

// Logomark de Faciem : un orbe en dégradé (le "vous" révélé) entouré de deux
// halos flous asymétriques (le potentiel, le glow-up). Pensé pour rester
// lisible en tout petit (favicon) tout en gardant du caractère en grand.
export function Logo({ idPrefix = "faciem-logo", ...props }: LogoProps) {
  const gradId = `${idPrefix}-grad`;
  const blurId = `${idPrefix}-blur`;
  const sheenId = `${idPrefix}-sheen`;

  return (
    <svg viewBox="0 0 40 40" role="img" aria-label="Logo Faciem" {...props}>
      <defs>
        <linearGradient id={gradId} x1="4" y1="6" x2="32" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#FF5DA2" />
        </linearGradient>
        <radialGradient id={sheenId} cx="35%" cy="28%" r="55%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <filter id={blurId} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
      </defs>

      <circle cx="29" cy="13" r="8.5" fill="#FF5DA2" opacity="0.7" filter={`url(#${blurId})`} />
      <circle cx="10" cy="27" r="7" fill="#8B5CF6" opacity="0.6" filter={`url(#${blurId})`} />
      <circle cx="19.5" cy="20" r="12.5" fill={`url(#${gradId})`} />
      <circle cx="19.5" cy="20" r="12.5" fill={`url(#${sheenId})`} />
    </svg>
  );
}
