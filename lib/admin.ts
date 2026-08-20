import "server-only";
import { currentUser } from "@clerk/nextjs/server";

// Accès admin vérifié par email plutôt que par une colonne "is_admin" en
// base : plus simple à démarrer pour un opérateur unique (variable d'env
// ADMIN_EMAILS, liste séparée par des virgules), sans avoir à s'auto-
// promouvoir en base avant que le panel n'existe. Chaque Server Action
// admin doit appeler requireAdmin() elle-même — le layout /admin ne suffit
// pas, une Server Action reste appelable directement.
function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function isAdmin(): Promise<boolean> {
  const emails = adminEmails();
  if (emails.length === 0) return false;

  const user = await currentUser();
  if (!user) return false;

  return user.emailAddresses.some((e) => emails.includes(e.emailAddress.toLowerCase()));
}

export type AdminGuardResult = { ok: true } | { ok: false; error: string };

// À appeler en tout premier dans chaque Server Action admin.
export async function requireAdmin(): Promise<AdminGuardResult> {
  const admin = await isAdmin();
  if (!admin) return { ok: false, error: "Accès réservé aux administrateurs." };
  return { ok: true };
}
