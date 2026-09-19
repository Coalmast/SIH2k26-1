import os
import re

APP_DIR = r"m:\SIH\main\app"

# Ordered mapping to avoid partial replacements (e.g. replacing 'binance-surface' before 'binance-surface-card-dark')
MAPPINGS = [
    # Explicit class replacements
    (r"binance-primary", "comet-orange"),
    (r"binance-canvas-dark", "comet-canvas"),
    (r"binance-surface-card-dark", "comet-card"),
    (r"binance-surface-elevated-dark", "comet-card"),
    (r"binance-border-strong", "comet-border"),
    (r"binance-border", "comet-border"),
    (r"binance-on-dark", "comet-fg"),
    (r"binance-muted-strong", "comet-fg-muted"),
    (r"binance-muted", "comet-fg-muted"),
    (r"binance-trading-up", "comet-up"),
    (r"binance-trading-down", "comet-down"),
    (r"binance-ink", "comet-sidebar-bg"),
    
    # Yellow replacements
    (r"yellow-500", "comet-pending"),
    (r"#fcd535", "#f97316"), # Hardcoded yellow -> primary orange
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
                print(f"Failed to read {filepath}: {e}")
                continue

            new_content = content
            file_modified = False

            for old_pattern, new_replacement in MAPPINGS:
                # Case-insensitive replacement for hex codes, case-sensitive for classes
                flags = re.IGNORECASE if old_pattern.startswith("#") else 0
                
                # Count replacements
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
                    print(f"Failed to write {filepath}: {e}")

    print(f"\nMigration Complete.")
    print(f"Total files modified: {total_files_modified}")
    print(f"Total replacements made: {total_replacements}")

if __name__ == "__main__":
    migrate_theme()

