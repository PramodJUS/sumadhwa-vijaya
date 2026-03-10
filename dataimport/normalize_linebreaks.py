# -*- coding: utf-8 -*-
"""
Normalize line breaks in Shloka-details.json:
- Replace \r\n with \n
- Replace multiple \n with single \n
"""

import json
import re

print("Reading Shloka-details.json...")
with open('../data/Shloka-details.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Normalize line breaks
rn_count = 0
nn_count = 0

for shloka_id, shloka in data.items():
    for key, value in shloka.items():
        if isinstance(value, str):
            # Count \r\n occurrences
            rn_count += value.count('\r\n')

            # Replace \r\n with \n
            value = value.replace('\r\n', '\n')

            # Count multiple \n occurrences before replacement
            nn_count += len(re.findall(r'\n\n+', value))

            # Replace multiple \n with single \n
            value = re.sub(r'\n\n+', '\n', value)

            shloka[key] = value

print(f"Replaced {rn_count} occurrences of \\r\\n with \\n")
print(f"Replaced {nn_count} occurrences of multiple \\n with single \\n")

# Save back
print("\nSaving normalized file...")
with open('../data/Shloka-details.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Done! File updated: Shloka-details.json")

# Show a sample
print("\nSample (Shloka 1.1):")
print("=" * 60)
with open('../data/Shloka-details.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
    text = data['1.1']['सुमध्वविजयः']
    print(f"Text: {text}")
    print(f"Repr: {repr(text)}")
print("=" * 60)
