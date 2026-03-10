# Web Scraping Toolkit for dvaitavedanta.in

Portable toolkit for scraping Sanskrit philosophical texts from dvaitavedanta.in.

## 📦 What's Included

```
scraping-toolkit/
├── README.md                    # This file
├── requirements.txt             # Python dependencies
│
├── template/                    # Starting point for new projects
│   ├── scraper_template.py      # Fully commented scraper template
│   ├── config_template.json     # Configuration template
│   └── CUSTOMIZATION_GUIDE.md   # Step-by-step adaptation guide
│
├── utilities/                   # Reusable post-processing tools
│   ├── cleanup_whitespace.py    # Remove extra newlines & whitespace
│   ├── replace_dandas.py        # Normalize Devanagari dandas (।। → ॥)
│   └── common_functions.py      # Shared helper functions
│
└── examples/                    # Reference implementations
    ├── vadavali_scraper.py      # Working Vadavali scraper
    └── SCRAPING_RULES.md        # Vadavali extraction rules
```

## 🚀 Quick Start

### 1. Copy Toolkit to Your Project

```bash
# For Brahmasutrabhashya project
cp -r scraping-toolkit /path/to/vedanta/dataimport

# For Sumadvavijaya project
cp -r scraping-toolkit /path/to/SMV/dataimport
```

### 2. Install Dependencies

```bash
cd /path/to/your/project/dataimport
pip install -r requirements.txt
```

**Requirements:**
- Python 3.7+
- Chrome browser
- selenium
- webdriver-manager

### 3. Customize the Scraper

Follow the **[CUSTOMIZATION_GUIDE.md](template/CUSTOMIZATION_GUIDE.md)** in the `template/` folder.

**Key steps:**
1. Inspect your grantha's HTML structure
2. Update heading mappings
3. List topic URLs
4. Customize extraction logic
5. Test on 1-2 topics
6. Run full scrape

### 4. Run Your Scraper

```bash
python your_scraper.py
```

### 5. Post-Processing

```bash
# Normalize dandas
python utilities/replace_dandas.py

# Clean whitespace
python utilities/cleanup_whitespace.py
```

## 🎯 Use Cases

This toolkit is designed for scraping granthas from dvaitavedanta.in, including:

- **Brahma Sutras** with commentaries (Madhva Bhashya, Tatparya Chandrika, etc.)
- **Tatvaprakashika** with vyakhyanas
- **Sumadvavijaya** chapters
- **Vadavali** with Bhava Deepa, Prakasha, Vivaranam (reference example included)
- Any other Sanskrit texts on the platform

## 📚 Documentation

| File | Purpose | Audience |
|------|---------|----------|
| **README.md** (this file) | Quick start & overview | Everyone |
| **template/CUSTOMIZATION_GUIDE.md** | Detailed adaptation steps | New users |
| **template/scraper_template.py** | Commented code template | Developers |
| **examples/SCRAPING_RULES.md** | Vadavali extraction patterns | Reference |

## 🛠️ Utilities

### cleanup_whitespace.py

Cleans up scraped JSON data:
- Replaces `\n\n` with `\n` (single newlines)
- Removes trailing whitespace from lines
- Preserves Unicode Sanskrit characters

**Usage:**
```bash
python utilities/cleanup_whitespace.py
```

Prompts for input/output file paths.

### replace_dandas.py

Normalizes Devanagari dandas:
- Replaces `।।` (double vertical bar) with `॥` (proper double danda)
- Works on any JSON file with Sanskrit text

**Usage:**
```bash
python utilities/replace_dandas.py
```

Prompts for input/output file paths.

### common_functions.py

Shared helper functions:
- `clean_sanskrit_text()` - Text normalization
- `extract_between_elements()` - DOM traversal helper
- `retry_on_failure()` - Retry decorator for network calls

**Usage:**
```python
from utilities.common_functions import clean_sanskrit_text

text = clean_sanskrit_text(raw_text)
```

## 📖 Key Concepts

### Why Each Grantha Needs Custom Scraper

Unlike typical web scraping where you might use a generic crawler, dvaitavedanta.in has:

1. **Different HTML structures** per grantha
   - Some use H2 for main text, others use H3
   - Commentary headings vary in naming and hierarchy
   - Article containers have different IDs/classes

