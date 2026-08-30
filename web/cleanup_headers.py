import os
import re
import glob

directory = r'c:\Coding\SIH2026\web\src\routes\_authenticated'

def process_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Clean compliance index specific inner content
    new_content = re.sub(
        r'<div className=[\'\"]flex-1[\'\"]\s*/>\s*<MineSelector\s*/>\s*<ThemeSwitch\s*/>\s*<ProfileDropdown\s*/>',
        '',
        content
    )
    
    # 2. General replacement
    new_content = re.sub(
        r'<Header[^>]*>\s*<div className=[\'\"]flex-1[\'\"]\s*/>\s*<ThemeSwitch\s*/>\s*<ProfileDropdown\s*/>\s*</Header>',
        '<Header fixed />',
        new_content
    )
    
    new_content = re.sub(
        r'<Header[^>]*>\s*<div className=[\'\"]flex-1[\'\"]\s*/>\s*<ThemeSwitch\s*/>\s*</Header>',
        '<Header fixed />',
        new_content
    )

    new_content = re.sub(
        r'<Header[^>]*>\s*</Header>',
        '<Header fixed />',
        new_content
    )
    
    # 3. Clean imports
    new_content = re.sub(r'import { ThemeSwitch } from [^\n]+\n', '', new_content)
    new_content = re.sub(r'import { ProfileDropdown } from [^\n]+\n', '', new_content)
    new_content = re.sub(r'import { MineSelector } from [^\n]+\n', '', new_content)
    
    if content != new_content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Cleaned {path}')

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.tsx'):
            path = os.path.join(root, file)
            process_file(path)

# Special case for features/users/index.tsx
process_file(r'c:\Coding\SIH2026\web\src\features\users\index.tsx')
