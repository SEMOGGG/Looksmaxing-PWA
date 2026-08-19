import { BottomNav } from "@/components/bottom-nav";

// Les Server Actions qui appellent Claude (bilan, analyses par photo, coach)
// peuvent dépasser la limite par défaut de 10s des fonctions serverless
// Vercel (plan Hobby). Ce réglage ne peut pas vivre dans un fichier
// "use server" (chaque export y doit être une fonction async) — il vit donc
// ici, dans le layout qui englobe toutes les pages appelant ces actions.
export const maxDuration = 60;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col pb-24">
      {children}
      <BottomNav />
    </div>
  );
}
