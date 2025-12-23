// Global variables
let allSlokas = [];
let filteredSlokas = [];
let currentLanguage = 'sa';
let currentView = 'list';

// Language translations
const languages = {
    sa: {
        title: 'Sumadhwa Vijaya - The Life of Sri Madhvacharya',
        sarga: 'सर्गः:',
        searchPlaceholder: 'Search slokas...',
        backToList: '← Back to List',
        loading: 'Loading slokas...',
        noResults: 'No slokas found.',
        footer: 'Sumadhwa Vijaya by Narayana Panditacharya | For educational and devotional purposes'
    },
    kn: {
        title: 'ಸುಮಧ್ವವಿಜಯ - ಶ್ರೀ ಮಧ್ವಾಚಾರ್ಯರ ಜೀವನ',
        searchPlaceholder: 'ಶ್ಲೋಕಗಳನ್ನು ಹುಡುಕಿ...',
        backToList: '← ಪಟ್ಟಿಗೆ ಹಿಂತಿರುಗಿ',
        loading: 'ಶ್ಲೋಕಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...',
        noResults: 'ಶ್ಲೋಕಗಳು ಕಂಡುಬಂದಿಲ್ಲ.',
        footer: 'ನಾರಾಯಣ ಪಂಡಿತಾಚಾರ್ಯರ ಸುಮಧ್ವವಿಜಯ | ಶೈಕ್ಷಣಿಕ ಮತ್ತು ಭಕ್ತಿ ಉದ್ದೇಶಗಳಿಗಾಗಿ'
    },
    te: {
        title: 'సుమధ్వవిజయ - శ్రీ మధ్వాచార్యుల జీవితం',
        searchPlaceholder: 'శ్లోకాలను వెతకండి...',
        backToList: '← జాబితాకు తిరిగి వెళ్ళండి',
        loading: 'శ్లోకాలు లోడ్ అవుతున్నాయి...',
        noResults: 'శ్లోకాలు కనుగొనబడలేదు.',
        footer: 'నారాయణ పండితాచార్యుల సుమధ్వవిజయ | విద్యా మరియు భక్తి ప్రయోజనాల కోసం'
    }
};

// DOM Elements
const languageSelect = document.getElementById('language');
const sargaSelect = document.getElementById('sarga');
const searchInput = document.getElementById('searchInput');
const slokaList = document.getElementById('slokaList');
const slokaDetail = document.getElementById('slokaDetail');
const detailContent = document.getElementById('detailContent');
const backButton = document.getElementById('backButton');
const sectionHeading = document.getElementById('sectionHeading');
const sectionTitle = document.getElementById('sectionTitle');
const collapseIcon = document.getElementById('collapseIcon');

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing...');
    
    // Load saved language preference
    const savedLanguage = localStorage.getItem('smvLanguage') || 'sa';
    currentLanguage = savedLanguage;
    if (languageSelect) {
        languageSelect.value = savedLanguage;
    }
    
    loadSlokas();
    setupEventListeners();
    updateUILanguage();
});

// Setup event listeners
function setupEventListeners() {
    if (languageSelect) {
        languageSelect.addEventListener('change', handleLanguageChange);
    }
    
    if (sargaSelect) {
        sargaSelect.addEventListener('change', filterSlokas);
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', searchSlokas);
    }
    
    if (backButton) {
        backButton.addEventListener('click', () => {
            slokaDetail.style.display = 'none';
            slokaList.style.display = 'block';
            currentView = 'list';
        });
    }
    
    if (collapseIcon) {
        collapseIcon.addEventListener('click', toggleSlokaList);
    }
    
    // Add heading audio button functionality
    const headingAudioBtn = document.getElementById('headingAudioBtn');
    if (headingAudioBtn) {
        headingAudioBtn.addEventListener('click', playAllSlokas);
    }
    
    // Add stop button functionality
    const stopAudioBtn = document.getElementById('stopAudioBtn');
    if (stopAudioBtn) {
        stopAudioBtn.addEventListener('click', stopRecitation);
    }
}

// Handle language change
function handleLanguageChange() {
    currentLanguage = languageSelect.value;
    localStorage.setItem('smvLanguage', currentLanguage);
    updateUILanguage();
    filterSlokas();
}

// Update UI language
function updateUILanguage() {
    const lang = languages[currentLanguage] || languages['sa'];
    
    if (searchInput) {
        searchInput.placeholder = lang.searchPlaceholder;
    }
    
    if (backButton) {
        backButton.textContent = lang.backToList;
    }
    
    document.querySelector('footer p').textContent = lang.footer;
}

