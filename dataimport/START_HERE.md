# Getting Started - Sumadvavijaya Web Scraping

Welcome to the **dataimport** folder for scraping Sumadvavijaya from dvaitavedanta.in.

## 📍 You Are Here

```
SMV/                                 # Your Sumadvavijaya project
└── dataimport/                      # 👈 You are here
    ├── START_HERE.md                # 👈 This file
    ├── README.md                    # Full toolkit documentation
    ├── requirements.txt             # Python dependencies
    ├── template/                    # Scraper template + guide
    ├── utilities/                   # Cleanup tools
    └── examples/                    # Vadavali reference
```

## 🚀 Quick Start (5 Steps)

### Step 1: Install Dependencies

```bash
pip install -r requirements.txt
```

**What gets installed:**
- `selenium` - Browser automation
- `webdriver-manager` - Automatic ChromeDriver setup
- `beautifulsoup4` - HTML parsing (optional)
- `requests` - HTTP requests (optional)

**Requirements:**
- Python 3.7+
- Chrome browser

### Step 2: Inspect Sumadvavijaya Website

Before coding, understand the website structure:

1. **Go to dvaitavedanta.in** and find Sumadvavijaya section
2. **Open Chrome DevTools** (press F12)
3. **Document the structure:**
   - What are the chapter/section URLs?
   - What headings exist (H2, H3)?
   - What are the commentary names (if any)?
   - How does content load (auto, click, scroll)?

**Example inspection notes:**
```
Base URL: https://dvaitavedanta.in/category-details/XXXX/...
Main heading: H2 "सुमध्ववविजयः"
Chapters:
  - Sarga 1
  - Sarga 2
  - ...
Commentaries (if any):
  - H3 "commentary name" → JSON key: "commentary_key"
Loading: Auto-loaded (or click-based?)
```

### Step 3: Create Your Scraper

Copy the template and customize it:

```bash
# Copy template
cp template/scraper_template.py sumadvavijaya_scraper.py

# Edit with your favorite editor
# Update:
#   - TOPIC_URLS (or chapter URLs)
#   - HEADING_MAPPINGS
#   - Extraction logic
```

**Read the detailed guide:**
```bash
cat template/CUSTOMIZATION_GUIDE.md
# OR open in editor:
# notepad template/CUSTOMIZATION_GUIDE.md   (Windows)
# vim template/CUSTOMIZATION_GUIDE.md       (Linux/Mac)
```

### Step 4: Test on 1-2 Chapters First

**IMPORTANT:** Don't scrape all chapters at once!

```python
# In sumadvavijaya_scraper.py, temporarily limit:
TOPIC_URLS = [
    {"id": 1, "url": "https://...", "title": "Sarga 1"},
    {"id": 2, "url": "https://...", "title": "Sarga 2"},
]  # Only 2 chapters for testing

# Comment out headless mode to watch it work:
# chrome_options.add_argument('--headless')  # COMMENTED OUT
```

**Run test:**
```bash
python sumadvavijaya_scraper.py
```

**Verify output:**
- Check `../data/grantha-details.json` (or wherever you configured output)
- Verify JSON structure
- Check character counts
- Spot-check text quality

### Step 5: Run Full Scrape + Cleanup

Once testing succeeds:

1. **Re-enable all chapters** in your scraper
2. **Re-enable headless mode** (uncomment the line)
3. **Run full scrape:**
   ```bash
   python sumadvavijaya_scraper.py
   ```

4. **Run cleanup utilities:**
   ```bash
   cd utilities
   python replace_dandas.py      # Normalize dandas (।। → ॥)
   python cleanup_whitespace.py  # Clean extra newlines

   # OR use Windows batch file:
   run-cleanup.bat
   ```

## 📚 Documentation Files

| File | What It Contains | When to Read |
|------|------------------|--------------|
| **START_HERE.md** | This quick start guide | Right now! |
| **README.md** | Complete toolkit docs | For deeper understanding |
| **template/CUSTOMIZATION_GUIDE.md** | Step-by-step customization | Before coding |
| **template/scraper_template.py** | Commented code template | While coding |
| **examples/vadavali_scraper.py** | Working example | For reference |
| **examples/SCRAPING_RULES.md** | Extraction patterns | For ideas |

## 🛠️ Available Tools

