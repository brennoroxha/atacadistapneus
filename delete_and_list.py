import subprocess
import json
import re

products_to_remove = [
    "Pneu Apollo Amazer 3G Maxx 165/70 R13 83T",
    "Pneu Continental ContiEcoContact 3 165/70R13 79T Aro 13",
    "Pneu Kumho KR26 165/70R13 79T Aro 13",
    "Pneu Zetum KR26 by Kumho 165/70R13 79T Aro 13",
    "Pneu Continental ContiPowerContact 175/65R14 82T XL Aro 14",
    "Pneu Firestone F-600 175/65R14 82T Aro 14",
    "Pneu Pirelli P400 Evo KS 175/70R14 84T Aro 14",
    "Pneu Apollo Amazer 3G Maxx 175/70 R13 82T",
    "Pneu Kelly Edge Touring by Goodyear 175/70R13 82T Aro 13",
    "Pneu Viking CityTech II by Continental 175/70R13 82T Aro 13",
    "Pneu Westlake RP18 175/75R13 85T Aro 13",
    "Pneu Xbri Ecology 175/75R13 84T Aro 13",
    "Pneu Linglong Crosswind Ecotouring 175/75R14 86T Aro 14",
    "Pneu Firestone F-600 185/65R14 86T Aro 14",
    "Pneu Goodride RP28 185/65 R15 88H",
    "Pneu Xbri Ecology 185/65R15 88H Aro 15",
    "Pneu Cooper CS1 185/70R13 86T Aro 13",
    "Pneu Firestone F-600 185/70R14 88T Aro 14",
    "Pneu Goodyear Assurance MaxLife 185/70R14 88H Aro 14",
    "Pneu Firestone F-600 195/55R15 85H Aro 15",
    "Pneu Firestone F-600 195/65R15 91H Aro 15",
    "Pneu Firestone F-600 195/60R15 88H Aro 15",
    "Pneu Barum Bravuris 5HM by Continental 205/55R16 91V FR Aro 16",
    "Pneu Firestone F-600 205/55R16 91V Aro 16",
    "Pneu Linglong Green-Max HP010 205/55R16 91V Aro 16",
    "Pneu Pirelli P400 Evo 205/55R16 91V Aro 16",
    "Pneu Firestone F-600 205/65R15 94T Aro 15",
    "Pneu Linglong Crosswind Extra Load 215/35R18 84W Aro 18",
    "Pneu Linglong Green-Max Extra Load 215/45R17 91W Aro 17",
    "Pneu Pirelli Cinturato P7 CNTK1 215/50R17 91V Aro 17",
    "Pneu Xbri Sport +2 Extra Load 225/40R18 92W Aro 18"
]

def get_all_products():
    res = subprocess.run(["psql", "-c", "SELECT id, name FROM products;"], capture_output=True, text=True)
    lines = res.stdout.split('\n')
    products = []
    for line in lines[2:]: 
        if '|' in line:
            parts = line.split('|')
            if len(parts) >= 2:
                products.append({'id': parts[0].strip(), 'name': parts[1].strip()})
    return products

all_db_products = get_all_products()
ids_to_delete = []
matched_names = []

for target in products_to_remove:
    keywords = re.findall(r'\b\w+\b', target.lower())
    # Filter out common unimportant words
    keywords = [k for k in keywords if k not in ['pneu', 'aro', 'r', 'by', 'extra', 'load']]
    
    dimension = re.search(r'\d{3}/\d{2}r\d{2}', target.lower().replace(" ", ""))
    if dimension:
        dimension = dimension.group(0)
    
    best_match = None
    for p in all_db_products:
        db_name = p['name'].lower()
        
        # If dimension is present, it MUST match
        if dimension:
            if dimension not in db_name.replace(" ", ""):
                continue
        
        # Count keyword matches
        match_count = sum(1 for k in keywords if k in db_name)
        if match_count >= len(keywords) * 0.7: # Loose threshold
            ids_to_delete.append(p['id'])
            matched_names.append(p['name'])
            break

# Final list of all names after deletion
ids_to_delete = list(set(ids_to_delete))
if ids_to_delete:
    ids_str = ",".join([f"'{i}'" for i in ids_to_delete])
    subprocess.run(["psql", "-c", f"DELETE FROM products WHERE id IN ({ids_str});"], capture_output=True)

res_final = subprocess.run(["psql", "-c", "SELECT name FROM products ORDER BY name ASC;"], capture_output=True, text=True)
print("--- REMOVED PRODUCTS ---")
for name in matched_names:
    print(f"- {name}")
print("\n--- FINAL PRODUCT LIST ---")
print(res_final.stdout)
