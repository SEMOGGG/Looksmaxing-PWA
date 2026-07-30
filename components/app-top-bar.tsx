import { Logo } from "@/components/logo";

export function AppTopBar({ title, idPrefix }: { title: string; idPrefix: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-5 py-4">
        <Logo idPrefix={idPrefix} className="h-7 w-7" />
        <h1 className="font-heading text-lg font-semibold text-foreground">{title}</h1>
      </div>
    </header>
  );
}
