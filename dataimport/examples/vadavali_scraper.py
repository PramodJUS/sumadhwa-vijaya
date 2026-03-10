"""
Simplified Selenium Scraper - Focused on clicking callArticle() links

This version uses a simpler strategy:
1. Load page
2. Find all callArticle() links
3. Click each link and wait for content to load
4. Extract content

No excessive scrolling - just click the links directly.
"""

import json
import csv
import time
import re
import sys
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Configuration
BASE_URL = "https://dvaitavedanta.in"
OUTPUT_JSON = "../Grantha/grantha-details-scraped.json"
OUTPUT_CSV = "../Grantha/mainpage-scraped.csv"

# Heading to JSON key mapping
HEADING_MAPPINGS = {
    'वादावली': 'वादावली',
    'वादावलीभावदीपिका': 'भावदीपा',
    'भावदीपिका': 'भावदीपा',
    'वादावलीप्रकाशः': 'प्रकाशः',
    'प्रकाशः': 'प्रकाशः',
    'वादावलीविवरणम्': 'विवर्णम्',
    'विवरणम्': 'विवर्णम्'
}

# Import TOPIC_URLS from original scraper
from scrape_selenium import TOPIC_URLS, setup_driver, clean_text, extract_text_between_headings


def load_all_articles_simple(driver):
    """
    Simplified article loading: just click all the callArticle() links

    Returns:
        List of article WebElements
    """
    print("    Loading articles by clicking callArticle() links...")

    wait = WebDriverWait(driver, 15)

    # Find all links
    article_links = driver.find_elements(By.CSS_SELECTOR, "a.article[onclick^='callArticle']")

    if not article_links:
        print("      No callArticle() links found")
        return []

    print(f"      Found {len(article_links)} links to click")

    # Click each link and wait for content
    for idx, link in enumerate(article_links, 1):
        try:
            # Extract article ID
            onclick_attr = link.get_attribute('onclick')
            article_id = onclick_attr.split('(')[1].split(')')[0] if onclick_attr else 'unknown'

            # Check if already loaded
            if driver.find_elements(By.ID, f"article{article_id}"):
                print(f"      [{idx}/{len(article_links)}] Article {article_id} already loaded")
                continue

            # Click link
            print(f"      [{idx}/{len(article_links)}] Clicking article {article_id}...")
            driver.execute_script("arguments[0].click();", link)

            # Wait for article div to appear
            try:
                wait.until(EC.presence_of_element_located((By.ID, f"article{article_id}")))
                print(f"          ✅ Loaded")
            except TimeoutException:
                print(f"          ⚠️  Timeout")

            time.sleep(1)  # Brief pause between clicks

        except Exception as e:
            print(f"      [WARNING] Link {idx} failed: {e}")

    # Return all article divs
    articles = driver.find_elements(By.CSS_SELECTOR, "div[id^='article']")
    print(f"    [OK] Total articles: {len(articles)}")

    return articles


def scrape_topic_simple(driver, topic_url, topic_title):
    """
    Scrape topic using simplified approach
    """
    print(f"\n  URL: {topic_url}")

    try:
        driver.get(topic_url)
        time.sleep(3)

        # Load articles by clicking links
        articles = load_all_articles_simple(driver)

        if not articles:
            print("    [WARNING] No articles found")
            return {}

        # Extract content from each article
        parts = {}

        for part_num, article in enumerate(articles, 1):
            print(f"    Extracting Part#{part_num}...")

            part_data = {
                'वादावली': '',
                'भावदीपा': '',
                'प्रकाशः': '',
                'विवर्णम्': ''
            }

            # Extract वादावली (between H2 and first H3)
            h2_elements = article.find_elements(By.TAG_NAME, 'h2')
            h3_elements = article.find_elements(By.TAG_NAME, 'h3')

            vadavali_h2 = None
            for h2 in h2_elements:
                if clean_text(h2.text).strip() == 'वादावली':
                    vadavali_h2 = h2
                    break

            if vadavali_h2 and h3_elements:
                text_parts = []
                current = vadavali_h2

                while True:
                    current = driver.execute_script("return arguments[0].nextElementSibling;", current)

                    if current is None:
                        break

                    if current.tag_name in ['h2', 'h3', 'h4']:
                        break

                    if current.tag_name in ['p', 'div', 'ul', 'ol']:
                        text = clean_text(current.text)
                        if text and len(text) > 5:
                            if not any(marker in text for marker in ['कृता', 'कृत:', 'विरचित', 'विरचिता']):
                                text_parts.append(text)

                part_data['वादावली'] = '\n\n'.join(text_parts)

            # Extract commentaries
            part_data['भावदीपा'] = extract_text_between_headings(driver, article, 'भावदीपिका')
            part_data['प्रकाशः'] = extract_text_between_headings(driver, article, 'प्रकाश')
            part_data['विवर्णम्'] = extract_text_between_headings(driver, article, 'विवरण')

            # Stats
            print(f"      वादावली: {len(part_data['वादावली'])} chars")
            print(f"      भावदीपा: {len(part_data['भावदीपा'])} chars")
            print(f"      प्रकाशः: {len(part_data['प्रकाशः'])} chars")
            print(f"      विवर्णम्: {len(part_data['विवर्णम्'])} chars")

            parts[f'Part#{part_num}'] = part_data

        return parts

    except Exception as e:
        print(f"    [ERROR] Failed: {e}")
        import traceback
        traceback.print_exc()
        return {}


def scrape_all_topics():
    """Main scraping orchestrator"""

    print("="*70)
    print(" Simplified Vadavali Scraper (Selenium)")
    print(" - Clicks callArticle() links directly")
    print(" - Waits for content to load")
    print("="*70)
    print()

    driver = setup_driver()

    try:
        grantha_data = {}
        csv_data = []

        print(f"[STEP 1/2] Scraping {len(TOPIC_URLS)} Topics")
        print("-"*70)

        for topic_info in TOPIC_URLS:
            topic_id = str(topic_info['id'])
            topic_url = topic_info['url']
            topic_title = topic_info['title']

            print(f"\n[Topic {topic_id}] {topic_title}")

            parts = scrape_topic_simple(driver, topic_url, topic_title)

            if parts:
                grantha_data[topic_id] = parts
                csv_data.append({'id': topic_id, 'sutra_text': topic_title})
                print(f"  [OK] Scraped {len(parts)} part(s)")
            else:
                print(f"  [FAIL] No content extracted")

        # Save files
        print(f"\n[STEP 2/2] Saving Files")
        print("-"*70)

        # Save JSON
        json_path = Path(OUTPUT_JSON)
        json_path.parent.mkdir(parents=True, exist_ok=True)

        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(grantha_data, f, ensure_ascii=False, indent=2)

        print(f"  [OK] JSON: {json_path.resolve()}")
        print(f"      Topics: {len(grantha_data)}")

        # Save CSV
        csv_path = Path(OUTPUT_CSV)
        with open(csv_path, 'w', encoding='utf-8', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=['id', 'sutra_text'])
            writer.writeheader()
            writer.writerows(csv_data)

        print(f"  [OK] CSV: {csv_path.resolve()}")

        print("\n" + "="*70)
        print("[SUCCESS] Scraping Complete!")
        print("="*70)

    finally:
        driver.quit()


if __name__ == "__main__":
    try:
        scrape_all_topics()
    except KeyboardInterrupt:
        print("\n\n[INFO] Scraping interrupted by user")
    except Exception as e:
        print(f"\n\n[ERROR] {e}")
        import traceback
        traceback.print_exc()
