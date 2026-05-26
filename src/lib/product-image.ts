// Helper utilities for product image URLs.
//
// Todas as imagens dos produtos são hospedadas externamente (Supabase Storage
// ou repositório RAW do GitHub) para evitar embutir arquivos pesados no build.
export const PRODUCT_IMAGE_BASE_URL =
  "https://raw.githubusercontent.com/brennoroxha/lider-imagens/main/lider-local/produtos-cache";

// Placeholder SVG inline — não adiciona peso ao build e funciona offline.
export const PRODUCT_IMAGE_FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'>
      <rect width='400' height='400' fill='#f1f5f9'/>
      <circle cx='200' cy='200' r='110' fill='none' stroke='#94a3b8' stroke-width='14'/>
      <circle cx='200' cy='200' r='55' fill='none' stroke='#94a3b8' stroke-width='10'/>
      <text x='200' y='340' text-anchor='middle' font-family='Arial,sans-serif' font-size='20' fill='#64748b'>Imagem indisponível</text>
    </svg>`
  );

/**
 * Resolve a URL final de uma imagem de produto.
 * - URLs absolutas (http/https/data:) são retornadas como estão.
 * - Caminhos locais como `lider-local/produtos-cache/foo.jpg` ou apenas o
 *   nome do arquivo são convertidos para a URL RAW do GitHub.
 */
import { optimizeImage, type ImgOpts } from "./image-optimize";

export const PRODUCT_CARD_IMAGE_OPTS: ImgOpts = {
  width: 300,
  height: 300,
  quality: 75,
  resize: "contain",
};

export const PRODUCT_CARD_IMAGE_CONTAINER_STYLE = {
  width: "100%",
  height: "180px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#ffffff",
  padding: "12px",
  boxSizing: "border-box",
} as const;

export const PRODUCT_CARD_IMAGE_STYLE = {
  maxWidth: "100%",
  maxHeight: "156px",
  width: "auto",
  height: "auto",
  objectFit: "contain",
  display: "block",
} as const;

export function getProductImageUrl(input?: string | null, opts?: ImgOpts): string {
  if (!input) return PRODUCT_IMAGE_FALLBACK;
  const absolute = /^(https?:|data:)/i.test(input)
    ? input
    : `${PRODUCT_IMAGE_BASE_URL}/${input.replace(/^.*[\\/]/, "")}`;
  return opts ? optimizeImage(absolute, opts) : absolute;
}

export function getProductCardImageUrl(input?: string | null): string {
  return getProductImageUrl(input, PRODUCT_CARD_IMAGE_OPTS);
}


/** Handler de onError para <img> — troca por placeholder sem quebrar layout. */
export function onProductImageError(
  e: React.SyntheticEvent<HTMLImageElement>
) {
  const img = e.currentTarget;
  if (img.src !== PRODUCT_IMAGE_FALLBACK) {
    img.src = PRODUCT_IMAGE_FALLBACK;
  }
}
