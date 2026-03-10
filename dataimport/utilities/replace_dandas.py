"""
Replace || with ॥ (Devanagari double danda) in scraped data
"""

import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Read the scraped JSON
print("Reading grantha-details-scraped.json...")
with open('../Grantha/grantha-details-scraped.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Replace || with ॥ in all text fields
count = 0
for topic_id, topic in data.items():
    for part_id, part in topic.items():
        for key in ['वादावली', 'भावदीपा', 'प्रकाशः', 'विवर्णम्']:
            if key in part:
                original = part[key]
                replaced = original.replace('।।', '॥')
                occurrences = original.count('।।')
                if occurrences > 0:
                    count += occurrences
                part[key] = replaced

# Save back
print(f"\nReplacing {count} occurrences of || with ॥...")
with open('../Grantha/grantha-details-scraped.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("✓ File updated: grantha-details-scraped.json")

# Show a sample
with open('../Grantha/grantha-details-scraped.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print("\nSample (Topic 1 वादावली):")
print("=" * 60)
print(data['1']['Part#1']['वादावली'])
print("=" * 60)
