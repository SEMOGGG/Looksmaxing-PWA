// Léger grain photographique appliqué à toute l'app pour casser la platitude
// des dégradés et donner une texture plus "faite main" qu'un fond uni.
export function GrainOverlay() {
  return (
    <div
      aria-hidden
      className="grain-overlay pointer-events-none fixed inset-0 z-20 opacity-[0.05]"
    />
  );
}
