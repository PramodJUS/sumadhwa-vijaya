# -*- coding: utf-8 -*-
"""
Create mainpage.csv from grantha-details.json
Format: sarga, shloka#, Shloka
"""

import json
import csv

print("Reading grantha-details.json...")
with open('../Grantha/grantha-details.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Loaded {len(data)} shlokas")

# Prepare CSV data
csv_rows = []

for key in sorted(data.keys(), key=lambda x: (int(x.split('.')[0]), int(x.split('.')[1]))):
    parts = key.split('.')
    sarga = parts[0]
    shloka_num = parts[1]

    # Get the main shloka text
    shloka_text = data[key].get('सुमध्वविजयः', '')

    # Replace newlines with space for single-line CSV
    shloka_text = shloka_text.replace('\n', ' ')

    csv_rows.append([sarga, shloka_num, shloka_text])

# Write CSV
output_file = '../Grantha/mainpage.csv'
print(f"\nWriting to {output_file}...")

with open(output_file, 'w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['sarga', 'shloka#', 'Shloka'])  # Header
    writer.writerows(csv_rows)

print(f"Done! Wrote {len(csv_rows)} rows to mainpage.csv")
