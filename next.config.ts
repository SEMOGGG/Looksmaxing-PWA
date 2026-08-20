import type { NextConfig } from "next";

// Origine du bucket Supabase Storage (photos/vidéos de la Communauté),
// dérivée de SUPABASE_URL à la construction : évite de coder en dur un
// project ref dans la CSP alors qu'il varie entre environnements.
const supabaseOrigin = (() => {
  try {
    return process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL).origin : "";
  } catch {
    return "";
  }
})();

// CSP volontairement généreuse sur script/style/connect/frame pour ne pas
// casser Clerk (session côté client, éventuel challenge anti-bot) ni
// l'hydratation Next.js — testez la connexion après déploiement, une CSP
// trop stricte casserait l'authentification silencieusement.
// picsum.photos : images d'illustration libres de droits (bandeau
// Communauté). Bucket Supabase : photos/vidéos envoyées par les membres.
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://*.clerk.accounts.dev https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://img.clerk.com https://picsum.photos https://fastly.picsum.photos${supabaseOrigin ? ` ${supabaseOrigin}` : ""}`,
  `media-src 'self' blob:${supabaseOrigin ? ` ${supabaseOrigin}` : ""}`,
  "font-src 'self' data:",
  "connect-src 'self' https://*.clerk.accounts.dev https://api.clerk.com",
  "frame-src 'self' https://*.clerk.accounts.dev https://challenges.cloudflare.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // 24 Mo : couvre les vidéos Communauté (16 Mo décodés max, voir
      // communityMediaSchema dans lib/validation.ts), qui gonflent d'environ
      // 33 % en base64, plus les quelques frames d'aperçu envoyées à part
      // pour la modération.
      bodySizeLimit: "24mb",
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
