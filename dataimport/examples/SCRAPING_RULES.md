# Sanskrit Text Scraping Rules & Guidelines

This document contains the complete set of rules and requirements for scraping Sanskrit texts from dvaitavedanta.in. These rules ensure clean, properly formatted data suitable for web display.

## Table of Contents
1. [Extraction Rules](#extraction-rules)
2. [Text Cleanup Rules](#text-cleanup-rules)
3. [JSON Structure Requirements](#json-structure-requirements)
4. [Step-by-Step Process](#step-by-step-process)
5. [Quality Checks](#quality-checks)
6. [Common Issues & Solutions](#common-issues--solutions)

---

## Extraction Rules

### 1. Heading-Based Extraction

**CRITICAL: Extract ONLY text between specific headings**

#### For Main Text (वादावली or similar):

- **Start**: After H2 heading (e.g., `<h2>वादावली</h2>`)
- **Stop**: Before first H3 heading OR before author attribution line
- **Exclude**: Any author attribution text

#### For Commentaries (भावदीपा, प्रकाशः, विवर्णम्):

- **Start**: After specific H3 heading (e.g., `<h3>वादावलीभावदीपिका</h3>`)
- **Stop**: Before next H3 heading
- **Exclude**: Author attribution lines at start or end

### 2. Author Attribution Exclusion

**CRITICAL: Only remove SHORT standalone attribution lines (< 150 chars)**

Attribution lines are typically short, standalone lines at the beginning or end of sections. **DO NOT remove commentary prose that happens to contain attribution-like words!**

**Patterns to look for:**

```python
# Patterns that indicate attribution:
- 'कृता'        # ...कृता (composed by feminine)
- 'कृत:'        # ...कृत: (composed by masculine)
- 'विरचित'      # विरचित (authored)
- 'विरचिता'     # विरचिता (authored feminine)
- 'विरचितं'     # विरचितं (authored neuter)
```

**Implementation Rule:**
```python
# ONLY remove if line is < 150 chars
if len(line.strip()) < 150:
    # Check patterns
```

**Examples of text to EXCLUDE:**
```
श्रीराघवेन्द्रयतिकृता                                      # 27 chars - REMOVE
श्रीनिवासतीर्थविरचितः                                      # 24 chars - REMOVE
श्री उमर्जी तिरुमलाचार्यसुतकृष्णविरचितं                       # 46 chars - REMOVE
इति श्रीवादावलीवादावलीभावदीपिका राघवेन्द्रयतिकृता समाप्ता  # 59 chars - REMOVE
```

**Examples of text to KEEP (commentary prose, not attribution):**
```
अथ परमकारुणिको जयतीर्थश्रीमच्चरणः श्रीमदाचार्यैस्तत्र तत्र विक्षिप्य वर्णितं मायावादिनां दूषणं...
# 804 chars - KEEP! This is commentary prose mentioning the author, not attribution

श्रीविष्णुनमनरूपमङ्गलं कृत्वा शिष्यशिक्षायै ग्रन्थादावुपनिबध्नाति
# Part of commentary explaining the author's action, not standalone attribution - KEEP!
```

**Why the 150 char limit?**
- Attribution lines are typically 20-100 characters
- Commentary prose mentioning authors is typically 200+ characters
- 150 chars is a safe middle ground to avoid false positives

### 3. Multiple Parts Handling

**Each topic can have multiple parts (Part#1, Part#2, etc.)**

- Each article div on the page = one Part
- Article divs are lazy-loaded via JavaScript
- Must scroll and click "Load More" to reveal all parts
- Extract all 4 sections for each part

**Example:**
```
Topic 4 has 4 parts:
- Part#1: article9061
- Part#2: article9062
- Part#3: article9063
- Part#4: article9064
```

### 4. Heading Detection

**Heading hierarchy on dvaitavedanta.in:**

```html
<h2>वादावली</h2>               <!-- Main text heading -->
<h3>वादावलीभावदीपिका</h3>      <!-- Commentary 1 -->
<h3>वादावलीप्रकाशः</h3>         <!-- Commentary 2 -->
<h3>वादावलीविवरणम्</h3>        <!-- Commentary 3 -->
```

**Important:**
- Main text uses H2 (not H3!)
- Commentaries use H3
- Extract text between headings, not including heading text itself

---

## Text Cleanup Rules

### 1. Danda Normalization

**MUST REPLACE:**
```
।। → ॥  (two single dandas → one double danda character)
```

**Example:**
```
Before: सत्याशेषजगज्जन्मपूर्वकर्त्रे मुरद्विषे ।। १ ।।
After:  सत्याशेषजगज्जन्मपूर्वकर्त्रे मुरद्विषे ॥ १ ॥
```

**Implementation:**
```python
text = text.replace('।।', '॥')
```

### 2. Whitespace Cleanup

**MUST APPLY these rules in order:**

#### a) Replace double newlines with single newlines
```python
import re
text = re.sub(r'\n\n+', '\n', text)
```

**Example:**
```
Before: "line1\n\nline2\n\n\nline3"
After:  "line1\nline2\nline3"
```

#### b) Remove trailing whitespace and newlines
```python
text = text.rstrip()
```

**Example:**
```
Before: "content\n\n  \n"
After:  "content"
```

#### c) Normalize internal whitespace
```python
# Remove zero-width spaces and non-breaking spaces
text = text.replace('\u200b', '')  # Zero-width space
text = text.replace('\xa0', ' ')   # Non-breaking space to regular space
```

### 3. Line-by-Line Cleaning

**Within each line:**
```python
# Remove extra spaces within line
line = ' '.join(line.split())
```

**Example:**
```
Before: "नमो    गणपतये     नमः"
After:  "नमो गणपतये नमः"
```

---

## JSON Structure Requirements

### 1. Overall Structure

```json
{
  "1": {
    "Part#1": {
      "वादावली": "text...",
      "भावदीपा": "text...",
      "प्रकाशः": "text...",
      "विवर्णम्": "text..."
    },
    "Part#2": { ... }
  },
  "2": { ... }
}
```

### 2. Key Naming Convention

**Topic IDs:** Sequential numbers as strings ("1", "2", "3", ...)

**Part IDs:** Format `"Part#N"` where N starts from 1
- "Part#1" (always required, even if only one part)
- "Part#2" (if exists)
- "Part#3" (if exists)
- etc.

**Section Keys:** Exact Sanskrit text (must match exactly)
- "वादावली" (main text)
- "भावदीपा" (Bhava Dipika commentary)
- "प्रकाशः" (Prakasha commentary)
- "विवर्णम्" (Vivarnam commentary)

### 3. Text Storage

**All text must:**
- Use UTF-8 encoding
- Store newlines as `\n` (not `\\n` or actual line breaks)
- Be properly JSON-escaped
- Have no trailing whitespace

**Example:**
```json
{
  "वादावली": "नमोऽगणितकल्याणगुणपूर्णाय विष्णवे ।\nसत्याशेषजगज्जन्मपूर्वकर्त्रे मुरद्विषे ॥ १ ॥"
}
```

### 4. CSV Structure

**mainpage.csv format:**
```csv
id,sutra_text
1,मङ्गलमाचरणम्
2,विप्रतिपत्तिविचार:
3,मिथ्यात्वनिरुक्तिनिरास:
```

**Rules:**
- UTF-8 encoding with BOM (for Excel compatibility)
- Two columns: id, sutra_text
- No quotes unless text contains commas
- Sequential IDs starting from 1

---

## Step-by-Step Process

### Phase 1: Setup & Discovery

1. **Install dependencies:**
   ```bash
   pip install selenium webdriver-manager
   ```

2. **Discover all topic URLs:**
   - Navigate to grantha's main page
   - Extract all topic links from sidebar navigation
   - Store URLs with titles in TOPIC_URLS list

3. **Verify URL pattern:**
   ```
   Pattern: https://dvaitavedanta.in/category-details/{ID}/4434/{path}/{grantha}/{grantha}/{slug}
   Example: https://dvaitavedanta.in/category-details/9011/4434/sharaj/vathav/vathav/managa
   ```

### Phase 2: Scraping

4. **For each topic URL:**

   a) **Load page with Selenium:**
   ```python
   driver.get(url)
   time.sleep(3)  # Wait for initial load
   ```

   b) **Trigger lazy loading:**
   ```python
   # Scroll down 15 times
   for _ in range(15):
       driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
       time.sleep(2)

       # Click "Load More" if present
       try:
           load_more = driver.find_element(By.LINK_TEXT, "Load More")
           if load_more.is_displayed():
               load_more.click()
               time.sleep(2)
       except:
           pass
   ```

   c) **Find all article divs:**
   ```python
   articles = driver.find_elements(By.CSS_SELECTOR, "div[id^='article']")
   ```

   d) **For each article (Part):**

   - Extract वादावली (text between H2 and first H3)
   - Extract भावदीपा (text after H3 containing 'भावदीपिका')
   - Extract प्रकाशः (text after H3 containing 'प्रकाश')
   - Extract विवर्णम् (text after H3 containing 'विवरण')

5. **Save raw data to JSON**

### Phase 3: Cleanup

6. **Remove author attributions:**
   ```python
   # Check each line for attribution patterns
   # Remove lines containing: कृता, विरचित, विरचिता, etc.
   ```

7. **Normalize dandas:**
   ```python
   text = text.replace('।।', '॥')
   ```

8. **Clean whitespace:**
   ```python
   # Replace \n\n+ with \n
   text = re.sub(r'\n\n+', '\n', text)
   # Remove trailing whitespace
   text = text.rstrip()
   ```

9. **Save final cleaned data**

### Phase 4: Validation

10. **Run quality checks** (see Quality Checks section below)

11. **Manual verification:**
    - Check Topic 1 for correct extraction
    - Check a multi-part topic (e.g., Topic 4)
    - Verify no author attributions present
    - Verify proper danda usage

12. **Backup old data and deploy:**
    ```bash
    mv grantha-details.json grantha-details_old.json
    mv mainpage.csv mainpage_old.csv
    mv grantha-details-scraped.json grantha-details.json
    mv mainpage-scraped.csv mainpage.csv
    ```

---

## Quality Checks

### Automated Checks

**Run these checks programmatically:**

```python
import json

with open('grantha-details.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Check 1: All topics have Part#1
for topic_id in data:
    assert 'Part#1' in data[topic_id], f"Topic {topic_id} missing Part#1"

# Check 2: All parts have all 4 sections
for topic_id, topic in data.items():
    for part_id, part in topic.items():
        for key in ['वादावली', 'भावदीपा', 'प्रकाशः', 'विवर्णम्']:
            assert key in part, f"Topic {topic_id} {part_id} missing {key}"

# Check 3: No author attributions
attribution_patterns = ['कृता', 'कृत:', 'विरचित', 'विरचिता']
for topic_id, topic in data.items():
    for part_id, part in topic.items():
        for key, text in part.items():
            for pattern in attribution_patterns:
                # Check first and last 200 chars (where attributions typically appear)
                assert pattern not in text[:200] and pattern not in text[-200:], \
                    f"Attribution found in Topic {topic_id} {part_id} {key}"

# Check 4: No double newlines
for topic_id, topic in data.items():
    for part_id, part in topic.items():
        for key, text in part.items():
            assert '\n\n' not in text, f"Double newline in Topic {topic_id} {part_id} {key}"

# Check 5: No trailing whitespace
for topic_id, topic in data.items():
    for part_id, part in topic.items():
        for key, text in part.items():
            assert text == text.rstrip(), f"Trailing whitespace in Topic {topic_id} {part_id} {key}"

# Check 6: Proper dandas (no ।।)
for topic_id, topic in data.items():
    for part_id, part in topic.items():
        for key, text in part.items():
            assert '।।' not in text, f"Improper danda in Topic {topic_id} {part_id} {key}"

print("✓ All quality checks passed!")
```

### Manual Checks

**Verify these manually:**

1. **Topic 1 (Mangalacharanam):**
   - वादावली should be ~80-100 chars (just the invocation verse)
   - Should NOT contain "राघवेन्द्र" or "विरचित"
   - Should have proper ॥ dandas

2. **Multi-part topic (e.g., Topic 4):**
   - Should have 4+ parts
   - Each part should have all 4 sections
   - Part#2 should contain expected text

3. **Last topic:**
   - Should NOT have closing attribution lines
   - All sections should end cleanly

4. **Random sampling:**
   - Check 5-10 random topics
   - Verify text starts with actual content, not attributions
   - Verify no double newlines
   - Verify proper Sanskrit formatting

### Re-Scraping for Verification

**Why verify by re-scraping?**

During development, we discovered that the original scraped data had **Sanskrit typos**:
- Original: `भीमसोवितम्` (invalid word)
- Correct: `भीमसेवितम्` (from सेव् = to serve)

Re-scraping individual topics helps catch:
- OCR errors or typos in the source data
- Incomplete content extraction
- Attribution lines that should be removed

**How to verify a topic:**

Create a verification script (e.g., `verify_topic1.py`):

```python
from selenium import webdriver
from selenium.webdriver.common.by import By
import time
import json

# Setup Chrome (headless)
driver = webdriver.Chrome()

# Navigate to topic URL
url = "https://dvaitavedanta.in/category-details/9011/4434/sharaj/vathav/vathav/managa"
driver.get(url)
time.sleep(5)

# Scroll to load content
for i in range(15):
    driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
    time.sleep(2)

# Find प्रकाशः heading
h3_elements = driver.find_elements(By.TAG_NAME, 'h3')
for h3 in h3_elements:
    if h3.text.strip() == 'वादावलीप्रकाशः':
        # Extract text between this H3 and next heading
        # (use get_text_between_elements helper)
        prakasha_text = extract_text_here()

        # Compare with JSON data
        with open('../Grantha/grantha-details.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            current_text = data['1']['Part#1']['प्रकाशः']

        # Apply same cleanups to scraped text
        scraped_clean = prakasha_text.replace('।।', '॥')
        # ... other cleanups

        # Compare lengths and content
        print(f"Scraped: {len(scraped_clean)} chars")
        print(f"Current: {len(current_text)} chars")
        print(f"Match: {scraped_clean == current_text}")

        # Look for spelling differences
        if scraped_clean != current_text:
            print("DIFFERENCES FOUND - Manual review needed")

driver.quit()
```

**When to re-scrape verify:**
- After initial scraping of new grantha
- When content seems suspiciously short
- When Sanskrit looks incorrect (typos, invalid words)
- Before production deployment

**Example findings:**
- Topic 1's प्रकाशः: Original had 441 chars (incomplete), re-scraping revealed it should be 1,239 chars
- Sanskrit typos: `तीर्थर्यचरणा` should be `तीर्थार्यचरणा` (आर्य = noble)

---

## Common Issues & Solutions

### Issue 1: Empty वादावली sections

**Symptom:** `वादावली: 0 chars`

**Cause:** Heading is H2, but script is looking for H3

**Solution:**
```python
# Look for H2 "वादावली" specifically
h2_elements = article.find_elements(By.TAG_NAME, 'h2')
for h2 in h2_elements:
    if clean_text(h2.text).strip() == 'वादावली':
        vadavali_h2 = h2
        break
```

### Issue 2: वादावली and भावदीपा have identical text

**Symptom:** Same character count and content

**Cause:** Substring matching - 'वादावली' matches 'वादावलीभावदीपिका'

**Solution:**
```python
# Use exact match for वादावली heading
if start_heading_text == 'वादावली':
    if h3_text == 'वादावली':  # Exact match
        start_h3 = h3
        break
else:
    if start_heading_text in h3_text:  # Substring match for others
        start_h3 = h3
        break
```

### Issue 3: Only 1 article found when multiple parts exist

**Symptom:** Topic should have 5 parts but only 1 found

**Cause:** Insufficient scrolling/lazy loading

**Solution:**
```python
# Increase scroll attempts
for _ in range(20):  # Increase from 15 to 20
    driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
    time.sleep(2.5)  # Increase delay from 2 to 2.5 seconds
```

### Issue 4: Author attribution still present

**Symptom:** Lines like "श्रीनिवासतीर्थविरचितः" in text

**Cause:** Pattern not in exclusion list

**Solution:**
```python
# Add to exclusion patterns
attribution_patterns = [
    r'श्री.*?विरचित[ःंम्]?',
    r'श्री.*?कृत[ःाम्]?',
    'राघवेन्द्रयतिकृता',
    'निवासतीर्थविरचितः',
]

# Remove lines containing patterns
for pattern in attribution_patterns:
    if re.search(pattern, line):
        # Skip this line
        continue
```

### Issue 5: Double newlines remain after cleanup

**Symptom:** `\n\n` still in text

**Cause:** Cleanup ran before extraction added them

**Solution:**
```python
# Run cleanup AFTER all extraction is complete
# Order matters:
# 1. Extract all text
# 2. Remove author attributions
# 3. Normalize dandas
# 4. Clean whitespace (including \n\n removal)
```

### Issue 6: Trailing whitespace in JSON

**Symptom:** Text ends with spaces or newlines

**Cause:** Not calling .rstrip() on final text

**Solution:**
```python
# Always rstrip before saving
part[key] = text.rstrip()
```

---

## Adapting for Other Granthas

### 1. Update Configuration

```python
# Update these for the new grantha:
BASE_URL = "https://dvaitavedanta.in"
GRANTHA_PATH = "vathav"  # Change to new grantha path
OUTPUT_JSON = "../Grantha/pramanapaddhati-details.json"  # Change name
OUTPUT_CSV = "../Grantha/pramanapaddhati-topics.csv"
```

### 2. Update Topic URLs

**Method 1: Manual list**
```python
TOPIC_URLS = [
    {"id": 1, "url": "...", "title": "..."},
    {"id": 2, "url": "...", "title": "..."},
    # ... etc
]
```

**Method 2: Auto-discovery**
```python
def discover_topics():
    # Navigate to grantha main page
    # Extract links from sidebar
    # Return list of URLs
```

### 3. Verify Heading Structure

**Check if heading structure is same:**
```python
# Run debug script on first topic
# Verify:
# - Is main text H2 or H3?
# - Are commentaries H3 or H4?
# - What are exact heading texts?
```

### 4. Update Commentary Mappings

```python
# Update for new grantha if different
HEADING_MAPPINGS = {
    'grantha_name': 'grantha_name_key',
    'grantha_name_commentary1': 'commentary1_key',
    # ... etc
}
```

### 5. Run Test First

```bash
# Test on single topic first
python test_single_topic.py

# Verify extraction is correct
# Then run full scraping
python scrape_selenium.py
```

---

## File Organization

**Recommended folder structure:**

```
dataimport/
├── SCRAPING_RULES.md          # This file
├── scrape_selenium.py         # Main scraper
├── test_single_topic.py       # Single topic test
├── debug_headings.py          # Debug heading structure
├── replace_dandas.py          # Danda normalization
├── remove_attributions.py     # Attribution removal
├── cleanup_whitespace.py      # Whitespace cleanup
├── requirements.txt           # Python dependencies
├── scrape-full.bat           # Windows batch file
└── README.md                  # Usage instructions
```

---

## Success Criteria

**Data is ready for production when:**

- ✓ All topics scraped successfully
- ✓ All parts extracted for multi-part topics
- ✓ All 4 sections present for each part
- ✓ No author attributions present
- ✓ Proper dandas (॥) used
- ✓ Single newlines only (no \n\n)
- ✓ No trailing whitespace
- ✓ All quality checks pass
- ✓ Manual verification on sample topics looks good
- ✓ Website displays correctly with new data

---

## Version History

- **v1.0** (2026-03-07): Initial rules documentation based on Vadavali scraping project
  - Heading-based extraction
  - Author attribution removal
  - Danda normalization
  - Whitespace cleanup
  - Multi-part handling

---

## Notes

- These rules were developed through iterative testing on Vadavali
- Each grantha may have slight variations - always test first
- The quality checks are comprehensive but not exhaustive
- Manual verification is still essential for production readiness
- Preserve old data with `_old` suffix before deploying new data

---

**End of Document**
