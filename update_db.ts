import { supabase } from './src/lib/supabase.ts';
import fs from 'fs';

async function run() {
    const { data: products } = await supabase.from('products').select('id, name, description, gtin');
    if (!products) return;

    const descriptions = JSON.parse(fs.readFileSync('descriptions.json', 'utf-8'));
    const updates = [];

    products.forEach(p => {
        const isGeneric = !p.description || 
                         p.description.length < 50 || 
                         (p.description.includes('Medida:') && p.description.includes('Aro:'));
        
        if (isGeneric) {
            let newDesc = null;
            if (p.gtin && descriptions[`gtin:${p.gtin}`]) {
                newDesc = descriptions[`gtin:${p.gtin}`];
            }

            if (newDesc && newDesc !== p.description) {
                updates.push({
                    id: p.id,
                    name: p.name,
                    description: newDesc
                });
            }
        }
    });

    for (const update of updates) {
        console.log(`Updating ${update.name}...`);
        const { error } = await supabase
            .from('products')
            .update({ description: update.description })
            .eq('id', update.id);
        
        if (error) console.error(`Error updating ${update.id}:`, error);
    }
}

run();
