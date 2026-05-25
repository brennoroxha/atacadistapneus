// Mapping between user-facing path slugs and internal DB category slugs.
// DB slugs use the "tipo-{vehicle}-aro-{n}" convention; the public URL uses
// "/{tipoPath}/aro-{aro}/" with friendlier wording (e.g. "carro-camionete").

const TIPO_PATH_TO_DB: Record<string, string> = {
  "carro-camionete": "carros-camionete",
  "moto": "moto",
  "caminhao": "caminhao",
  "caminhonete": "caminhonete",
  "agricola": "agricola",
  "bicicleta": "bicicleta",
  "comercial": "comercial",
};

const DB_TO_TIPO_PATH: Record<string, string> = Object.fromEntries(
  Object.entries(TIPO_PATH_TO_DB).map(([path, db]) => [db, path]),
);

/** Convert /carro-camionete/aro-13 params into the DB category slug. */
export function dbSlugFromPath(tipoPath: string, aro: string): string | null {
  const dbTipo = TIPO_PATH_TO_DB[tipoPath];
  if (!dbTipo) return null;
  // DB slugs use dashes for decimals (e.g. 17-5 == 17.5)
  const aroNorm = aro.replace(/\./g, "-");
  return `tipo-${dbTipo}-aro-${aroNorm}`;
}

/** Convert a DB category slug like "tipo-carros-camionete-aro-13" into URL parts. */
export function pathFromDbSlug(dbSlug: string): { tipo: string; aro: string } | null {
  const m = dbSlug.match(/^tipo-(.+)-aro-(.+)$/);
  if (!m) return null;
  const dbTipo = m[1];
  const aro = m[2];
  const tipo = DB_TO_TIPO_PATH[dbTipo];
  if (!tipo) return null;
  return { tipo, aro };
}

export function isKnownTipoPath(tipoPath: string): boolean {
  return tipoPath in TIPO_PATH_TO_DB;
}