2. **Different content loading patterns**
   - Some auto-load all content
   - Some require clicking "Load More" buttons
   - Some use JavaScript onclick handlers (like Vadavali)

3. **Different output requirements**
   - Number of commentaries varies (2-4+)
   - JSON key names depend on your application
   - Multi-part topics organized differently

**Solution:** Use this toolkit's template as a starting point and customize for each grantha.

### What IS Reusable

✅ **Selenium setup** - Same browser automation code
✅ **Text cleaning** - Unicode normalization, whitespace handling
✅ **Post-processing** - Danda replacement, cleanup utilities
✅ **Overall structure** - Main scraping flow and patterns
✅ **Error handling** - Timeout handling, retry logic

❌ **NOT Reusable:**
- Heading mappings (grantha-specific)
- Topic URLs (grantha-specific)
- HTML selectors (page structure differs)
- Extraction logic (content organization varies)

## 🎓 Best Practices

### Before Scraping

1. **Inspect the website thoroughly**
   - Use Chrome DevTools to examine HTML structure
   - Document all heading patterns
   - Test content loading behavior manually

2. **Start small**
   - Test on 1-2 topics first
   - Verify output structure
   - Check text quality

3. **Plan your JSON structure**
   - Decide on key names in advance
   - Match your application's data model
   - Document the schema

### During Scraping

1. **Use visible browser mode initially**
   - Comment out `--headless` to watch it work
   - Catch issues early

2. **Add logging**
   - Print progress after each topic
   - Log character counts to verify extraction
   - Note any warnings or errors

3. **Handle failures gracefully**
   - Don't abort entire scrape on one failure
   - Log failed topics and continue
   - Retry failed topics later

### After Scraping

1. **Always run cleanup utilities**
   - Normalize dandas
   - Clean whitespace
   - Validate JSON structure

2. **Backup original data**
   - Keep previous version before overwriting
   - Use dated backups: `data-20260310.json`

3. **Verify data quality**
   - Check for empty commentaries
   - Spot-check random topics
   - Compare character counts

## 🐛 Troubleshooting

### Common Issues

**"Chrome not found" error**
```bash
# Install Chrome browser
# Or update ChromeDriver path in scraper
```

**Articles not loading**
```python
# Increase timeout
WebDriverWait(driver, 30)  # Was 15

# Add more delays
time.sleep(3)  # After each click
```

**Wrong text extracted**
```python
# Refine clean_text() function
# Add keyword filters
# Adjust element selectors
```

**Memory issues**
```python
# Scrape in batches
TOPIC_URLS = TOPIC_URLS[0:10]  # First 10
# Then 10:20, 20:30, etc.
```

**Encoding problems**
```python
# Ensure UTF-8 everywhere
with open(path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
```

See **[CUSTOMIZATION_GUIDE.md](template/CUSTOMIZATION_GUIDE.md)** for detailed solutions.

## 📊 Success Metrics

When your scraper is working correctly:

- ✅ All topics scraped (0 failures)
- ✅ All commentaries present (no empty fields)
- ✅ Text is clean (no HTML tags, author lines removed)
- ✅ Dandas normalized (`॥` not `।।`)
- ✅ Single newlines only (no `\n\n`)
- ✅ JSON structure matches your application

**Vadavali Results (for reference):**
- 47 topics scraped
- 150+ articles captured
- 100% success rate
- 3.8MB of Sanskrit text
- ~15 minutes total scraping time

## 🔄 Workflow Summary

```
1. Copy toolkit to project
   ↓
2. Install dependencies
   ↓
3. Inspect website structure
   ↓
4. Customize scraper_template.py
   ↓
5. Test on 1-2 topics
   ↓
6. Run full scrape
   ↓
7. Run cleanup utilities
   ↓
8. Verify data quality
   ↓
9. Backup & deploy
```

## 📄 License

Part of the Vadavali project. Use freely for scraping Sanskrit texts from dvaitavedanta.in.

## 🙏 Acknowledgments

- dvaitavedanta.in for hosting Sanskrit texts
- Selenium WebDriver project
- Chrome WebDriver team

---

**For detailed customization instructions, see [template/CUSTOMIZATION_GUIDE.md](template/CUSTOMIZATION_GUIDE.md)**

**॥ श्री कृष्णार्पणमस्तु ॥**
