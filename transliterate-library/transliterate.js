// Generic transliteration engine for Devanagari to Indic scripts
// Language-specific mappings are loaded from separate files in js/scripts/

// Registry for all script mappings (populated by individual script files)
const SCRIPT_MAPPINGS = {};

// Cache for transliteration results (if window.PerformanceUtils is available)
const transliterationMemo = typeof window !== 'undefined' && window.PerformanceUtils 
    ? new window.PerformanceUtils.LRUCache(200)
    : null;

// Transliterate Devanagari text to target script (with caching)
function transliterateText(text, targetLang) {
    if (!text || targetLang === 'sa') return text; // Return as-is for Sanskrit
    
    // Check cache first
    if (transliterationMemo) {
        const cacheKey = `${targetLang}:${text.substring(0, 100)}`; // Use first 100 chars as key
        const cached = transliterationMemo.get(cacheKey);
        if (cached) return cached;
    }
    
    // CRITICAL: Normalize input to NFC to ensure proper character composition
    // This prevents vowel marks from being separated from base characters
    text = text.normalize('NFC');
    
    const scriptConfig = SCRIPT_MAPPINGS[targetLang];
    if (!scriptConfig || !scriptConfig.mapping) return text; // No mapping available
    
    // Check if text contains HTML tags
    const hasHTML = /<[^>]+>/.test(text);
    
    let result;
    if (hasHTML) {
        // Split into HTML tags and text content
        const parts = text.split(/(<[^>]+>)/);
        const transliteratedParts = parts.map(part => {
            // If it's an HTML tag, keep it as-is
            if (part.startsWith('<')) {
                return part;
            }
            // Otherwise, transliterate the text
            return transliterateTextContent(part, scriptConfig);
        });
        // Normalize output to NFC to ensure proper composition
        result = transliteratedParts.join('').normalize('NFC');
    } else {
        // No HTML, transliterate directly and normalize
        result = transliterateTextContent(text, scriptConfig).normalize('NFC');
    }
    
    // Cache the result
    if (transliterationMemo) {
        const cacheKey = `${targetLang}:${text.substring(0, 100)}`;
        transliterationMemo.set(cacheKey, result);
    }
    
    return result;
}

// Helper function to transliterate plain text (no HTML)
function transliterateTextContent(text, scriptConfig) {
    if (!text) return text;
    
    // Normalize input to prevent vowel splitting
    let result = text.normalize('NFC');
    
    // Handle special combinations first (if defined)
    if (scriptConfig.specialCombinations) {
        for (const [source, target] of Object.entries(scriptConfig.specialCombinations)) {
            result = result.split(source).join(target);
        }
    }
    
    // For romanization (English/IAST), handle inherent 'a' removal before matras
    if (scriptConfig.isRomanization) {
        // List of consonants with inherent 'a' (all Devanagari consonants)
        const consonants = ['क', 'ख', 'ग', 'घ', 'ङ', 'च', 'छ', 'ज', 'झ', 'ञ', 
                           'ट', 'ठ', 'ड', 'ढ', 'ण', 'त', 'थ', 'द', 'ध', 'न',
                           'प', 'फ', 'ब', 'भ', 'म', 'य', 'र', 'ल', 'व',
                           'श', 'ष', 'स', 'ह'];
        
        // List of matras (vowel marks) - these should replace inherent 'a'
        const matras = ['ा', 'ि', 'ी', 'ु', 'ू', 'ृ', 'ॄ', 'ॢ', 'ॣ', 'े', 'ै', 'ो', 'ौ'];
        
        // Halant/virama removes inherent 'a'
        const halant = '्';
        
        // First pass: Handle consonant + halant (removes inherent 'a')
        for (const cons of consonants) {
            const romanCons = scriptConfig.mapping[cons];
            if (!romanCons) continue;
            
            // Remove inherent 'a' from romanized consonant
            const consWithoutA = romanCons.endsWith('a') ? romanCons.slice(0, -1) : romanCons;
            
            // Replace consonant+halant with consonant without 'a'
            const devaHalantPattern = cons + halant;
            result = result.split(devaHalantPattern).join(consWithoutA);
        }
        
        // Second pass: Handle consonant + matra (matra replaces inherent 'a')
        for (const cons of consonants) {
            const romanCons = scriptConfig.mapping[cons];
            if (!romanCons) continue;
            
            // Remove inherent 'a' from romanized consonant
            const consWithoutA = romanCons.endsWith('a') ? romanCons.slice(0, -1) : romanCons;
            
            for (const matra of matras) {
                const romanMatra = scriptConfig.mapping[matra];
                if (!romanMatra) continue;
                
                // Replace consonant+matra with consonant(without 'a')+matra
                const devaPattern = cons + matra;
                const romanPattern = consWithoutA + romanMatra;
                result = result.split(devaPattern).join(romanPattern);
            }
        }
    }
    
    // Character-by-character replacement
    for (const [source, target] of Object.entries(scriptConfig.mapping)) {
        result = result.split(source).join(target);
    }
    
    // Apply anusvara normalization (if enabled for this script)
    if (scriptConfig.anusvaraNormalization && scriptConfig.anusvaraNormalization.enabled) {
        const rules = scriptConfig.anusvaraNormalization;
        
        for (const nasal of rules.nasalsWithHalant) {
            for (const consonant of rules.allConsonants) {
                // Keep compound form for specific consonants, use anusvara for others
                if (!rules.compoundConsonants.includes(consonant)) {
                    result = result.replace(new RegExp(nasal + consonant, 'g'), rules.anusvara + consonant);
                }
            }
        }
        
        // Convert final nasal consonants with halant to anusvara (e.g., अधिकरणम् -> ಅಧಿಕರಣಂ)
        if (rules.finalNasalToAnusvara) {
            for (const nasal of rules.nasalsWithHalant) {
                // Match nasal+halant at end of word (before space, punctuation, or end of string)
                result = result.replace(new RegExp(nasal + '(?=\\s|[।॥,.;:!?()\\[\\]{}"\']|$)', 'g'), rules.anusvara);
            }
        }
    }
    
    // Final normalization to ensure proper composition
    return result.normalize('NFC');
}