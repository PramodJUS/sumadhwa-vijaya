// Global variables
let allSlokas = [];
let filteredSlokas = [];
let granthaDetails = {};
let currentLanguage = 'sa';
let currentView = 'list';
let currentSloka = null; // Track current sloka being viewed

// Readability settings
let fontSize = 1.15; // rem
let lineSpacing = 2;

// Pratika identifier instance
let pratikaIdentifier = null;

// Commentary visibility settings
let visibleCommentaries = {
    'भावप्रकाशिका': true,
    'पदार्थदीपिकोद्बोधिका': true,
    'मन्दोपाकारिणी': true
};

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
    },
    en: {
        title: 'Sumadhwa Vijaya - The Life of Sri Madhvacharya',
        searchPlaceholder: 'Search slokas...',
        backToList: '← Back to List',
        loading: 'Loading slokas...',
        noResults: 'No slokas found.',
        footer: 'Sumadhwa Vijaya by Narayana Panditacharya | For educational and devotional purposes'
    },
    ta: {
        title: 'Sumadhwa Vijaya - The Life of Sri Madhvacharya',
        searchPlaceholder: 'Search slokas...',
        backToList: '← Back to List',
        loading: 'Loading slokas...',
        noResults: 'No slokas found.',
        footer: 'Sumadhwa Vijaya by Narayana Panditacharya | For educational and devotional purposes'
    },
    ml: {
        title: 'Sumadhwa Vijaya - The Life of Sri Madhvacharya',
        searchPlaceholder: 'Search slokas...',
        backToList: '← Back to List',
        loading: 'Loading slokas...',
        noResults: 'No slokas found.',
        footer: 'Sumadhwa Vijaya by Narayana Panditacharya | For educational and devotional purposes'
    },
    bn: {
        title: 'Sumadhwa Vijaya - The Life of Sri Madhvacharya',
        searchPlaceholder: 'Search slokas...',
        backToList: '← Back to List',
        loading: 'Loading slokas...',
        noResults: 'No slokas found.',
        footer: 'Sumadhwa Vijaya by Narayana Panditacharya | For educational and devotional purposes'
    },
    gu: {
        title: 'Sumadhwa Vijaya - The Life of Sri Madhvacharya',
        searchPlaceholder: 'Search slokas...',
        backToList: '← Back to List',
        loading: 'Loading slokas...',
        noResults: 'No slokas found.',
        footer: 'Sumadhwa Vijaya by Narayana Panditacharya | For educational and devotional purposes'
    },
    or: {
        title: 'Sumadhwa Vijaya - The Life of Sri Madhvacharya',
        searchPlaceholder: 'Search slokas...',
        backToList: '← Back to List',
        loading: 'Loading slokas...',
        noResults: 'No slokas found.',
        footer: 'Sumadhwa Vijaya by Narayana Panditacharya | For educational and devotional purposes'
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
const container = document.querySelector('.container');

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing...');

    // Initialize pratika identifier
    if (typeof PratikaIdentifier !== 'undefined') {
        pratikaIdentifier = new PratikaIdentifier();
        console.log('Pratika identifier initialized');
    } else {
        console.warn('PratikaIdentifier not available');
    }

    // Load saved language preference
    const savedLanguage = localStorage.getItem('smvLanguage') || 'sa';
    currentLanguage = savedLanguage;
    if (languageSelect) {
        languageSelect.value = savedLanguage;
    }

    loadSlokas();
    loadGranthaDetails();
    setupEventListeners();
    setupReadabilityControls();
    loadReadabilitySettings();
    updateUILanguage();
    setupKeyboardShortcuts();
    loadCommentarySettings();
    setupHeaderCommentaryDropdown();
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

    // Add panel toggle button functionality (on the panel itself)
    const panelToggleBtn = document.getElementById('panelToggleBtn');
    if (panelToggleBtn) {
        panelToggleBtn.addEventListener('click', toggleInfoPanel);
    }

    // Add home button functionality (Madhva image)
    const homeButton = document.getElementById('homeButton');
    if (homeButton) {
        homeButton.addEventListener('click', goToHome);
    }

    // Add header toggle button functionality
    const headerToggleBtn = document.getElementById('headerToggleBtn');
    if (headerToggleBtn) {
        headerToggleBtn.addEventListener('click', toggleHeader);
    }
}

