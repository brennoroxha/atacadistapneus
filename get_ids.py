import subprocess
import re
import json

requested_removals = [
    ("Apollo", "165/70R13"),
    ("Continental", "165/70R13"),
    ("Kumho", "165/70R13"),
    ("Zetum", "165/70R13"),
    ("Continental", "175/65R14"),
    ("Firestone", "175/65R14"),
    ("Pirelli", "175/70R14"),
    ("Apollo", "175/70R13"),
    ("Kelly", "175/70R13"),
    ("Viking", "175/70R13"),
    ("Westlake", "175/75R13"),
    ("Xbri", "175/75R13"),
    ("Linglong", "175/75R14"),
    ("Firestone", "185/65R14"),
    ("Goodride", "185/65R15"),
    ("Xbri", "185/65R15"),
    ("Cooper", "185/70R13"),
    ("Firestone", "185/70R14"),
    ("Goodyear", "185/70R14"),
    ("Firestone", "195/55R15"),
    ("Firestone", "195/65R15"),
    ("Firestone", "195/60R15"),
    ("Barum", "205/55R16"),
    ("Firestone", "205/55R16"),
    ("Linglong", "205/55R16"),
    ("Pirelli", "205/55R16"),
    ("Firestone", "205/65R15"),
    ("Linglong", "215/35R18"),
    ("Linglong", "215/45R17"),
    ("Pirelli", "215/50R17"),
    ("Xbri", "225/40R18")
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

for brand, dim in requested_removals:
    dim_clean = dim.lower().replace("/", "").replace(" ", "")
    for p in all_db_products:
        name_lower = p['name'].lower()
        if brand.lower() in name_lower and dim_clean in name_lower.replace("/", "").replace(" ", ""):
            ids_to_delete.append(p['id'])

print(json.dumps(list(set(ids_to_delete))))
