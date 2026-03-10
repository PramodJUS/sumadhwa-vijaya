"""
Clean up whitespace in scraped data:
1. Replace double newlines with single newlines
2. Remove trailing spaces and newlines
"""

import json
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

# Read the JSON
with open('../Grantha/grantha-details.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

changes = 0

for topic_id, topic in data.items():
    for part_id, part in topic.items():
        for key in ['वादावली', 'भावदीपा', 'प्रकाशः', 'विवर्णम्']:
            if key in part:
                original = part[key]

                # Replace multiple newlines with single newline
                cleaned = re.sub(r'\n\n+', '\n', original)

                # Remove trailing whitespace and newlines
                cleaned = cleaned.rstrip()

                if original != cleaned:
                    changes += 1

                part[key] = cleaned

# Save back
with open('../Grantha/grantha-details.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"✓ Cleaned {changes} sections")
print("✓ Changes made:")
print("  - Replaced \\n\\n with \\n")
print("  - Removed trailing spaces/newlines")
print("✓ File updated: grantha-details.json")

# Show sample
with open('../Grantha/grantha-details.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

topic1 = data['1']['Part#1']
print(f"\nSample (Topic 1 वादावली):")
print("="*60)
print(repr(topic1['वादावली']))
