# Customization Guide

Step-by-step guide to adapt the scraper template for your grantha.

## Prerequisites

1. **Python 3.7+** installed
2. **Chrome browser** installed
3. Basic understanding of HTML structure
4. Developer tools knowledge (Chrome DevTools)

## Step 1: Inspect the Website

### 1.1 Find Your Grantha's Section

1. Go to https://dvaitavedanta.in
2. Navigate to your grantha's category
3. Note the base URL pattern

**Example URLs:**
- Vadavali: `https://dvaitavedanta.in/category-details/9011/4434/sharaj/vathav/vathav/managa`
- Brahmasutrabhashya: `https://dvaitavedanta.in/category-details/XXXX/YYYY/...`

### 1.2 Identify HTML Structure

Open Chrome DevTools (F12) and inspect:

1. **Main heading** - Is it H1, H2, or H3?
2. **Commentary headings** - What are the exact Sanskrit texts?
3. **Article containers** - What DIV IDs or classes contain content?
4. **Content loading** - Does content auto-load or require interaction?

**Document your findings:**
```
Main Heading: H2 with text "ब्रह्मसूत्रम्"
Commentary 1: H3 with text "माध्वभाष्यम्"
Commentary 2: H3 with text "तात्पर्यचन्द्रिका"
Article Container: <div id="article9011">
Loading Method: Clicking onclick="callArticle(9011)" links
```

## Step 2: Gather All Topic URLs

You have two options:

### Option A: Manual List

Create a list of all topic URLs:
```python
TOPIC_URLS = [
    {"id": 1, "url": "https://...", "title": "Adhyaya 1 Pada 1"},
    {"id": 2, "url": "https://...", "title": "Adhyaya 1 Pada 2"},
    # ... list all topics
]
```

### Option B: Auto-Discovery (if navigation exists)

Inspect the sidebar/navigation menu:
1. Find the `<ul class="sub-menu">` or similar
2. Extract all links matching your grantha's pattern
3. Implement discovery in scraper (see Vadavali example)

## Step 3: Configure the Scraper

### 3.1 Update Configuration Section

Edit `scraper_template.py`:

```python
# Base URL
BASE_URL = "https://dvaitavedanta.in"

# Output paths (adjust for your project structure)
OUTPUT_JSON = "../data/grantha-details.json"
OUTPUT_CSV = "../data/mainpage.csv"

# Heading mappings (from your inspection)
HEADING_MAPPINGS = {
    'ब्रह्मसूत्रम्': 'sutra',
    'माध्वभाष्यम्': 'madhva_bhashya',
    'तात्पर्यचन्द्रिका': 'tatparya_chandrika',
    'भावप्रकाशिका': 'bhava_prakashika'
}

# Topic URLs (from Step 2)
TOPIC_URLS = [
    # Your list here
]
```

### 3.2 Update Text Cleaning Rules

In `clean_text()` function:

```python
def clean_text(text):
    if not text:
        return ""

    # Remove extra whitespace
    text = ' '.join(text.split())

    # YOUR RULES HERE:
    # Example: Remove author attribution lines
    author_keywords = ['कृता', 'विरचित', 'रचना']
    if any(keyword in text for keyword in author_keywords):
        return ""

    # Add more custom rules...

    return text.strip()
```

## Step 4: Customize Content Loading

Choose the method that matches your website:

### Method 1: Auto-Loaded Content

```python
def load_all_articles(driver):
    # Content is already loaded, just find it
    articles = driver.find_elements(By.CSS_SELECTOR, "div[id^='article']")
    return articles
```

### Method 2: "Load More" Button

```python
def load_all_articles(driver):
    wait = WebDriverWait(driver, 15)

    while True:
        try:
            load_more = wait.until(
                EC.element_to_be_clickable((By.CLASS_NAME, "load-more-btn"))
            )
            load_more.click()
            time.sleep(2)
        except:
            break  # No more "Load More" button

    articles = driver.find_elements(By.CSS_SELECTOR, "div.article-content")
    return articles
```

### Method 3: Click Links (Vadavali-style)

```python
def load_all_articles(driver):
    wait = WebDriverWait(driver, 15)

    # Find all onclick links
    article_links = driver.find_elements(
        By.CSS_SELECTOR,
        "a[onclick^='callArticle']"
    )

    for link in article_links:
        # Extract article ID from onclick="callArticle(9011)"
        onclick_attr = link.get_attribute('onclick')
        article_id = onclick_attr.split('(')[1].split(')')[0]

        # Click and wait for article to load
        driver.execute_script("arguments[0].click();", link)
        wait.until(EC.presence_of_element_located((By.ID, f"article{article_id}")))
        time.sleep(1)

    articles = driver.find_elements(By.CSS_SELECTOR, "div[id^='article']")
    return articles
```

## Step 5: Customize Content Extraction

### 5.1 Update Main Text Extraction

Edit the `scrape_topic()` function:

