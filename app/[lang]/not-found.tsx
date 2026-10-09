import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="grid min-h-[80svh] place-items-center px-[var(--spacing-gutter)] text-center">
      <div>
        <span aria-hidden className="font-jp text-6xl text-ouro/50">
          匠
        </span>
        <h1 className="mt-8 font-display text-display-md">Esta página no está en la carta.</h1>
        <p className="mt-3 text-washi-dim">This page is not on the menu.</p>
        <Button asChild variant="outline" className="mt-10">
          <Link href="/">Inicio · Home</Link>
        </Button>
      </div>
    </section>
  );
}
