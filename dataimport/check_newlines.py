# -*- coding: utf-8 -*-
import json

with open('../Grantha/grantha-details.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

text = data['1.1']['सुमध्वविजयः']

with open('newline_check.txt', 'w', encoding='utf-8') as out:
    out.write(f"Length: {len(text)}\n")
    out.write(f"Repr: {repr(text)}\n\n")
    out.write(f"First 200 chars:\n{text[:200]}\n\n")
    out.write(f"Contains \\n: {'\\n' in text}\n")
    out.write(f"Count of \\n: {text.count(chr(10))}\n")
    out.write(f"Contains literal backslash-n: {r'\n' in text}\n")

print("Check written to newline_check.txt")