```python
# Find main text heading (update 'your_main_heading' below)
main_h2 = None
for h2 in h2_elements:
    if 'your_main_heading' in clean_text(h2.text):
        main_h2 = h2
        break

if main_h2 and h3_elements:
    text_parts = []
    current = main_h2

    # Extract text until next heading
    while True:
        current = driver.execute_script(
            "return arguments[0].nextElementSibling;",
            current
        )

        if current is None or current.tag_name in ['h2', 'h3']:
            break

        if current.tag_name in ['p', 'div']:
            text = clean_text(current.text)
            if text and len(text) > 5:
                text_parts.append(text)

    part_data['main_text'] = '\n\n'.join(text_parts)
```

### 5.2 Update Commentary Extraction

```python
# Extract each commentary (update heading keywords)
part_data['commentary_1'] = extract_text_between_headings(
    driver, article, 'commentary_1_heading_keyword'
)
part_data['commentary_2'] = extract_text_between_headings(
    driver, article, 'commentary_2_heading_keyword'
)
```

## Step 6: Test Before Full Scrape

### 6.1 Test on Single Topic

Temporarily modify `TOPIC_URLS`:

```python
# TEST MODE - Only scrape first 2 topics
TOPIC_URLS = TOPIC_URLS[:2]
```

### 6.2 Run with Visible Browser

Comment out headless mode to watch it work:

```python
def setup_driver():
    chrome_options = Options()
    # chrome_options.add_argument('--headless')  # COMMENTED OUT for testing
    chrome_options.add_argument('--disable-gpu')
    # ... rest of options
```

### 6.3 Run Test

```bash
python scraper_template.py
```

Watch the browser and verify:
- ✅ Correct pages are loaded
- ✅ All articles/content appears
- ✅ Text extraction looks correct
- ✅ Output JSON has expected structure

### 6.4 Inspect Output

```bash
# Check JSON structure
python -c "
import json
with open('../data/grantha-details.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
print(f'Topics: {len(data)}')
for tid, parts in list(data.items())[:2]:
    print(f'Topic {tid}: {len(parts)} parts')
    for pkey, pdata in parts.items():
        print(f'  {pkey}:')
        for ckey, ctext in pdata.items():
            print(f'    {ckey}: {len(ctext)} chars')
"
```

## Step 7: Run Full Scrape

Once testing succeeds:

1. **Re-enable all topics**
   ```python
   TOPIC_URLS = [
       # All your topics...
   ]
   ```

2. **Re-enable headless mode**
   ```python
   chrome_options.add_argument('--headless')
   ```

3. **Run full scrape**
   ```bash
   python your_scraper.py
   ```

4. **Run cleanup utilities**
   ```bash
   python ../utilities/replace_dandas.py
   python ../utilities/cleanup_whitespace.py
   ```

## Step 8: Post-Processing

### 8.1 Verify Data Quality

```bash
# Count topics
python -c "
import json
with open('../data/grantha-details.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
print(f'Total topics: {len(data)}')
print(f'Total characters: {sum(len(str(v)) for v in data.values()):,}')
"

# Check for empty commentaries
python -c "
import json
with open('../data/grantha-details.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
for tid, parts in data.items():
    for pkey, pdata in parts.items():
        for ckey, ctext in pdata.items():
            if not ctext:
                print(f'WARNING: Topic {tid} {pkey} {ckey} is empty')
"
```

### 8.2 Backup Original Data

```bash
# Create backup before deploying
cp ../data/grantha-details.json ../data/grantha-details-backup-$(date +%Y%m%d).json
```

## Common Issues & Solutions

### Issue: Articles Not Loading

**Symptoms:** Empty or partial content

**Solutions:**
1. Increase timeout: `WebDriverWait(driver, 30)`  # Increase to 30 seconds
2. Add more delays: `time.sleep(3)` after clicking
3. Check if JavaScript is required - inspect Network tab in DevTools
4. Verify article container selectors are correct

### Issue: Wrong Text Extracted

**Symptoms:** Text includes headings, author names, or unwanted content

**Solutions:**
1. Refine `clean_text()` function to filter out unwanted lines
2. Adjust element selectors (only get `<p>` tags, not `<div>`)
3. Add keyword filters for author attribution
4. Check heading structure - might need to look for different tags

### Issue: Memory/Performance Problems

**Symptoms:** Browser crashes or slow scraping

**Solutions:**
1. Scrape in batches (topics 1-10, then 11-20, etc.)
2. Reduce window size: `--window-size=1280,720`
3. Increase delays between pages
4. Close browser and restart periodically

### Issue: Encoding Problems

**Symptoms:** Sanskrit text shows as � or boxes

**Solutions:**
1. Ensure UTF-8 encoding everywhere:
   ```python
   with open(path, 'w', encoding='utf-8') as f:
       json.dump(data, f, ensure_ascii=False, indent=2)
   ```
2. Add Windows console encoding fix (already in template)
3. Check source HTML encoding

## Additional Resources

- **Selenium Documentation:** https://www.selenium.dev/documentation/
- **Chrome DevTools Guide:** https://developer.chrome.com/docs/devtools/
- **Regular Expressions (for pattern matching):** https://regex101.com/

## Getting Help

If you encounter issues:

1. Check the Vadavali example scraper in `../examples/`
2. Review `SCRAPING_RULES.md` for extraction patterns
3. Enable visible browser mode to debug
4. Add `print()` statements to track progress
5. Test on a single topic first

---

**Good luck with your scraping project!**

**॥ श्री कृष्णार्पणमस्तु ॥**
