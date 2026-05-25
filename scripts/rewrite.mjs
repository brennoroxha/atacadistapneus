import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
const MODEL = 'google/gemini-2.5-flash';
const CONCURRENCY = 8;
const START = parseInt(process.argv[2] || '0', 10);
const LIMIT = parseInt(process.argv[3] || '999', 10);

const SYSTEM = `Você é especialista em SEO e Google Shopping. Reescreva descrições de produtos seguindo:
- 100% conformidade Google Shopping (sem promessas exageradas, sem "melhor", sem preço, sem URLs externas, sem CTA agressivo, sem emojis, sem texto promocional/spam)
- HTML semântico limpo: <p>, <h2>, <ul><li>, <strong>, <table><tr><td>
- Estrutura: 1 parágrafo introdutório (2-4 frases descrevendo o produto, materiais, uso); <h2>Características</h2> com <ul><li> de 4-7 benefícios objetivos; <h2>Especificações Técnicas</h2> com <table> de pares chave/valor extraídos do nome e descrição original
- Português do Brasil, tom técnico-objetivo, factual
- NÃO inventar especificações que não estejam no nome ou descrição original
- NÃO incluir GTIN, EAN ou SKU (já exibidos separadamente)
- 150-300 palavras
- Retorne APENAS o HTML, sem markdown, sem \`\`\`, sem comentários`;

async function rewrite(name, currentDesc) {
  const prompt = `Nome do produto: ${name}\n\nDescrição original (extrair specs reais daqui):\n${currentDesc || '(vazia)'}\n\nReescreva em HTML limpo conforme as regras.`;
  const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`AI ${res.status}: ${await res.text()}`);
  const data = await res.json();
  let html = data.choices?.[0]?.message?.content?.trim() || '';
  html = html.replace(/^```html\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '').trim();
  return html;
}

async function main() {
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, description')
    .order('id')
    .range(START, START + LIMIT - 1);
  if (error) throw error;
  console.log(`Processando ${products.length} produtos (a partir de ${START})...`);

  let done = 0, fail = 0;
  const queue = [...products];

  async function worker(id) {
    while (queue.length) {
      const p = queue.shift();
      if (!p) break;
      try {
        const newDesc = await rewrite(p.name, p.description);
        if (!newDesc || newDesc.length < 50) throw new Error('resposta curta');
        const { error: upErr } = await supabase.from('products').update({ description: newDesc }).eq('id', p.id);
        if (upErr) throw upErr;
        done++;
        if (done % 10 === 0) console.log(`  ✓ ${done} prontos, ${fail} falhas, ${queue.length} restantes`);
      } catch (e) {
        fail++;
        console.error(`  ✗ ${p.name.slice(0,60)}: ${e.message}`);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, (_, i) => worker(i)));
  console.log(`\nFinalizado: ${done} atualizados, ${fail} falhas`);
}
main().catch(e => { console.error(e); process.exit(1); });