// Load slokas from CSV/JSON
async function loadSlokas() {
    try {
        console.log('Loading slokas...');
        const response = await fetch('data/sarga-1.csv');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const csvText = await response.text();
        console.log('CSV loaded, length:', csvText.length);
        allSlokas = parseCSV(csvText);
        console.log('Parsed slokas:', allSlokas.length);
        filterSlokas();
    } catch (error) {
        console.error('Error loading slokas:', error);
        slokaList.innerHTML = '<p class="error">Error loading slokas: ' + error.message + '. Please refresh the page.</p>';
    }
}

// Parse CSV data
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const slokas = [];
    console.log('Parsing CSV, total lines:', lines.length);
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Parse CSV line manually to handle commas in sloka text
        const parts = [];
        let current = '';
        let inQuotes = false;
        
        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                parts.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        parts.push(current.trim());
        
        if (parts.length >= 3) {
            const sarga = parseInt(parts[0]);
            const sloka_number = parseInt(parts[1]);
            const sloka_text = parts[2];
            
            if (!isNaN(sarga) && !isNaN(sloka_number) && sloka_text) {
                slokas.push({
                    sarga,
                    sloka_number,
                    sloka_text,
                    meaning: parts[3] || '',
                    meaningKn: parts[4] || '',
                    meaningTe: parts[5] || ''
                });
            }
        }
    }
    
    console.log('Successfully parsed slokas:', slokas.length);
    return slokas;
}

// Filter slokas by sarga
function filterSlokas() {
    const selectedSarga = parseInt(sargaSelect.value);
    console.log('Filtering for sarga:', selectedSarga);
    console.log('Total slokas:', allSlokas.length);
    filteredSlokas = allSlokas.filter(sloka => sloka.sarga === selectedSarga);
    console.log('Filtered slokas:', filteredSlokas.length);
    displaySlokas(filteredSlokas);
    updateSectionTitle();
}

// Search slokas
function searchSlokas() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    if (searchTerm === '') {
        filterSlokas();
        return;
    }
    
    const searchResults = allSlokas.filter(sloka => {
        const cleanSlokaText = sloka.sloka_text.toLowerCase();
        
        let transliteratedText = cleanSlokaText;
        if (currentLanguage === 'kn') {
            transliteratedText = transliterateText(cleanSlokaText, 'kn').toLowerCase();
        } else if (currentLanguage === 'te') {
            transliteratedText = transliterateText(cleanSlokaText, 'te').toLowerCase();
        }
        
        return cleanSlokaText.includes(searchTerm) ||
               transliteratedText.includes(searchTerm) ||
               sloka.sloka_number.toString().includes(searchTerm);
    });
    
    displaySlokas(searchResults);
}

// Display slokas
function displaySlokas(slokas) {
    console.log('displaySlokas called with', slokas ? slokas.length : 0, 'slokas');
    
    if (!slokas || slokas.length === 0) {
        const lang = languages[currentLanguage] || languages['sa'];
        slokaList.innerHTML = `<p class="no-results">${lang.noResults}</p>`;
        return;
    }
    
    slokaList.innerHTML = '';
    
    slokas.forEach((sloka, index) => {
        console.log('Processing sloka', index + 1, ':', sloka.sloka_text.substring(0, 30) + '...');
        
        const slokaCard = document.createElement('div');
        slokaCard.className = 'sloka-card';
        slokaCard.setAttribute('data-sarga', sloka.sarga);
        slokaCard.setAttribute('data-sloka', sloka.sloka_number);
        
        let slokaText = sloka.sloka_text;
        try {
            if (currentLanguage === 'kn') {
                slokaText = transliterateText(sloka.sloka_text, 'kn');
            } else if (currentLanguage === 'te') {
                slokaText = transliterateText(sloka.sloka_text, 'te');
            }
        } catch (e) {
            console.error('Transliteration error:', e);
        }
        
        slokaCard.innerHTML = `
            <div class="sloka-number">Sarga ${sloka.sarga}, Sloka ${sloka.sloka_number}</div>
            <div class="sloka-text">${slokaText}</div>
            ${sloka.meaning ? `<div class="sloka-meaning">${sloka.meaning}</div>` : ''}
        `;
        
        slokaCard.addEventListener('click', () => showSlokaDetail(sloka));
        slokaList.appendChild(slokaCard);
    });
    
    console.log('Display complete, cards added:', slokas.length);
}

