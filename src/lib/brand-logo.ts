const VERUM = "https://static.verumcommerce.com.br/other/Pneustore";
const v = (slug: string) => `${VERUM}/mini-banner-pneustore-${slug}.png?w=256&q=75`;

// Order matters: longer / more-specific patterns first to avoid false matches.
const BRAND_MAP: Array<[string, string]> = [
  ["bf goodrich", v("bfgoodrich")],
  ["bfgoodrich", v("bfgoodrich")],
  ["general tire", "https://www.tonnesen.co.za/images/cmsimages/listing/Tyre-Brand-GeneralTyre.png"],
  ["general", "https://www.tonnesen.co.za/images/cmsimages/listing/Tyre-Brand-GeneralTyre.png"],
  ["jk tyre", "https://cdn.iset.io/assets/74944/parceiros/jktyre2.jpg"],
  ["jk-tyre", "https://cdn.iset.io/assets/74944/parceiros/jktyre2.jpg"],
  ["sunset tire", "https://cdn.iset.io/assets/74944/parceiros/sunset2.png"],
  ["sunset", "https://cdn.iset.io/assets/74944/parceiros/sunset2.png"],
  ["aderenza", "https://icakzbsxlmazwlptzcqm.supabase.co/storage/v1/object/public/brand-logos/aderenza.png"],
  ["aeolus", v("aeolus")],
  ["anteo", v("anteo")],
  ["apollo", "https://cdn.iset.io/assets/74944/parceiros/apollos.png"],
  ["arduzza", "https://neumaticos.cl/wp-content/uploads/2025/08/arduzza.png"],
  ["barum", "https://cdn.iset.io/assets/74944/parceiros/barum2.png"],
  ["borilli", v("borilli")],
  ["bransales", "https://icakzbsxlmazwlptzcqm.supabase.co/storage/v1/object/public/brand-logos/bransales.png"],
  ["bridgestone", v("bridgestone")],
  ["ceat", v("ceat")],
  ["celimo", "https://images.tcdn.com.br/img/img_prod/1260611/pneu_175_70_r_14_gp_6_84t_celimo_h_t_4967_2_20fdf1104be9f3ffda1051047276483e.png"],
  ["compasal", "https://icakzbsxlmazwlptzcqm.supabase.co/storage/v1/object/public/brand-logos/compasal.png"],
  ["continental", v("continental")],
  ["cooper", v("cooper")],
  ["drc", v("drc")],
  ["durable", "https://www.quepneus.com.br/media/wysiwyg/marcas/durable.jpg"],
  ["dunlop", "https://kssyjenfoxhnkdnhjtdc.supabase.co/storage/v1/object/public/brand-logos/dunlop.png"],
  ["farroad", v("farroad")],
  ["firemax", "https://cdn.iset.io/assets/74944/parceiros/firemax2.png"],
  ["firestone", v("firestone")],
  ["formula", v("formula")],
  ["goodyear", v("goodyear")],
  ["hankook", v("hankook")],
  ["iris", v("iris")],
  ["itaro", v("itaro")],
  ["ira", v("ira")],
  ["jk", "https://cdn.iset.io/assets/74944/parceiros/jktyre2.jpg"],
  ["kelly", v("kelly")],
  ["kenda", v("kenda")],
  ["koogar", v("koogar")],
  ["kumho", v("kumho")],
  ["linglong", "https://pneufree.s3.sa-east-1.amazonaws.com/PneufreeReact/Images/SVGBrands/linglong.svg"],
  ["maggion", v("maggion")],
  ["mastercraft", "https://i.logos-download.com/64085/14493-og-0a665843d3e9daf76d5af7977da89234.png/Mastercraft_Tires_Logo_og.png"],
  ["maxxis", v("maxxis")],
  ["metzeler", v("metzeler")],
  ["michelin", v("michelin")],
  ["mitas", v("mitas")],
  ["nankang", "https://icakzbsxlmazwlptzcqm.supabase.co/storage/v1/object/public/brand-logos/nankang.png"],
  ["nexen", v("nexen")],
  ["pirelli", v("pirelli")],
  ["rinaldi", v("rinaldi")],
  ["roadking", "https://cdn.iset.io/assets/74944/parceiros/roadking2.png"],
  ["sailun", "https://icakzbsxlmazwlptzcqm.supabase.co/storage/v1/object/public/brand-logos/sailun.png"],
  ["sestante", v("sestante")],
  ["speedmax", v("speedmax")],
  ["steelmark", v("steelmark")],
  ["technic", v("technic")],
  ["tegrys", v("tegrys")],
  ["tornel", v("tornel")],
  ["vipal", v("vipal")],
  ["vitour", "https://icakzbsxlmazwlptzcqm.supabase.co/storage/v1/object/public/brand-logos/vitour.png"],
  ["westlake", "https://cdn.iset.io/assets/74944/parceiros/logo-westlake2.jpg"],
  ["windforce", "https://kssyjenfoxhnkdnhjtdc.supabase.co/storage/v1/object/public/brand-logos/windforce.png"],
  ["xbri", v("xbri")],
];

export function getBrandLogo(productName?: string | null): string | null {
  if (!productName) return null;
  const lower = productName.toLowerCase();
  for (const [key, url] of BRAND_MAP) {
    if (lower.includes(key)) return url;
  }
  return null;
}
