import { createFileRoute, notFound } from "@tanstack/react-router";
import { ProductsListing } from "./products.index";
import { dbSlugFromPath, isKnownTipoPath } from "@/lib/category-paths";
import { generateMetadata } from "@/lib/seo";
import { z } from "zod";

const csv = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((v) => {
    if (v === undefined) return undefined;
    if (Array.isArray(v)) return v.length ? v : undefined;
    const parts = v.split(",").filter(Boolean);
    return parts.length ? parts : undefined;
  });

const searchSchema = z.object({
  search: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  aro: csv,
  altura: csv,
  largura: csv,
  marca: csv,
  runflat: z.string().optional(),
  sort: z.string().optional(),
});

const TIPO_LABEL: Record<string, string> = {
  "carro-camionete": "Carro/Camionete",
  "moto": "Moto",
  "caminhao": "Caminhão",
  "caminhonete": "Caminhonete",
  "agricola": "Agrícola",
  "bicicleta": "Bicicleta",
  "comercial": "Comercial",
};

export const Route = createFileRoute("/$tipo/aro-{$aro}")({
  validateSearch: (s) => searchSchema.parse(s),
  beforeLoad: ({ params }) => {
    if (!isKnownTipoPath(params.tipo)) throw notFound();
  },
  loader: ({ params }) => {
    const dbSlug = dbSlugFromPath(params.tipo, params.aro);
    if (!dbSlug) throw notFound();
    return { dbSlug };
  },
  head: ({ params }) => {
    const tipoLabel = TIPO_LABEL[params.tipo] ?? params.tipo;
    const title = `Pneus ${tipoLabel} Aro ${params.aro} | Atacadão Pneus`;
    return generateMetadata({
      title,
      description: `Confira pneus para ${tipoLabel} aro ${params.aro}. Melhor preço e entrega rápida.`,
      url: `/${params.tipo}/aro-${params.aro}`,
    });
  },
  component: CategoryRoute,
});

function CategoryRoute() {
  const { dbSlug } = Route.useLoaderData();
  return <ProductsListing categorySlugOverride={dbSlug} />;
}
