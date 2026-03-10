# How to Copy This Toolkit to Other Projects

Quick reference for copying the scraping toolkit to your other grantha projects.

## For Brahmasutrabhashya (vedanta folder)

### Windows (PowerShell):

```powershell
# From the Vadavali project folder
Copy-Item -Path "scraping-toolkit" -Destination "..\vedanta\dataimport" -Recurse

# Verify
dir ..\vedanta\dataimport
```

### Windows (Command Prompt):

```cmd
REM From the Vadavali project folder
xcopy /E /I scraping-toolkit ..\vedanta\dataimport

REM Verify
dir ..\vedanta\dataimport
```

### Linux/Mac:

```bash
# From the Vadavali project folder
cp -r scraping-toolkit ../vedanta/dataimport

# Verify
ls -la ../vedanta/dataimport
```

## For Sumadvavijaya (SMV folder)

### Windows (PowerShell):

```powershell
Copy-Item -Path "scraping-toolkit" -Destination "..\SMV\dataimport" -Recurse
```

### Windows (Command Prompt):

```cmd
xcopy /E /I scraping-toolkit ..\SMV\dataimport
```

### Linux/Mac:

```bash
cp -r scraping-toolkit ../SMV/dataimport
```

## After Copying

### 1. Navigate to the new location

```bash
cd ../vedanta/dataimport
# or
cd ../SMV/dataimport
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Copy and customize the template

```bash
# Copy template scraper
cp template/scraper_template.py brahmasutra_scraper.py

# Copy config template
cp template/config_template.json config.json
```

### 4. Follow the customization guide

Read `template/CUSTOMIZATION_GUIDE.md` for step-by-step instructions.

### 5. Start customizing

Edit `brahmasutra_scraper.py` (or whatever you named it) with your grantha's specific:
- Topic URLs
- Heading mappings
- Extraction logic

## Folder Structure After Copying

```
vedanta/
├── ... (existing files)
└── dataimport/                      # NEW
    ├── README.md
    ├── requirements.txt
    ├── template/
    │   ├── scraper_template.py
    │   ├── config_template.json
    │   └── CUSTOMIZATION_GUIDE.md
    ├── utilities/
    │   ├── cleanup_whitespace.py
    │   ├── replace_dandas.py
    │   └── common_functions.py
    └── examples/
        ├── vadavali_scraper.py      # Reference
        └── SCRAPING_RULES.md

SMV/
├── ... (existing files)
└── dataimport/                      # NEW
    └── ... (same structure as above)
```

## Quick Start After Copying

```bash
# 1. Go to project folder
cd ../vedanta/dataimport   # or ../SMV/dataimport

# 2. Install dependencies
pip install -r requirements.txt

# 3. Read the guide
cat template/CUSTOMIZATION_GUIDE.md

# 4. Start customizing
# Edit template/scraper_template.py with your specific requirements

# 5. Test on 1-2 topics first
python your_scraper.py

# 6. Run cleanup after scraping
cd utilities
python replace_dandas.py
python cleanup_whitespace.py
```

## Tips

1. **Don't edit the template directly** - Make a copy first:
   ```bash
   cp template/scraper_template.py my_scraper.py
   ```

2. **Keep the toolkit updated** - If you improve utilities, copy them back to Vadavali:
   ```bash
   cp utilities/common_functions.py ../../Vadavali/scraping-toolkit/utilities/
   ```

3. **Document your customizations** - Create a `README.md` in your project describing:
   - Website structure
   - Heading patterns
   - Any special handling needed

4. **Test incrementally** - Don't scrape all topics at once:
   ```python
   # In your scraper
   TOPIC_URLS = TOPIC_URLS[:2]  # Test first 2 topics
   ```

## Need Help?

- Check `README.md` - Overview and quick start
- Read `template/CUSTOMIZATION_GUIDE.md` - Detailed step-by-step guide
- Review `examples/vadavali_scraper.py` - Working example
- See `examples/SCRAPING_RULES.md` - Extraction pattern examples

---

**॥ श्री कृष्णार्पणमस्तु ॥**
