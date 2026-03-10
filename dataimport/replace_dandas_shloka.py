# -*- coding: utf-8 -*-
"""
Replace ।। with ॥ (Devanagari double danda) in Shloka-details.json
"""

import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Read the JSON
print("Reading Shloka-details.json...")
with open('../data/Shloka-details.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Replace ।। with ॥ in all text fields
count = 0
for shloka_id, shloka in data.items():
    for key, value in shloka.items():
        if isinstance(value, str):
            original = value
            replaced = original.replace('।।', '॥')
            occurrences = original.count('।।')
            if occurrences > 0:
                count += occurrences
            shloka[key] = replaced

# Save back
print(f"\nReplacing {count} occurrences of ।। with ॥...")
with open('../data/Shloka-details.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Done! File updated: Shloka-details.json")

# Show a sample
print("\nSample (Shloka 1.1):")
print("=" * 60)
with open('../data/Shloka-details.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
    print(data['1.1']['सुमध्वविजयः'])
print("=" * 60)