// Handle language change
function handleLanguageChange() {
    currentLanguage = languageSelect.value;
    localStorage.setItem('smvLanguage', currentLanguage);
    updateUILanguage();

    // Update the appropriate view
    if (currentView === 'detail' && currentSloka) {
        // Refresh detail view with new language
        showSlokaDetail(currentSloka);
    } else {
        // Update list view
        filterSlokas();
    }
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
        const response = await fetch('Grantha/mainpage.csv');
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

// Load detailed commentaries from grantha-details.json
async function loadGranthaDetails() {
    try {
        console.log('Loading grantha details...');
        const response = await fetch('Grantha/grantha-details.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        granthaDetails = await response.json();
        console.log('Grantha details loaded:', Object.keys(granthaDetails).length, 'entries');
    } catch (error) {
        console.error('Error loading grantha details:', error);
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
        if (currentLanguage !== 'sa') {
            transliteratedText = transliterateText(cleanSlokaText, currentLanguage).toLowerCase();
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
            if (currentLanguage !== 'sa') {
                slokaText = transliterateText(sloka.sloka_text, currentLanguage);
            }
        } catch (e) {
            console.error('Transliteration error:', e);
        }
        
        slokaCard.innerHTML = `
            <div class="sloka-number">Sarga ${sloka.sarga}, Sloka ${sloka.sloka_number}</div>
            <div class="sloka-text">${slokaText.replace(/\n/g, '<br>')}</div>
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
    currentSloka = sloka; // Store current sloka
    slokaList.style.display = 'none';
    slokaDetail.style.display = 'block';

    let slokaText = sloka.sloka_text;
    if (currentLanguage !== 'sa') {
        slokaText = transliterateText(sloka.sloka_text, currentLanguage);
    }

    // Get detailed commentaries from granthaDetails
    const key = `${sloka.sarga}.${sloka.sloka_number}`;
    const details = granthaDetails[key] || {};

    // Store original text for audio (always use Devanagari for speech)
    const audioText = sloka.sloka_text;

    // Build commentaries HTML
    let commentariesHTML = '';
    const commentaryNames = {
        'भावप्रकाशिका': 'Bhavaprakashika',
        'पदार्थदीपिकोद्बोधिका': 'Padarthadeepikodbhodhika',
        'मन्दोपाकारिणी': 'Mandopakarini'
    };

    for (const [devanagariName, englishName] of Object.entries(commentaryNames)) {
        // Skip if commentary is hidden
        if (!visibleCommentaries[devanagariName]) {
            continue;
        }

        if (details[devanagariName]) {
            let commentaryText = details[devanagariName];
            let pratikaPositions = [];

            // Find pratikas first (before any modification)
            if (pratikaIdentifier) {
                const pratikas = pratikaIdentifier.findAllPratikas(commentaryText);
                pratikaPositions = pratikas.map(p => ({
                    word: p.word,
                    position: p.position
                }));
            }

            // Transliterate the entire text first
            if (currentLanguage !== 'sa') {
                commentaryText = transliterateText(commentaryText, currentLanguage);

                // Also transliterate the pratika words for matching
                pratikaPositions = pratikaPositions.map(p => ({
                    ...p,
                    word: transliterateText(p.word, currentLanguage)
                }));
            }

            // Now apply highlighting to transliterated text by replacing pratika words
            if (pratikaPositions.length > 0) {
                // Split by spaces and punctuation while preserving them
                const words = commentaryText.split(/(\s+|[।॥,.!?;:])/);
                commentaryText = words.map(word => {
                    // Check if this word (trimmed) matches any pratika
                    const trimmedWord = word.trim();
                    if (trimmedWord && pratikaPositions.some(p => p.word === trimmedWord)) {
                        return `<strong>${word}</strong>`;
                    }
                    return word;
                }).join('');
            }

            // Create unique ID for this commentary
            const commentaryId = `commentary-${englishName.toLowerCase().replace(/\s+/g, '-')}`;

            commentariesHTML += `
                <div class="detail-commentary">
                    <div class="sloka-header commentary-header" data-target="${commentaryId}">
                        <h3>${devanagariName} (${englishName})</h3>
                        <span class="collapse-arrow">▼</span>
                    </div>
                    <div class="commentary-text-wrapper" id="${commentaryId}">
                        <p class="commentary-text">${commentaryText.replace(/\n/g, '<br>')}</p>
                    </div>
                </div>
            `;
        }
    }

    // Find current sloka index and check for prev/next
    const currentIndex = filteredSlokas.findIndex(s =>
        s.sarga === sloka.sarga && s.sloka_number === sloka.sloka_number
    );
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex < filteredSlokas.length - 1;

    detailContent.innerHTML = `
        <div class="detail-header">
            <div class="detail-nav-buttons">
                <button class="nav-btn" id="prevSlokaBtn" title="Previous Sloka" ${!hasPrev ? 'disabled' : ''}>
                    ←
                </button>
                <button class="nav-btn" id="nextSlokaBtn" title="Next Sloka" ${!hasNext ? 'disabled' : ''}>
                    →
                </button>
            </div>
        </div>
        <div class="detail-sloka">
            <p class="sloka-text-detail">${slokaText.replace(/\n/g, '<br>')}</p>
        </div>
        ${commentariesHTML || '<div class="detail-meaning"><p>Commentaries to be added</p></div>'}
    `;

    // Setup navigation buttons
    const prevBtn = document.getElementById('prevSlokaBtn');
    const nextBtn = document.getElementById('nextSlokaBtn');

    if (prevBtn && hasPrev) {
        prevBtn.addEventListener('click', () => {
            const prevSloka = filteredSlokas[currentIndex - 1];
            showSlokaDetail(prevSloka);
            // Scroll to top of detail view
            slokaDetail.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    if (nextBtn && hasNext) {
        nextBtn.addEventListener('click', () => {
            const nextSloka = filteredSlokas[currentIndex + 1];
            showSlokaDetail(nextSloka);
            // Scroll to top of detail view
            slokaDetail.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    // Setup collapsible commentaries
    setupCollapsibleCommentaries();
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
    if (currentLanguage !== 'sa') {
        const sanText = sargaText.split('(')[0].trim();
        displayText = transliterateText(sanText, currentLanguage);
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

// Toggle info panel visibility
function toggleInfoPanel() {
    if (container) {
        const isHidden = container.classList.toggle('detail-view');

        // Update button icon on the panel
        const panelToggleBtn = document.getElementById('panelToggleBtn');
        if (panelToggleBtn) {
            panelToggleBtn.textContent = isHidden ? '▶' : '◀';
            panelToggleBtn.title = isHidden ? 'Show panel' : 'Hide panel';
        }

        console.log('Info panel toggled:', isHidden ? 'hidden' : 'visible');
    }
}

// Setup collapsible commentaries
function setupCollapsibleCommentaries() {
    // Add click handlers to each commentary header
    const commentaryHeaders = document.querySelectorAll('.commentary-header');
    commentaryHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const wrapper = document.getElementById(targetId);
            const arrow = this.querySelector('.collapse-arrow');

            if (wrapper) {
                wrapper.classList.toggle('collapsed');
                if (arrow) {
                    arrow.classList.toggle('rotated');
                }
            }
        });

        // Make header cursor pointer
        header.style.cursor = 'pointer';
    });
}

// Go to home (list view)
function goToHome() {
    if (currentView === 'detail') {
        slokaDetail.style.display = 'none';
        slokaList.style.display = 'block';
        currentView = 'list';
        currentSloka = null;

        // Scroll to top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Load commentary visibility settings
function loadCommentarySettings() {
    const saved = localStorage.getItem('smvCommentaries');
    if (saved) {
        try {
            visibleCommentaries = JSON.parse(saved);
        } catch (e) {
            console.error('Error loading commentary settings:', e);
        }
    }
}

// Save commentary visibility settings
function saveCommentarySettings() {
    localStorage.setItem('smvCommentaries', JSON.stringify(visibleCommentaries));
}

// Setup commentary dropdown in header
function setupHeaderCommentaryDropdown() {
    const dropdownBtn = document.getElementById('headerCommentaryDropdownBtn');
    const dropdownContent = document.getElementById('headerCommentaryDropdownContent');

    if (dropdownBtn && dropdownContent) {
        // Set initial checkbox states
        const checkboxes = dropdownContent.querySelectorAll('.commentary-check');
        checkboxes.forEach(checkbox => {
            const commentaryName = checkbox.getAttribute('data-commentary');
            checkbox.checked = visibleCommentaries[commentaryName];
        });

        // Toggle dropdown
        dropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownContent.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#headerCommentarySelector')) {
                dropdownContent.classList.remove('show');
            }
        });

        // Prevent dropdown from closing when clicking inside
        dropdownContent.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Handle checkbox changes
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const commentaryName = e.target.getAttribute('data-commentary');

                if (commentaryName) {
                    visibleCommentaries[commentaryName] = e.target.checked;
                    saveCommentarySettings();

                    // Refresh detail view if we're viewing a sloka
                    if (currentSloka) {
                        showSlokaDetail(currentSloka);
                    }
                }
            });
        });
    }
}

// Setup keyboard shortcuts for navigation
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Only work in detail view
        if (currentView !== 'detail') return;

        // Ignore if typing in input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        // Left arrow or 'p' for previous
        if (e.key === 'ArrowLeft' || e.key === 'p') {
            const prevBtn = document.getElementById('prevSlokaBtn');
            if (prevBtn && !prevBtn.disabled) {
                prevBtn.click();
                e.preventDefault();
            }
        }

        // Right arrow or 'n' for next
        if (e.key === 'ArrowRight' || e.key === 'n') {
            const nextBtn = document.getElementById('nextSlokaBtn');
            if (nextBtn && !nextBtn.disabled) {
                nextBtn.click();
                e.preventDefault();
            }
        }

        // Escape to go back to list
        if (e.key === 'Escape') {
            slokaDetail.style.display = 'none';
            slokaList.style.display = 'block';
            currentView = 'list';
            currentSloka = null;
            e.preventDefault();
        }
    });
}


// Readability Controls
function setupReadabilityControls() {
    const increaseFontBtn = document.getElementById('increaseFont');
    const decreaseFontBtn = document.getElementById('decreaseFont');
    const increaseSpacingBtn = document.getElementById('increaseSpacing');
    const decreaseSpacingBtn = document.getElementById('decreaseSpacing');
    const themeSelect = document.getElementById('themeSelect');

    if (increaseFontBtn) {
        increaseFontBtn.addEventListener('click', () => {
            fontSize = Math.min(fontSize + 0.1, 2.0);
            applyReadabilitySettings();
        });
    }

    if (decreaseFontBtn) {
        decreaseFontBtn.addEventListener('click', () => {
            fontSize = Math.max(fontSize - 0.1, 0.8);
            applyReadabilitySettings();
        });
    }

    if (increaseSpacingBtn) {
        increaseSpacingBtn.addEventListener('click', () => {
            lineSpacing = Math.min(lineSpacing + 0.2, 3.0);
            applyReadabilitySettings();
        });
    }

    if (decreaseSpacingBtn) {
        decreaseSpacingBtn.addEventListener('click', () => {
            lineSpacing = Math.max(lineSpacing - 0.2, 1.2);
            applyReadabilitySettings();
        });
    }

    if (themeSelect) {
        themeSelect.addEventListener('change', (e) => {
            applyTheme(e.target.value);
        });
    }
}

function applyReadabilitySettings() {
    document.documentElement.style.setProperty('--base-font-size', fontSize + 'rem');
    document.documentElement.style.setProperty('--line-height', lineSpacing);
    
    // Save to localStorage
    localStorage.setItem('smvFontSize', fontSize);
    localStorage.setItem('smvLineSpacing', lineSpacing);
}

function loadReadabilitySettings() {
    // Load saved settings
    const savedFontSize = localStorage.getItem('smvFontSize');
    const savedLineSpacing = localStorage.getItem('smvLineSpacing');
    const savedTheme = localStorage.getItem('smvTheme') || 'light';

    if (savedFontSize) {
        fontSize = parseFloat(savedFontSize);
    }
    if (savedLineSpacing) {
        lineSpacing = parseFloat(savedLineSpacing);
    }

    applyReadabilitySettings();
    applyTheme(savedTheme);

    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) {
        themeSelect.value = savedTheme;
    }
}

function applyTheme(theme) {
    document.body.classList.remove('light-theme', 'sepia-theme', 'dark-theme');
    document.body.classList.add(theme + '-theme');
    localStorage.setItem('smvTheme', theme);
}

// Toggle header visibility
function toggleHeader() {
    const header = document.querySelector('header');
    const headerToggleBtn = document.getElementById('headerToggleBtn');

    if (header) {
        const isHidden = header.classList.toggle('header-hidden');

        // Update button icon
        if (headerToggleBtn) {
            headerToggleBtn.textContent = isHidden ? '▼' : '▲';
            headerToggleBtn.title = isHidden ? 'Show header' : 'Hide header';
        }
    }
}