// Show sloka detail
function showSlokaDetail(sloka) {
    currentView = 'detail';
    slokaList.style.display = 'none';
    slokaDetail.style.display = 'block';
    
    let slokaText = sloka.sloka_text;
    if (currentLanguage === 'kn') {
        slokaText = transliterateText(sloka.sloka_text, 'kn');
    } else if (currentLanguage === 'te') {
        slokaText = transliterateText(sloka.sloka_text, 'te');
    }
    
    let meaning = sloka.meaning;
    if (currentLanguage === 'kn' && sloka.meaningKn) {
        meaning = sloka.meaningKn;
    } else if (currentLanguage === 'te' && sloka.meaningTe) {
        meaning = sloka.meaningTe;
    }
    
    // Store original text for audio (always use Devanagari for speech)
    const audioText = sloka.sloka_text;
    
    detailContent.innerHTML = `
        <div class="detail-header">
            <div class="madhva-image">
                <img src="https://via.placeholder.com/150x200/8B4513/FFFFFF?text=Sri+Madhvacharya" 
                     alt="Sri Madhvacharya" 
                     title="Sri Madhvacharya">
            </div>
            <div class="detail-number">
                <h2>सर्गः ${sloka.sarga}, श्लोकः ${sloka.sloka_number}</h2>
                <p>Sarga ${sloka.sarga}, Sloka ${sloka.sloka_number}</p>
            </div>
        </div>
        <div class="detail-sloka">
            <div class="sloka-header">
                <h3>श्लोकः (Sloka)</h3>
                <button class="speaker-btn" id="reciteBtn" title="Recite sloka">
                    🔊 Recite
                </button>
            </div>
            <p class="sloka-text-detail">${slokaText}</p>
        </div>
        <div class="detail-meaning">
            <div class="sloka-header">
                <h3>अर्थः (Meaning)</h3>
                ${meaning ? `<button class="speaker-btn" id="readBtn" title="Read meaning">🔊 Read</button>` : ''}
            </div>
            <p>${meaning || 'Meaning to be added'}</p>
        </div>
    `;
    
    // Attach event listeners after content is loaded
    const reciteBtn = document.getElementById('reciteBtn');
    if (reciteBtn) {
        reciteBtn.addEventListener('click', () => speakText(audioText, 'sa', sloka.sarga, sloka.sloka_number));
    }
    
    const readBtn = document.getElementById('readBtn');
    if (readBtn && meaning) {
        readBtn.addEventListener('click', () => speakText(meaning, 'en'));
    }
}

// Text-to-speech function with MP3 support
function speakText(text, lang, sarga, slokaNumber) {
    console.log('speakText called - Length:', text.length, 'Lang:', lang);
    
    // If sarga and sloka number provided, try to play MP3 file first
    if (sarga && slokaNumber) {
        const audioPath = `audio/${sarga}-${slokaNumber}.mp3`;
        console.log('Attempting to load audio file:', audioPath);
        
        const audio = new Audio(audioPath);
        
        audio.onloadeddata = () => {
            console.log('MP3 file loaded successfully');
            audio.play().catch(err => {
                console.error('Error playing MP3:', err);
                // Fallback to text-to-speech
                useSpeechSynthesis(text, lang);
            });
        };
        
        audio.onerror = () => {
            console.log('MP3 file not found, using text-to-speech fallback');
            // Fallback to text-to-speech
            useSpeechSynthesis(text, lang);
        };
        
        return;
    }
    
    // No MP3 path provided, use text-to-speech
    useSpeechSynthesis(text, lang);
}

// Text-to-speech using browser API
function useSpeechSynthesis(text, lang) {
    // Check if speech synthesis is supported
    if (!('speechSynthesis' in window)) {
        alert('Sorry, your browser does not support text-to-speech.');
        return;
    }
    
    // Stop any current speech
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }
    
    // Wait a moment before starting new speech
    setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang === 'sa' ? 'hi-IN' : 'en-US';
        utterance.rate = 0.8;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        utterance.onstart = () => {
            console.log('Speech started');
        };
        
        utterance.onend = () => {
            console.log('Speech ended');
        };
        
        utterance.onerror = (event) => {
            console.error('Speech error:', event.error);
            alert('Error with text-to-speech: ' + event.error);
        };
        
        window.speechSynthesis.speak(utterance);
    }, 100);
}

// Make speakText globally accessible
window.speakText = speakText;

