import socket
import time

def is_domain_resolvable(domain):
    try:
        socket.gethostbyname(domain)
        return True
    except socket.gaierror:
        return False

prefixes = ["go", "get", "try", "use", "my", "the", "hello", "hey", "just", "easy"]
roots = ["trip", "travel", "flight", "fly", "jet", "air", "wing", "sky", "roam", "voya", "deal", "fare"]
suffixes = ["hub", "box", "lab", "hq", "now", "spot", "place", "base", "zone", "joy", "zen", "net", "io", "app"]
tech_suffixes = ["ly", "ify", "y"]

candidates = []

# Strategy 1: Prefix + Root (e.g., gotrip.com)
for p in prefixes:
    for r in roots:
        candidates.append(f"{p}{r}.com")

# Strategy 2: Root + Suffix (e.g., triphub.com)
for r in roots:
    for s in suffixes:
        candidates.append(f"{r}{s}.com")

# Strategy 3: Creative (e.g., trippy)
candidates.extend([
    "trippier.com", "flyvio.com", "airvibe.com", "jetscout.com", "farehawk.com",
    "roamify.com", "voyagerly.com", "skyscanner.com", "momondo.com", # Controls (should fail)
    "travely.com", "tripix.com", "flydeck.com", "airnest.com", "wingway.com",
    "routejoy.com", "pathzen.com", "viafare.com", "gojaunt.com", "trekhub.com",
    "wanda.com", "wanderly.com", "nomadbase.com", "tripsync.com", "farespot.com",
    "dealwing.com", "skylark.com", "jetsetgo.com", "velatrip.com", "novatrip.com",
    "zenithfly.com", "apexair.com", "summittrip.com", "urbanroam.com", "vivatrip.com"
])

# Remove duplicates
candidates = list(set(candidates))

print(f"Checking {len(candidates)} candidates...")

available_likely = []

for domain in candidates:
    if not is_domain_resolvable(domain):
        available_likely.append(domain)
        print(f"[LIKELY] {domain}")
    else:
        # print(f"[TAKEN] {domain}")
        pass

print("-" * 30)
print(f"Found {len(available_likely)} likely available domains.")
print("-" * 30)
for d in available_likely:
    print(d)
