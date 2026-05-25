import { ReactNode } from "react";

interface LegalPageProps {
  title: string;
  updated?: string;
  children: ReactNode;
}

export function LegalPage({ title, updated = "12 de maio de 2026", children }: LegalPageProps) {
  return (
    <div className="bg-muted/20 py-12 md:py-16">
      <div className="container px-4 mx-auto max-w-4xl">
        <article className="bg-card border rounded-xl shadow-sm p-6 md:p-12">
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-industrial-blue dark:text-primary border-b-4 border-industrial-blue dark:border-primary pb-3 mb-3">
            {title}
          </h1>
          <p className="text-xs text-muted-foreground mb-8">Última atualização: {updated}</p>
          <div className="legal-content space-y-4 text-foreground/90 leading-relaxed">
            {children}
          </div>
        </article>
      </div>
    </div>
  );
}
