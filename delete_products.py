import json
import subprocess

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
    for line in lines[2:-3]: # Skip header and footer
        if '|' in line:
            parts = line.split('|')
            products.append({'id': parts[0].strip(), 'name': parts[1].strip()})
    return products

all_db_products = get_all_products()
ids_to_delete = []

for target in products_to_remove:
    # Normalize target for matching
    normalized_target = target.lower().replace(" ", "").replace("”", "").replace("“", "")
    
    # Try exact match first
    matched = False
    for p in all_db_products:
        db_name_norm = p['name'].lower().replace(" ", "").replace("”", "").replace("“", "")
        if db_name_norm == normalized_target:
            ids_to_delete.append(p['id'])
            matched = True
            break
    
    if not matched:
        # Try fuzzy match (if target keywords are in db_name)
        # Extract keywords like dimensions (165/70R13) and brand
        keywords = [k for k in target.split() if len(k) > 2]
        for p in all_db_products:
            db_name_lower = p['name'].lower()
            if all(k.lower() in db_name_lower.replace("/", "") or k.lower() in db_name_lower for k in keywords):
                ids_to_delete.append(p['id'])
                matched = True
                break

print(json.dumps(list(set(ids_to_delete))))
