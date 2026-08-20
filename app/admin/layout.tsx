import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { AdminNav } from "@/components/admin/admin-nav";

// Force le rendu dynamique par requête : cette garde ne doit jamais être
// évaluée une fois puis mise en cache/statique (ce qui figerait l'accès
// admin pour tout le monde selon qui a déclenché le premier rendu).
export const dynamic = "force-dynamic";

// Garde côté layout (première ligne de défense, expérience utilisateur) —
// chaque Server Action admin revérifie de toute façon via requireAdmin(),
// puisqu'une Server Action reste appelable directement sans passer par ce
// layout.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await isAdmin();
  if (!admin) redirect("/");

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <main className="mx-auto w-full max-w-6xl px-5 py-6">{children}</main>
    </div>
  );
}
