"""
Web Scraper Template for dvaitavedanta.in
==========================================

This template provides a starting point for scraping Sanskrit texts from dvaitavedanta.in.
Each grantha (text) has different HTML structure, so you'll need to customize this template.

BEFORE STARTING:
1. Inspect the website structure for your grantha
2. Identify headings (H2, H3, etc.) and how content is organized
3. Note commentary names and desired JSON keys
4. List all topic URLs or create a discovery method

CUSTOMIZATION STEPS:
1. Update CONFIGURATION section below
2. Customize extract_topic_content() for your HTML structure
3. Update TOPIC_URLS list or implement discovery
4. Test on 1-2 topics before running full scrape
5. Run cleanup utilities after scraping

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


# ============================================================================
# CONFIGURATION - CUSTOMIZE THIS SECTION
# ============================================================================

# TODO: Update base URL and output paths
BASE_URL = "https://dvaitavedanta.in"
OUTPUT_JSON = "../data/grantha-details.json"  # Adjust path as needed
OUTPUT_CSV = "../data/mainpage.csv"           # Adjust path as needed

# TODO: Define heading to JSON key mappings for your grantha
# Example: {'वादावलीभावदीपिका': 'भावदीपा', ...}
HEADING_MAPPINGS = {
    'commentary_heading_1': 'json_key_1',
    'commentary_heading_2': 'json_key_2',
    'commentary_heading_3': 'json_key_3',
    # Add more mappings based on your grantha's commentaries
}

# TODO: List all topic URLs for your grantha
# You can either hardcode them or implement a discovery function
TOPIC_URLS = [
    {"id": 1, "url": "https://dvaitavedanta.in/...", "title": "Topic 1 Title"},
    {"id": 2, "url": "https://dvaitavedanta.in/...", "title": "Topic 2 Title"},
    # Add all topic URLs...
]


# ============================================================================
# SELENIUM SETUP
# ============================================================================

def setup_driver():
    """Initialize Chrome WebDriver with headless options"""
    chrome_options = Options()
    chrome_options.add_argument('--headless')  # Comment out for debugging
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--window-size=1920,1080')

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)

    return driver


# ============================================================================
# TEXT PROCESSING
# ============================================================================

def clean_text(text):
    """
    Clean and normalize Sanskrit text

    Customize this based on your needs:
    - Remove author attribution lines
    - Normalize whitespace
    - Handle special characters
    """
    if not text:
        return ""

    # Remove extra whitespace
    text = ' '.join(text.split())

    # Remove zero-width characters
    text = text.replace('\xa0', ' ')
    text = text.replace('\u200b', '')

    # TODO: Add grantha-specific cleaning rules
    # Example: Remove author lines containing specific keywords
    # if any(word in text for word in ['कृता', 'विरचित', 'विरचिता']):
    #     return ""

    return text.strip()


# ============================================================================
# CONTENT EXTRACTION - CUSTOMIZE THIS HEAVILY
# ============================================================================

def load_all_articles(driver):
    """
    Load all articles on the page

    TODO: Customize based on how your grantha's pages load content:
    - Some pages auto-load all content
    - Some require clicking "Load More" buttons
    - Some require clicking callArticle() links (like Vadavali)

    Returns:
        List of article WebElements
    """
    print("    Loading articles...")

    wait = WebDriverWait(driver, 15)

    # OPTION 1: Content already loaded (no interaction needed)
    # articles = driver.find_elements(By.CSS_SELECTOR, "div[id^='article']")
    # return articles

    # OPTION 2: Click "Load More" buttons
    # while True:
    #     try:
    #         load_more = wait.until(EC.element_to_be_clickable((By.ID, "loadMoreButton")))
    #         load_more.click()
    #         time.sleep(2)
    #     except:
    #         break

    # OPTION 3: Click callArticle() links (Vadavali-style)
    article_links = driver.find_elements(By.CSS_SELECTOR, "a.article[onclick^='callArticle']")

    for idx, link in enumerate(article_links, 1):
        try:
            onclick_attr = link.get_attribute('onclick')
            article_id = onclick_attr.split('(')[1].split(')')[0] if onclick_attr else 'unknown'

            if driver.find_elements(By.ID, f"article{article_id}"):
                continue

            print(f"      [{idx}/{len(article_links)}] Clicking article {article_id}...")
            driver.execute_script("arguments[0].click();", link)

            try:
                wait.until(EC.presence_of_element_located((By.ID, f"article{article_id}")))
                print(f"          ✅ Loaded")
            except TimeoutException:
                print(f"          ⚠️  Timeout")

            time.sleep(1)
        except Exception as e:
            print(f"      [WARNING] Link {idx} failed: {e}")

    articles = driver.find_elements(By.CSS_SELECTOR, "div[id^='article']")
    print(f"    [OK] Total articles: {len(articles)}")

    return articles


def extract_text_between_headings(driver, article, heading_keyword):
    """
    Extract text after an H3 heading until next heading

    TODO: Customize based on your HTML structure

    Args:
        driver: Selenium WebDriver
        article: Article WebElement
        heading_keyword: Text to search for in H3 headings

    Returns:
        Extracted and cleaned text
    """
    h3_elements = article.find_elements(By.TAG_NAME, 'h3')

    for h3 in h3_elements:
        h3_text = clean_text(h3.text)

        if heading_keyword in h3_text:
            text_parts = []
            current = h3

            while True:
                current = driver.execute_script("return arguments[0].nextElementSibling;", current)

                if current is None:
                    break

                if current.tag_name in ['h2', 'h3', 'h4']:
                    break

                if current.tag_name in ['p', 'div', 'ul', 'ol']:
                    text = clean_text(current.text)
                    if text and len(text) > 5:
                        text_parts.append(text)

            return '\n\n'.join(text_parts)

    return ''


def scrape_topic(driver, topic_url, topic_title):
    """
    Scrape a single topic

    TODO: Customize extraction logic based on your grantha's structure

    Returns:
        Dictionary with Part#1, Part#2, etc. containing commentary data
    """
    print(f"\n  URL: {topic_url}")

    try:
        driver.get(topic_url)
        time.sleep(3)

        # Load all articles
        articles = load_all_articles(driver)

        if not articles:
            print("    [WARNING] No articles found")
            return {}

        # Extract content from each article (each becomes a Part#N)
        parts = {}

        for part_num, article in enumerate(articles, 1):
            print(f"    Extracting Part#{part_num}...")

            # TODO: Initialize with your commentary keys
            part_data = {
                'main_text': '',
                'commentary_1': '',
                'commentary_2': '',
                'commentary_3': ''
            }

            # TODO: Extract main text (customize based on your structure)
            # Example: Text between H2 and first H3
            h2_elements = article.find_elements(By.TAG_NAME, 'h2')
            h3_elements = article.find_elements(By.TAG_NAME, 'h3')

            main_h2 = None
            for h2 in h2_elements:
                if 'main_heading_text' in clean_text(h2.text):  # TODO: Update
                    main_h2 = h2
                    break

            if main_h2 and h3_elements:
                text_parts = []
                current = main_h2

                while True:
                    current = driver.execute_script("return arguments[0].nextElementSibling;", current)

                    if current is None or current.tag_name in ['h2', 'h3', 'h4']:
                        break

                    if current.tag_name in ['p', 'div', 'ul', 'ol']:
                        text = clean_text(current.text)
                        if text and len(text) > 5:
                            text_parts.append(text)

                part_data['main_text'] = '\n\n'.join(text_parts)

            # TODO: Extract each commentary using heading keywords
            part_data['commentary_1'] = extract_text_between_headings(driver, article, 'commentary_1_heading')
            part_data['commentary_2'] = extract_text_between_headings(driver, article, 'commentary_2_heading')
            part_data['commentary_3'] = extract_text_between_headings(driver, article, 'commentary_3_heading')

            # Stats
            for key, value in part_data.items():
                print(f"      {key}: {len(value)} chars")

            parts[f'Part#{part_num}'] = part_data

        return parts

    except Exception as e:
        print(f"    [ERROR] Failed: {e}")
        import traceback
        traceback.print_exc()
        return {}


# ============================================================================
# MAIN SCRAPING ORCHESTRATOR
# ============================================================================

def scrape_all_topics():
    """Main scraping function"""

    print("="*70)
    print(" Web Scraper for dvaitavedanta.in")
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

            parts = scrape_topic(driver, topic_url, topic_title)

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
        print("\nNext Steps:")
        print("  1. Run cleanup utilities:")
        print("     python ../utilities/replace_dandas.py")
        print("     python ../utilities/cleanup_whitespace.py")
        print("  2. Review the generated files")
        print("  3. Test in your application")

    finally:
        driver.quit()


# ============================================================================
# ENTRY POINT
# ============================================================================

if __name__ == "__main__":
    try:
        scrape_all_topics()
    except KeyboardInterrupt:
        print("\n\n[INFO] Scraping interrupted by user")
    except Exception as e:
        print(f"\n\n[ERROR] {e}")
        import traceback
        traceback.print_exc()
