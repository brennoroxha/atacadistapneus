type Block =
  | { kind: "heading"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "table"; rows: Array<[string, string]> }
  | { kind: "p"; text: string };

const SECTION_RE =
  /(Detalhes técnicos|Detalhes Técnicos|Informações do Produto:?|Informações técnicas:?|Especificações:?|Especificações técnicas:?|Características:?|Características especiais:?|Conteúdo da Embalagem:?|Sobre este item:?)/g;

const KV_SPLIT_RE =
  /(?<=[a-záéíóúâêôãõçA-Z0-9)\].,])\s*(?=[A-ZÀ-ÚÇ][\wÀ-ú\s/().\-]{1,40}:\s)/g;

function clean(raw: string): string {
  return raw
    .replace(/[\u200E\u200F\u00AD]/g, "")
    .replace(/\r/g, "")
    .replace(/^\s*Descrição\s*/i, "")
    .trim();
}

function isHtml(s: string): boolean {
  return /<\/?(p|ul|ol|li|table|tr|td|th|h[1-6]|strong|br|div|span)\b/i.test(s);
}

type RawLine =
  | { type: "heading"; text: string }
  | { type: "bullet"; text: string }
  | { type: "kv"; key: string; value: string }
  | { type: "p"; text: string };

function tokenize(raw: string): RawLine[] {
  const text = clean(raw);
  if (!text) return [];
  const withSections = text.replace(SECTION_RE, "\n\n@@SEC@@$1@@\n");
  const withKv = withSections
    .replace(/\s+[–—]\s+/g, "\n")
    .replace(/(?:^|\n)\s*[-•·]\s*/g, "\n@@BUL@@")
    .replace(KV_SPLIT_RE, "\n");

  const lines = withKv.split("\n").map((l) => l.trim()).filter(Boolean);
  const out: RawLine[] = [];
  for (const line of lines) {
    const sec = line.match(/^@@SEC@@(.+?)@@$/);
    if (sec) {
      out.push({ type: "heading", text: sec[1].replace(/:$/, "").trim() });
      continue;
    }
    if (line.startsWith("@@BUL@@")) {
      const t = line.replace("@@BUL@@", "").trim();
      if (t) out.push({ type: "bullet", text: t });
      continue;
    }
    const kv = line.match(/^([^:]{2,60}):\s*(.+)$/);
    if (kv && !/[.!?]/.test(kv[1])) {
      out.push({ type: "kv", key: kv[1].trim(), value: kv[2].trim() });
      continue;
    }
    out.push({ type: "p", text: line });
  }
  return out;
}

function group(tokens: RawLine[]): Block[] {
  const blocks: Block[] = [];
  let i = 0;
  while (i < tokens.length) {
    const t = tokens[i];
    if (t.type === "heading") {
      blocks.push({ kind: "heading", text: t.text });
      i++;
    } else if (t.type === "bullet") {
      const items: string[] = [];
      while (i < tokens.length && tokens[i].type === "bullet") {
        items.push((tokens[i] as { text: string }).text);
        i++;
      }
      blocks.push({ kind: "list", items });
    } else if (t.type === "kv") {
      const rows: Array<[string, string]> = [];
      while (i < tokens.length && tokens[i].type === "kv") {
        const kv = tokens[i] as { key: string; value: string };
        rows.push([kv.key, kv.value]);
        i++;
      }
      blocks.push({ kind: "table", rows });
    } else {
      blocks.push({ kind: "p", text: t.text });
      i++;
    }
  }
  return blocks;
}

export function FormattedDescription({ text }: { text: string | null | undefined }) {
  if (!text) return null;

  // If description is HTML, render it directly with our themed styles.
  if (isHtml(text)) {
    return (
      <div
        className="formatted-html-description text-sm leading-relaxed text-slate-700 space-y-4
          [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-industrial-blue [&_h2]:dark:text-primary [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:pb-2 [&_h2]:border-b [&_h2]:border-slate-200
          [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-industrial-blue [&_h3]:dark:text-primary [&_h3]:mt-6 [&_h3]:mb-3
          [&_p]:text-slate-600 [&_p]:mb-4 [&_p]:text-justify
          [&_strong]:font-bold [&_strong]:text-slate-900
          [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-4 [&_ul]:space-y-2 [&_ul]:marker:text-slate-400
          [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-4 [&_ol]:space-y-2
          [&_li]:pl-1
          [&_table]:w-full [&_table]:border-collapse [&_table]:my-6 [&_table]:overflow-hidden [&_table]:rounded-md [&_table]:border [&_table]:border-slate-200 [&_table]:shadow-sm
          [&_tr:nth-child(even)]:bg-slate-50/60
          [&_td]:px-4 [&_td]:py-3 [&_td]:border-b [&_td]:border-slate-200 [&_td]:text-slate-600
          [&_td:first-child]:font-bold [&_td:first-child]:text-slate-900 [&_td:first-child]:w-1/3 [&_td:first-child]:border-r"
        dangerouslySetInnerHTML={{ __html: text }}
      />
    );
  }

  const blocks = group(tokenize(text));
  if (blocks.length === 0) return null;

  return (
    <div className="space-y-4 text-sm leading-relaxed text-slate-700">
      {blocks.map((b, i) => {
        if (b.kind === "heading")
          return (
            <h3 key={i} className="text-base font-bold text-industrial-blue dark:text-primary mt-6 first:mt-0">
              {b.text}
            </h3>
          );
        if (b.kind === "list")
          return (
            <ul key={i} className="list-disc pl-5 space-y-2 marker:text-slate-400 my-4">
              {b.items.map((it, j) => (
                <li key={j} className="pl-1">{it}</li>
              ))}
            </ul>
          );
        if (b.kind === "table")
          return (
            <div key={i} className="my-8">
              <h4 className="text-base font-bold text-industrial-blue dark:text-primary mb-4">
                Detalhes técnicos
              </h4>
              <div className="overflow-hidden rounded-md border border-slate-200 shadow-sm">
                <table className="w-full text-sm border-collapse">
                  <tbody>
                    {b.rows.map(([k, v], j) => (
                      <tr key={j} className={j % 2 === 0 ? "bg-slate-50/50" : "bg-white"}>
                        <th className="text-left font-bold px-4 py-3 w-1/3 text-slate-900 align-top border-r border-slate-200">
                          {k}
                        </th>
                        <td className="px-4 py-3 text-slate-600 font-medium">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        return (
          <p key={i} className="text-slate-600 mb-3">
            {b.text}
          </p>
        );
      })}
    </div>
  );
}
