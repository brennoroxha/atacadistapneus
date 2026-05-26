import fs from 'fs';
const descriptions = JSON.parse(fs.readFileSync('descriptions.json', 'utf-8'));
const productsFile = process.argv[2];
const products = JSON.parse(fs.readFileSync(productsFile, 'utf-8'));

const updates = [];
products.forEach(p => {
    // Determine if product has a "generic" or missing description
    const isGeneric = !p.description || 
                     p.description.length < 50 || 
                     (p.description.includes('Medida:') && p.description.includes('Aro:'));
    
    if (isGeneric) {
        // Try to find a better description in the feed
        let newDesc = null;
        
        // Match by ID if available (assuming some property might hold it or we can try common ID ranges)
        // Since we don't have the original ID in the DB easily visible as a single column that matches 'g:id'
        // let's rely on GTIN first which is more reliable across systems.
        
        if (p.gtin && descriptions[`gtin:${p.gtin}`]) {
            newDesc = descriptions[`gtin:${p.gtin}`];
        }

        if (newDesc && newDesc !== p.description) {
            // Clean up the description if it's just the same "Medida" template but from the feed
            // Actually, the user wants to extract descriptions, so we should take what's in the feed if it's better.
            updates.push({
                id: p.id,
                name: p.name,
                old_description: p.description,
                new_description: newDesc
            });
        }
    }
});

console.log(JSON.stringify(updates, null, 2));
