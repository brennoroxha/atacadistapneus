import subprocess
import re

targets = [
    "Pneu Continental ContiEcoContact 3 165/70R13 79T Aro 13",
    "Pneu Zetum KR26 by Kumho 165/70R13 79T Aro 13",
    "Pneu Continental ContiPowerContact 175/65R14 82T XL Aro 14",
    "Pneu Pirelli P400 Evo KS 175/70R14 84T Aro 14",
    "Pneu Goodyear Assurance MaxLife 185/70R14 88H Aro 14",
    "Pneu Firestone F-600 195/65R15 91H Aro 15",
    "Pneu Linglong Crosswind Extra Load 215/35R18 84W Aro 18",
    "Pneu Linglong Green-Max Extra Load 215/45R17 91W Aro 17",
    "Pneu Pirelli Cinturato P7 CNTK1 215/50R17 91V Aro 17"
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

for target in targets:
    print(f"Searching for: {target}")
    # Extract brand (first few words)
    brand_match = re.search(r'Pneu (\w+)', target)
    brand = brand_match.group(1) if brand_match else ""
    
    # Extract dimensions (e.g. 165/70R13)
    dim_match = re.search(r'(\d{3}/\d{2}R\d{2})', target, re.I)
    dim = dim_match.group(1).lower() if dim_match else ""
    
    found = False
    for p in all_db_products:
        name_lower = p['name'].lower()
        if dim and dim in name_lower.replace(" ", ""):
            if brand.lower() in name_lower:
                print(f"  MATCH: {p['name']} (ID: {p['id']})")
                found = True
    if not found:
        print("  NO MATCH FOUND")
