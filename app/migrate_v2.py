import os
import re

APP_DIR = r"m:\SIH\main\app"

MAPPINGS = [
    (r"binance-surface", "comet-card"),
    (r"binance-info", "comet-orange"),
    (r"#1E2329", "#0a0908"), # Replacing binance-surface hex with comet-sidebar-bg hex
]

def migrate_theme():
    total_files_modified = 0
    total_replacements = 0

    for root, _, files in os.walk(APP_DIR):
        if 'node_modules' in root or '.expo' in root or '.git' in root or 'android' in root:
            continue
            
        for file in files:
            if not (file.endswith(".tsx") or file.endswith(".ts") or file.endswith(".js") or file.endswith(".jsx")):
                continue
                
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
            except Exception as e:
                continue

            new_content = content
            file_modified = False

            for old_pattern, new_replacement in MAPPINGS:
                flags = re.IGNORECASE if old_pattern.startswith("#") else 0
                matches = len(re.findall(old_pattern, new_content, flags=flags))
                if matches > 0:
                    new_content = re.sub(old_pattern, new_replacement, new_content, flags=flags)
                    file_modified = True
                    total_replacements += matches

            if file_modified:
                try:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Modified: {os.path.relpath(filepath, APP_DIR)}")
                    total_files_modified += 1
                except Exception as e:
                    pass

    print(f"\nPhase 2 Complete.")
    print(f"Total files modified: {total_files_modified}")
    print(f"Total replacements made: {total_replacements}")

if __name__ == "__main__":
    migrate_theme()
