import json
import os

def check_integrity():
    """
    THE CONFLICT RESOLVER
    Logic: Scans gods.json and verifies that every deity's 'Home Plane' 
    actually exists within planes.json to ensure lore consistency.
    """
    
    # 1. SETUP PATHS
    # We use absolute pathing relative to this file to find your /data folder
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    data_path = os.path.join(base_dir, 'data')
    
    try:
        with open(os.path.join(data_path, 'gods.json'), 'r') as f:
            gods_data = json.load(f)
        with open(os.path.join(data_path, 'planes.json'), 'r') as f:
            planes_data = json.load(f)
    except FileNotFoundError as e:
        print(f"❌ ARCHITECT ERROR: Data files missing at {data_path}")
        print(f"Details: {e}")
        return

    print("\n📜 --- The Ultimate DM Vault: Conflict Resolver --- 📜")
    print("Checking the stability of the Multiverse...\n")

    # 2. MAP VALID PLANES
    # Your planes.json uses 'Appendix PH-C: The Planes of Existence' as the root key
    planes_root = planes_data.get("Appendix PH-C: The Planes of Existence", {})
    
    # Create a set of valid plane names for O(1) lookup speed
    valid_plane_names = set(planes_root.keys())
    
    # The Material Plane is the 'Nexus', so we always count it as valid
    valid_plane_names.add("The Material Plane")
    valid_plane_names.add("Material Plane")

    pantheons = gods_data.get("Appendix PH-B: Fantasy-Historical Pantheons", {})
    anomalies_found = 0

    # 3. ITERATE THROUGH PANTHEONS
    for p_name, p_content in pantheons.items():
        # Only look at the actual Pantheon objects (Celtic, Greek, etc.)
        if isinstance(p_content, dict) and "table" in p_content:
            table = p_content["table"]
            deities = table.get("Deity", [])
            planes = table.get("Plane", [])

            for i, deity_full_name in enumerate(deities):
                # Logic: Isolate the deity's name from their description
                name = deity_full_name.split(',')[0]
                home_plane = planes[i] if i < len(planes) else "Unknown"

                # Check if the plane exists in our master list
                if home_plane not in valid_plane_names:
                    print(f"⚠️  SPATIAL RIFT: {name} ({p_name})")
                    print(f"   Lurks in: '{home_plane}' (Not found in planes.json)")
                    anomalies_found += 1

    # 4. FINAL REPORT
    if anomalies_found == 0:
        print("✅ SUCCESS: The Multiverse is stable. All deities are accounted for.")
    else:
        print(f"\n❌ FAILED: Found {anomalies_found} lore conflicts.")
        print("Suggested Action: Update planes.json or correct the spelling in gods.json.")
    
    print("\n--------------------------------------------------")

if __name__ == "__main__":
    check_integrity()
