# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sumadhwa Vijaya web application - a static web app for reading and studying the Sanskrit biographical epic of Sri Madhvacharya, composed by Narayana Panditacharya in the 13th century. Features 16 cantos (sargas) with multi-language support and audio recitation.

## Technology Stack

- **Frontend**: Pure HTML5, CSS3, vanilla JavaScript
- **No build tools or bundlers** - static site ready to deploy
- **External dependencies**: CDN-loaded transliteration library from PramodJUS/devanagari-transliterate
- **Data Import**: Python-based web scraping toolkit (Selenium, BeautifulSoup)

## Development Commands

### Running Locally

Start a local HTTP server from the project root:

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js
npx http-server -p 8000
```

Then open `http://localhost:8000` in your browser.

**IMPORTANT**: The app MUST be served via HTTP server (not file:// protocol) due to CORS restrictions on loading CSV files.

### Data Import Workflow

Located in `dataimport/` directory:

```bash
# 1. Install dependencies
cd dataimport
pip install -r requirements.txt

# 2. Create custom scraper (copy template)
cp template/scraper_template.py sumadvavijaya_scraper.py

# 3. Test scraper (always test on 1-2 chapters first)
python sumadvavijaya_scraper.py

# 4. Post-process scraped data
cd utilities
python replace_dandas.py      # Normalize Devanagari dandas (।। → ॥)
python cleanup_whitespace.py  # Remove extra whitespace

# Or use Windows batch file
run-cleanup.bat
```

**Key files for data import**:
- `dataimport/START_HERE.md` - Quick start guide
- `dataimport/template/CUSTOMIZATION_GUIDE.md` - Detailed scraper customization
- `dataimport/examples/vadavali_scraper.py` - Reference implementation

## Architecture

### Core Application Flow

1. **Entry Point**: `index.html` loads the page structure
2. **Transliteration Engine**: CDN scripts load first (transliterate.js, kannada-script.js, telugu-script.js)
3. **Main App**: `js/app.js` initializes after DOM ready
4. **Data Loading**: Fetches CSV from `data/sarga-{number}.csv`
5. **Rendering**: Dynamically creates sloka cards with transliteration based on language selection

### Key Components in `js/app.js`

- **`loadSlokas()`**: Fetches and parses CSV data
- **`parseCSV(csvText)`**: Manual CSV parser handling quoted fields with commas
- **`filterSlokas()`**: Filters by selected sarga (canto)
- **`displaySlokas(slokas)`**: Renders sloka cards with transliteration
- **`showSlokaDetail(sloka)`**: Detail view with meaning and audio controls
- **`speakText(text, lang, sarga, slokaNumber)`**: Audio playback - tries MP3 first, falls back to browser TTS
- **`playAllSlokas()`**: Sequential audio playback of all slokas in current sarga

### Transliteration

Uses external library from `https://cdn.jsdelivr.net/gh/PramodJUS/devanagari-transliterate@main/`:
- **Core**: `transliterate.js` - Main transliteration engine
- **Scripts**: `kannada-script.js`, `telugu-script.js` - Character mappings

The library provides global function `transliterateText(text, targetLang)` where `targetLang` is 'kn' or 'te'.

### Data Structure

**CSV Format** (`data/sarga-{number}.csv`):
```csv
sarga,sloka_number,sloka_text,meaning,meaningKn,meaningTe
1,1,"Sanskrit sloka text","English meaning","Kannada meaning","Telugu meaning"
```

**Audio Files** (`audio/`):
- Format: `{sarga}-{sloka_number}.mp3`
- Example: `1-1.mp3`, `1-2.mp3`
- Fallback: Browser TTS (Hindi voice for Sanskrit)

### State Management

Simple global variables in `app.js`:
- `allSlokas[]` - Complete dataset
- `filteredSlokas[]` - Current sarga's slokas
- `currentLanguage` - 'sa' | 'kn' | 'te' (stored in localStorage)
- `currentView` - 'list' | 'detail'
- `isPlayingAll` - Audio playback state

### Styling

`css/styles.css` uses CSS custom properties (variables) for theming:
- Dark theme with gold accents
- Responsive design with CSS Grid/Flexbox
- Ornate design elements (borders, gradients, shadows)

## File Modification Guidelines

### Adding New Sarga Data

1. Create CSV file: `data/sarga-{number}.csv`
2. Follow exact CSV format with 6 columns
3. Use double quotes around sloka_text if it contains commas
4. Leave meaning fields empty if not yet translated

### Adding Audio Files

1. Place MP3 in `audio/` directory
2. Name format: `{sarga}-{sloka_number}.mp3`
3. App will automatically detect and play
4. No code changes needed

### Modifying Transliteration

**DO NOT** edit transliteration scripts locally - they're loaded from CDN. If changes needed:
1. Fork the upstream repo: `PramodJUS/devanagari-transliterate`
2. Update CDN URLs in `index.html` to point to your fork

### Adding New Languages

1. Update language selector in `index.html` (add option)
2. Add language object in `js/app.js` languages dictionary
3. Add CSV column for new language meanings
4. Add transliteration script if different from Devanagari
5. Update CDN script tags in `index.html`

## Important Patterns

### CSV Parsing

Uses manual CSV parser (not Papa Parse or csv-parser) to handle:
- Quoted fields containing commas
- Sanskrit text with special characters
- Maintains control over parsing behavior

**Why manual parsing**: Sanskrit slokas often contain commas, requiring quoted fields. Simple splitting breaks. The custom parser properly handles quote escaping.

### Audio Fallback Strategy

```javascript
// 1. Try MP3 file first
const audio = new Audio(`audio/${sarga}-${slokaNumber}.mp3`);
audio.onerror = () => {
    // 2. Fallback to browser TTS if MP3 not found
    useSpeechSynthesis(text, lang);
};
```

This allows gradual addition of audio files without breaking existing functionality.

### Language Persistence

```javascript
// Save preference
localStorage.setItem('smvLanguage', currentLanguage);

// Load on init
const savedLanguage = localStorage.getItem('smvLanguage') || 'sa';
```

User's language choice persists across sessions.

## Common Development Tasks

### Testing Transliteration Changes

1. Open browser console
2. Manually test: `transliterateText("नमस्ते", "kn")`
3. Verify output in Kannada script

### Adding Sample Data for Testing

Use `data/sample-slokas.csv` as reference format. Copy structure when creating new sarga files.

### Debugging Audio Issues

1. Check browser console for 404s (missing MP3s)
2. Verify file naming: `{sarga}-{sloka_number}.mp3` (not zero-padded)
3. Check audio.onerror handler is called
4. Ensure speechSynthesis API available: `'speechSynthesis' in window`

### Adding New Features

Since there's no build process:
1. Edit files directly
2. Refresh browser (hard refresh: Ctrl+F5)
3. Check browser console for errors
4. Test across languages

## Gotchas

- **CORS issues**: Must use HTTP server, not file:// protocol
- **CSV encoding**: Always UTF-8 with BOM for proper Sanskrit display
- **Audio autoplay**: Browsers may block autoplay; user interaction required first
- **Large CSV files**: Browser handles parsing synchronously; consider splitting very large sargas
- **Transliteration CDN**: If CDN is down, app breaks - consider vendoring scripts for production
- **No source maps**: Vanilla JS means line numbers in errors are accurate
- **localStorage limits**: Around 5-10MB; should be sufficient for language preference

## Data Import Gotchas

- **Always test on 1-2 chapters first** before full scrape
- **Disable headless mode** during development to watch scraper work
- **Website structure varies** per grantha - template must be customized
- **Run cleanup utilities** after scraping (dandas, whitespace)
- **Backup data** before overwriting production files

## Deployment

Since this is a static site with no build process:

1. Upload all files to any static host (GitHub Pages, Netlify, Vercel, S3, etc.)
2. Ensure MIME types configured:
   - `.csv` → `text/csv`
   - `.mp3` → `audio/mpeg`
3. Configure CORS if CDN resources needed
4. No environment variables or build step required

## Project-Specific Context

- This app is for **educational and devotional purposes**
- Sumadhwa Vijaya has **16 sargas** (cantos)
- Currently only **Sarga 1** has complete data
- Transliteration is **automatic** (not stored) - Devanagari is source of truth
- Audio recordings are **optional** - app works without them using TTS fallback
