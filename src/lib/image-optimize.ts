// Image optimization helper.
//
// Reescreve URLs do Supabase Storage para usar o endpoint de transformação
// (resize + compressão + WebP automático no servidor), reduzindo MUITO o
// peso da imagem entregue ao navegador sem precisar baixá-las para o repo.
//
// Ex: .../object/public/bucket/foo.jpg
//  -> .../render/image/public/bucket/foo.jpg?width=300&quality=75
//
// Para URLs de outros domínios (não-Supabase) a função devolve a URL original
// — esses casos são poucos e variam por CDN.

const SUPABASE_OBJECT = "/storage/v1/object/public/";
const SUPABASE_RENDER = "/storage/v1/render/image/public/";

export interface ImgOpts {
  height?: number;
  width?: number;
  quality?: number;
  resize?: "contain" | "cover" | "fill";
}

export function optimizeImage(url?: string | null, opts: ImgOpts = {}): string {
  if (!url) return "";
  if (url.startsWith("data:") || url.startsWith("/")) return url;
  if (!url.includes(SUPABASE_OBJECT)) return url;

  const rewritten = url.replace(SUPABASE_OBJECT, SUPABASE_RENDER);
  const params = new URLSearchParams();
  if (opts.width) params.set("width", String(opts.width));
  if (opts.height) params.set("height", String(opts.height));
  if (opts.quality) params.set("quality", String(opts.quality));
  if (opts.resize) params.set("resize", opts.resize);
  const qs = params.toString();
  return qs ? `${rewritten}?${qs}` : rewritten;
}