// Update section title
function updateSectionTitle() {
    const sargaNum = sargaSelect.value;
    const sargaText = sargaSelect.options[sargaSelect.selectedIndex].text;
    
    let displayText = sargaText;
    if (currentLanguage === 'kn') {
        const sanText = sargaText.split('(')[0].trim();
        displayText = transliterateText(sanText, 'kn');
    } else if (currentLanguage === 'te') {
        const sanText = sargaText.split('(')[0].trim();
        displayText = transliterateText(sanText, 'te');
    }
    
    sectionTitle.textContent = displayText;
}

// Toggle sloka list
function toggleSlokaList() {
    const isCollapsed = slokaList.style.display === 'none';
    slokaList.style.display = isCollapsed ? 'block' : 'none';
    collapseIcon.textContent = isCollapsed ? '▼' : '▲';
}

// Play all slokas sequentially
let isPlayingAll = false;

function playAllSlokas() {
    if (!filteredSlokas || filteredSlokas.length === 0) {
        alert('No slokas to play');
        return;
    }
    
    const confirmPlay = confirm(`Play all ${filteredSlokas.length} slokas?\nThis may take several minutes.`);
    if (!confirmPlay) return;
    
    isPlayingAll = true;
    let currentIndex = 0;
    
    // Show stop button, hide play button
    const playBtn = document.getElementById('headingAudioBtn');
    const stopBtn = document.getElementById('stopAudioBtn');
    if (playBtn) playBtn.style.display = 'none';
    if (stopBtn) stopBtn.style.display = 'inline-block';
    
    function playNext() {
        if (!isPlayingAll || currentIndex >= filteredSlokas.length) {
            if (currentIndex >= filteredSlokas.length) {
                console.log('Finished playing all slokas');
                alert('Finished playing all slokas');
            }
            // Remove highlight from last sloka
            document.querySelectorAll('.sloka-card.playing').forEach(card => {
                card.classList.remove('playing');
            });
            stopRecitation();
            return;
        }
        
        const sloka = filteredSlokas[currentIndex];
        console.log(`Playing sloka ${currentIndex + 1}/${filteredSlokas.length}`);
        
        // Remove previous highlight
        document.querySelectorAll('.sloka-card.playing').forEach(card => {
            card.classList.remove('playing');
        });
        
        // Highlight current sloka
        const currentCard = document.querySelector(`[data-sarga="${sloka.sarga}"][data-sloka="${sloka.sloka_number}"]`);
        if (currentCard) {
            currentCard.classList.add('playing');
            // Scroll into view smoothly
            currentCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        // Try MP3 first
        const audioPath = `audio/${sloka.sarga}-${sloka.sloka_number}.mp3`;
        const audio = new Audio(audioPath);
        
        audio.onloadeddata = () => {
            console.log('Playing MP3:', audioPath);
            audio.play().then(() => {
                audio.onended = () => {
                    currentIndex++;
                    if (isPlayingAll) {
                        setTimeout(playNext, 500);
                    }
                };
            }).catch(err => {
                console.error('MP3 playback error:', err);
                useSpeechSynthesisForPlayAll(sloka);
            });
        };
        
        audio.onerror = () => {
            console.log('MP3 not found, using TTS');
            useSpeechSynthesisForPlayAll(sloka);
        };
    }
    
    function useSpeechSynthesisForPlayAll(sloka) {
        const utterance = new SpeechSynthesisUtterance(sloka.sloka_text);
        utterance.lang = 'hi-IN';
        utterance.rate = 0.8;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        utterance.onend = () => {
            currentIndex++;
            if (isPlayingAll) {
                setTimeout(playNext, 500);
            }
        };
        
        utterance.onerror = (event) => {
            console.error('Error playing sloka:', event.error);
            currentIndex++;
            if (isPlayingAll) {
                playNext();
            }
        };
        
        window.speechSynthesis.speak(utterance);
    }
    
    playNext();
}

// Stop recitation
function stopRecitation() {
    isPlayingAll = false;
    window.speechSynthesis.cancel();
    
    // Remove highlight from all slokas
    document.querySelectorAll('.sloka-card.playing').forEach(card => {
        card.classList.remove('playing');
    });
    
    // Show play button, hide stop button
    const playBtn = document.getElementById('headingAudioBtn');
    const stopBtn = document.getElementById('stopAudioBtn');
    if (playBtn) playBtn.style.display = 'inline-block';
    if (stopBtn) stopBtn.style.display = 'none';
    
    console.log('Recitation stopped');
}
