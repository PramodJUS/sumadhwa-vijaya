# -*- coding: utf-8 -*-
"""
Scrape all 16 sargas of Sumadhva Vijaya
"""

import json
import re
import time
import sys
from pathlib import Path
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

sys.stdout.reconfigure(encoding='utf-8')

# Sarga URLs (all 16 sargas)
SARGAS = [
    (1, "https://dvaitavedanta.in/category-details/10498/10497/samath/samath/parath"),
    (2, "https://dvaitavedanta.in/category-details/10502/10497/samath/samath/thavat"),
    (3, "https://dvaitavedanta.in/category-details/10504/10497/samath/samath/tataya"),
    (4, "https://dvaitavedanta.in/category-details/10506/10497/samath/samath/catara"),
    (5, "https://dvaitavedanta.in/category-details/10508/10497/samath/samath/paniac"),
    (6, "https://dvaitavedanta.in/category-details/10509/10497/samath/samath/shhash"),
    (7, "https://dvaitavedanta.in/category-details/10511/10497/samath/samath/sapata"),
    (8, "https://dvaitavedanta.in/category-details/10513/10497/samath/samath/ashhat"),
    (9, "https://dvaitavedanta.in/category-details/10516/10497/samath/samath/navama"),
    (10, "https://dvaitavedanta.in/category-details/10517/10497/samath/samath/thasha"),
    (11, "https://dvaitavedanta.in/category-details/10519/10497/samath/samath/ekatha"),
    (12, "https://dvaitavedanta.in/category-details/10521/10497/samath/samath/thavat"),
    (13, "https://dvaitavedanta.in/category-details/10523/10497/samath/samath/taraya"),
    (14, "https://dvaitavedanta.in/category-details/10526/10497/samath/samath/catara"),
    (15, "https://dvaitavedanta.in/category-details/10528/10497/samath/samath/paniac"),
    (16, "https://dvaitavedanta.in/category-details/10529/10497/samath/samath/shhada"),
]

OUTPUT = "../Grantha/grantha-details.json"

def clean_text(text):
    if not text:
        return ""
    lines = [' '.join(line.split()) for line in text.split('\n')]
    return '\n'.join(l.strip() for l in lines if l.strip())

def download_sarga_html(sarga_num, url):
    """Download HTML for a sarga using Selenium"""
    print(f"\n{'='*60}")
    print(f"Downloading Sarga {sarga_num}...")
    print(f"URL: {url}")
    print('='*60)

    options = Options()
    options.add_argument('--headless')
    options.add_argument('--disable-gpu')
    options.add_argument('--no-sandbox')

    driver = webdriver.Chrome(options=options)

    try:
        driver.get(url)
        time.sleep(3)  # Wait for page load

        # Get page source
        html = driver.page_source

        # Save to file
        filename = f"page_source_sarga_{sarga_num}.html"
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(html)

        print(f"  Saved: {filename}")
        return filename

    finally:
        driver.quit()

def extract_shlokas_from_html(sarga_num, html_file):
    """Extract shlokas from HTML file"""
    print(f"\nExtracting shlokas from Sarga {sarga_num}...")

    with open(html_file, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')

    # Find article (might have different ID for each sarga)
    article = soup.find('div', id=re.compile(r'article\d+'))
    if not article:
        print(f"  ERROR: Article div not found in {html_file}")
        return {}

    all_elements = article.find_all(['h1', 'h3'])
    print(f"  Found {len([e for e in all_elements if e.name == 'h1'])} H1 tags")
    print(f"  Found {len([e for e in all_elements if e.name == 'h3'])} H3 tags")

    result = {}
    i = 0
    shloka_num = 0

    while i < len(all_elements):
        elem = all_elements[i]

        if elem.name == 'h1':
            shloka_num += 1
            key = f"{sarga_num}.{shloka_num}"

            # Get shloka text (usually 2 H1 tags)
            shloka_parts = [clean_text(elem.get_text())]
            i += 1

            # Check if next is also H1 with ।।
            if i < len(all_elements) and all_elements[i].name == 'h1':
                next_text = all_elements[i].get_text()
                if '।' in next_text or '॥' in next_text:
                    shloka_parts.append(clean_text(next_text))
                    i += 1

            # Build shloka entry
            shloka_data = {
                'सुमध्वविजयः': '\n'.join(shloka_parts)
            }

            # Collect all H3 commentaries that follow
            while i < len(all_elements) and all_elements[i].name == 'h3':
                h3 = all_elements[i]
                h3_text = h3.get_text(strip=True)

                # Determine type
                comm_type = None
                if 'भावप्रकाशिका' in h3_text:
                    comm_type = 'भावप्रकाशिका'
                elif 'पदार्थदीपिक' in h3_text:
                    comm_type = 'पदार्थदीपिकोद्बोधिका'
                elif 'मन्दोपाकारिणी' in h3_text:
                    comm_type = 'मन्दोपाकारिणी'

                if comm_type:
                    # Extract text
                    text_parts = []
                    for sibling in h3.find_next_siblings():
                        if sibling.name in ['h1', 'h3']:
                            break
                        text = clean_text(sibling.get_text())
                        if text and len(text) > 10:
                            text_parts.append(text)

                    if text_parts:
                        shloka_data[comm_type] = '\n'.join(text_parts)

                i += 1

            result[key] = shloka_data

        else:
            i += 1

    print(f"  Extracted {len(result)} shlokas from Sarga {sarga_num}")
    return result

def normalize_text(text):
    """Normalize dandas and line breaks"""
    # Replace ।। with ॥
    text = text.replace('।।', '॥')
    # Remove multiple newlines
    text = re.sub(r'\n\n+', '\n', text)
    return text

def main():
    print("="*60)
    print("SCRAPING ALL SARGAS OF SUMADHVA VIJAYA")
    print("="*60)

    # Start with empty data
    all_data = {}

    # Scrape each sarga
    for sarga_num, url in SARGAS:
        try:
            # Download HTML
            html_file = download_sarga_html(sarga_num, url)

            # Extract shlokas
            sarga_data = extract_shlokas_from_html(sarga_num, html_file)

            # Normalize and add to all_data
            for key, shloka in sarga_data.items():
                for field, text in shloka.items():
                    shloka[field] = normalize_text(text)
                all_data[key] = shloka

            print(f"  OK Sarga {sarga_num} complete ({len(sarga_data)} shlokas)")

        except Exception as e:
            print(f"  ERROR ERROR in Sarga {sarga_num}: {e}")
            continue

        # Small delay between requests
        time.sleep(2)

    # Save combined data
    print(f"\n{'='*60}")
    print(f"Saving all {len(all_data)} shlokas...")
    with open(OUTPUT, 'w', encoding='utf-8') as f:
        json.dump(all_data, f, ensure_ascii=False, indent=2)

    print(f"OK Complete! All sargas saved to {OUTPUT}")
    print("="*60)

    # Summary
    sarga_counts = {}
    for key in all_data.keys():
        sarga = int(key.split('.')[0])
        sarga_counts[sarga] = sarga_counts.get(sarga, 0) + 1

    print("\nSummary by Sarga:")
    for sarga in sorted(sarga_counts.keys()):
        print(f"  Sarga {sarga:2d}: {sarga_counts[sarga]:3d} shlokas")

if __name__ == "__main__":
    main()
