# SMV - Sumadhwa Vijaya

A web-based application for reading and studying **Sumadhwa Vijaya**, the Sanskrit biographical epic of Sri Madhvacharya composed by Narayana Panditacharya.

## Features

- **16 Cantos (Sargas)**: Complete text organized by cantos
- **Multi-language Support**: Sanskrit, Kannada, and Telugu with automatic transliteration
- **Search Functionality**: Search across all slokas with Unicode normalization
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Clean Interface**: Easy navigation and reading experience

## Technology Stack

- Pure HTML5, CSS3, and JavaScript
- No build tools or dependencies required
- Static site - can be hosted anywhere
- Google Fonts for Devanagari script support

## Project Structure

```
SMV/
├── index.html              # Main HTML file
├── css/
│   └── styles.css         # Application styles
├── js/
│   ├── app.js            # Main application logic
│   ├── transliterate.js  # Transliteration engine
│   └── scripts/
│       ├── kannada-script.js   # Kannada mapping
│       └── telugu-script.js    # Telugu mapping
├── data/
│   └── slokas.json       # Sloka data (to be added)
└── README.md

```

## Getting Started

### Local Development

1. **Clone or download** this repository
2. **Navigate** to the project directory
3. **Start a local server**:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Python 2
   python -m SimpleHTTPServer 8000
   
   # Using Node.js
   npx http-server -p 8000
   ```
4. **Open** your browser and go to `http://localhost:8000`

### Adding Content

The application is ready to display Sumadhwa Vijaya slokas. To add content:

1. **Prepare the text**: Organize slokas by Sarga (canto) and sloka number
2. **Create data file**: Add slokas to `data/slokas.json` in this format:
   ```json
   [
     {
       "sarga": 1,
       "sloka_number": 1,
       "sloka_text": "Sanskrit text here",
       "meaning": "English meaning",
       "meaningKn": "Kannada meaning",
       "meaningTe": "Telugu meaning",
       "commentary": "Commentary text"
     }
   ]
   ```
3. **Update app.js**: Modify `loadSlokas()` function to load from your data file

## Language Support

- **Sanskrit (संस्कृतम्)**: Original Devanagari text
- **Kannada (ಕನ್ನಡ)**: Automatic transliteration
- **Telugu (తెలుగు)**: Automatic transliteration

The transliteration engine automatically converts Devanagari script to Kannada and Telugu scripts, preserving the original Sanskrit while making it accessible to regional readers.

## Features to Add

- Audio recitation of slokas
- Detailed word-by-word meaning
- Cross-references to other texts
- Bookmarking favorite slokas
- PDF export functionality
- Commentary by different scholars

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## Contributing

This is an educational and devotional project. Contributions are welcome:

1. Adding accurate sloka text
2. Providing translations
3. Adding commentaries
4. Improving the UI/UX
5. Bug fixes

## License

This project is for educational and devotional purposes. The original text of Sumadhwa Vijaya is in the public domain.

## Credits

- **Original Text**: Sumadhwa Vijaya by Narayana Panditacharya (13th century CE)
- **Subject**: Biography of Sri Madhvacharya, founder of Dvaita Vedanta
- **Font**: Noto Sans Devanagari (Google Fonts)

## About Sumadhwa Vijaya

Sumadhwa Vijaya is a 16-canto Sanskrit epic that chronicles the life and teachings of Sri Madhvacharya (1238-1317 CE), the founder of Dvaita (dualistic) Vedanta philosophy. Written by his contemporary disciple Narayana Panditacharya, it is considered the most authentic biographical source about Madhvacharya's life, miracles, philosophical debates, and establishment of the Dvaita school.

---

**For devotional and educational purposes only**