### Scraper Template
- **Location:** `template/scraper_template.py`
- **Purpose:** Starting point for your scraper
- **Features:** Selenium setup, 3 loading patterns, error handling

### Cleanup Utilities
- **Location:** `utilities/`
- **Tools:**
  - `cleanup_whitespace.py` - Remove extra newlines, trim whitespace
  - `replace_dandas.py` - Normalize Devanagari dandas
  - `common_functions.py` - 14 reusable helper functions
  - `run-cleanup.bat` - Windows quick runner

### Example Scraper
- **Location:** `examples/vadavali_scraper.py`
- **Purpose:** Reference implementation (working Vadavali scraper)
- **Use:** Study this to see how a complete scraper works

## 📝 Typical Workflow

```
1. Read START_HERE.md (you are here!)
   ↓
2. Install dependencies (pip install -r requirements.txt)
   ↓
3. Inspect website structure (Chrome DevTools)
   ↓
4. Read CUSTOMIZATION_GUIDE.md
   ↓
5. Copy template → your_scraper.py
   ↓
6. Customize for Sumadvavijaya
   ↓
7. Test on 2 chapters (headless OFF)
   ↓
8. Fix issues, verify output
   ↓
9. Run full scrape (all chapters, headless ON)
   ↓
10. Run cleanup utilities
   ↓
11. Verify final data quality
   ↓
12. Deploy to your application
```

## 🎯 Your Goal

Create `sumadvavijaya_scraper.py` that produces:

**grantha-details.json:**
```json
{
  "1": {
    "Part#1": {
      "main_text": "सुमध्ववविजयः - Sarga 1 content...",
      "commentary_1": "...",
      "commentary_2": "..."
    }
  },
  "2": { ... }
}
```

**mainpage.csv:**
```csv
id,sutra_text
1,Sarga 1
2,Sarga 2
```

## ⚙️ Configuration Checklist

Before running your scraper, make sure you've configured:

- [ ] **TOPIC_URLS** - List of all Sumadvavijaya chapters/sections
- [ ] **HEADING_MAPPINGS** - Map H3 headings to JSON keys
- [ ] **OUTPUT_JSON** - Path to save JSON (e.g., `../data/grantha-details.json`)
- [ ] **OUTPUT_CSV** - Path to save CSV (e.g., `../data/mainpage.csv`)
- [ ] **Content loading method** - Auto-load, click, or scroll?
- [ ] **Text cleaning rules** - What to exclude (author lines, etc.)?

## 🐛 Troubleshooting

### "Chrome not found"
- Install Chrome browser
- Or update ChromeDriver path in scraper

### "Article not found"
- Increase timeout: `WebDriverWait(driver, 30)`
- Add delays: `time.sleep(3)`
- Check if JavaScript is loading content

### "Wrong text extracted"
- Refine `clean_text()` function
- Adjust element selectors
- Filter author attribution lines

### "Empty commentaries"
- Check heading text matches exactly
- Verify HTML structure (use DevTools)
- Ensure content loads before extraction

**See `template/CUSTOMIZATION_GUIDE.md` for detailed solutions.**

## 💡 Pro Tips

1. **Always test on 1-2 chapters first** - Don't scrape everything blindly
2. **Use visible browser initially** - Comment out `--headless` to debug
3. **Add print statements** - Track progress and verify extraction
4. **Backup your data** - Before overwriting production files
5. **Study the Vadavali example** - See `examples/vadavali_scraper.py`

## 🆘 Need Help?

1. **Read the full guide:** `template/CUSTOMIZATION_GUIDE.md`
2. **Check the main docs:** `README.md`
3. **Study working example:** `examples/vadavali_scraper.py`
4. **Review extraction rules:** `examples/SCRAPING_RULES.md`

## 🎓 Learning Resources

- **Selenium Docs:** https://www.selenium.dev/documentation/
- **Chrome DevTools:** https://developer.chrome.com/docs/devtools/
- **HTML Basics:** Understanding H2, H3, DIVs, etc.

---

## 🚦 Next Action

**👉 Your next step: Read `template/CUSTOMIZATION_GUIDE.md`**

```bash
cat template/CUSTOMIZATION_GUIDE.md
```

Then start customizing `template/scraper_template.py` for Sumadvavijaya!

---

**॥ श्री कृष्णार्पणमस्तु ॥**
