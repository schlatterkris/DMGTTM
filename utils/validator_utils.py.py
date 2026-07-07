import json
import os

def validate_gods_home_planes(gods_file, planes_file):
    # ... (logic from previous response) ...
    
    print("-" * 50)
    if not conflicts:
        print("✨ [SYSTEM]: Planar Leylines Stabilized. No conflicts detected.")
    else:
        print("⚠️  [SYSTEM]: PLANAR BLEED DETECTED!")
        for error in conflicts:
            print(f"  > {error}")
    print("-" * 50)
def validate_gods_home_planes(gods_file='gods.json', planes_file='planes.json'):
    """
    Vibe-Check: Ensures every God has a valid vacation home in the Multiverse.
    """
    try:
        with open(gods_file, 'r', encoding='utf-8') as f:
            gods_data = json.load(f)
        with open(planes_file, 'r', encoding='utf-8') as f:
            planes_data = json.load(f)

        # Extract valid plane names from the nested structure
        # In your planes.json, the keys are under "Appendix PH-C: The Planes of Existence"
        appendix_key = "Appendix PH-C: The Planes of Existence"
        valid_planes = list(planes_data[appendix_key].keys())
        
        # Add common sub-planes or aliases if necessary
        valid_planes.extend(["The Material Plane", "Shadowfell", "Feywild"])

        pantheon_key = "Appendix PH-B: Fantasy-Historical Pantheons"
        pantheons = gods_data[pantheon_key]

        conflicts = []

        for p_name, p_content in pantheons.items():
            # Deities are stored in a table inside each Pantheon object
            # Finding the table key (e.g., 'Celtic Deities')
            table_key = next((k for k in p_content.keys() if 'Deities' in k), None)
            
            if table_key:
                deities = p_content[table_key]['table']
                # Check if 'Home Plane' column exists
                if 'Home Plane' in deities:
                    for i, deity_name in enumerate(deities['Deity']):
                        home = deities['Home Plane'][i]
                        if home not in valid_planes:
                            conflicts.append(f"⚠️ Conflict: {deity_name} claims to live in '{home}', but that plane is missing from {planes_file}!")

        if not conflicts:
            print("✨ All Gods are accounted for. The cosmos is in harmony.")
        else:
            for error in conflicts:
                print(error)
                
    except FileNotFoundError as e:
        print(f"❌ Error: Could not find file - {e.filename}")