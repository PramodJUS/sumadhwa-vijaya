# -*- coding: utf-8 -*-
import csv

with open('../Grantha/mainpage.csv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    header = next(reader)
    row1 = next(reader)
    row2 = next(reader)

with open('csv_check.txt', 'w', encoding='utf-8') as out:
    out.write(f"Header: {header}\n\n")
    out.write(f"Row 1 shloka text:\n{row1[2]}\n\n")
    out.write(f"Repr: {repr(row1[2])}\n\n")
    out.write(f"Contains actual newline: {chr(10) in row1[2]}\n")
    out.write(f"Contains literal \\n string: {'\\n' in repr(row1[2])}\n")

print("CSV check written to csv_check.txt")
