import type { SVGProps } from "react";

type LogoProps = SVGProps<SVGSVGElement> & {
  idPrefix?: string;
};

// Logomark de Faciem : un "F" retaillé à angles vifs, légèrement penché,
// avec une étincelle en accent — pas une lettre plaquée dans un carré.
// Deux halos flous en dégradé donnent de la profondeur en grand format
// tout en restant lisibles en tout petit (favicon).
export function Logo({ idPrefix = "faciem-logo", ...props }: LogoProps) {
  const gradId = `${idPrefix}-grad`;
  const dotGradId = `${idPrefix}-dot-grad`;
  const blurId = `${idPrefix}-blur`;

  return (
    <svg viewBox="0 0 40 40" role="img" aria-label="Logo Faciem" {...props}>
      <defs>
        <linearGradient id={gradId} x1="8" y1="6" x2="26" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#FF5DA2" />
        </linearGradient>
        <linearGradient id={dotGradId} x1="30" y1="6" x2="37" y2="13" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFB4D8" />
          <stop offset="100%" stopColor="#FF5DA2" />
        </linearGradient>
        <filter id={blurId} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="2.6" />
        </filter>
      </defs>

      <circle cx="31" cy="11" r="7" fill="#FF5DA2" opacity="0.45" filter={`url(#${blurId})`} />
      <circle cx="9" cy="30" r="6.5" fill="#8B5CF6" opacity="0.4" filter={`url(#${blurId})`} />

      <g transform="skewX(-9)" fill={`url(#${gradId})`}>
        <path d="M11 7 L29 7 L24 15 L16 15 L16 33 L11 33 Z" />
        <path d="M11 18 L23 18 L19 24 L11 24 Z" />
      </g>

      <circle cx="33.5" cy="8.5" r="2.6" fill={`url(#${dotGradId})`} />
      <circle cx="32.7" cy="7.7" r="0.9" fill="#ffffff" opacity="0.75" />
    </svg>
  );
}
