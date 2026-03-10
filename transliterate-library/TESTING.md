# Devanagari Transliterate - Testing Guide

## Running Tests

Currently, the library includes browser-based tests. To run them:

1. Open `test/transliterate-test.html` in a browser
2. Check the console for test results
3. Visually verify the output for each script

## Manual Testing

### Browser Testing
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <script src="transliterate.js"></script>
</head>
<body>
    <script>
        const text = "नमस्ते";
        console.log("Kannada:", transliterateText(text, 'kn'));
        console.log("Telugu:", transliterateText(text, 'te'));
    </script>
</body>
</html>
```

### Node.js Testing
```javascript
const transliterateText = require('./transliterate');

const text = "नमस्ते";
console.log("Kannada:", transliterateText(text, 'kn'));
console.log("Telugu:", transliterateText(text, 'te'));
```

## Recommended Testing Frameworks

For automated testing, consider adding:

**For Node.js:**
```bash
npm install --save-dev jest
```

**For Browser:**
```bash
npm install --save-dev mocha chai
```

## Test Coverage Areas

1. **Basic Transliteration**
   - Simple vowels and consonants
   - Conjunct characters
   - Special characters (anusvara, visarga, etc.)

2. **Script-Specific Features**
   - Tamil special rules
   - Malayalam chillu letters
   - Gujarati special characters

3. **Edge Cases**
   - Empty strings
   - Non-Devanagari text (should pass through)
   - Mixed Devanagari and other text
   - Special Unicode characters

4. **All Supported Scripts**
   - Kannada (kn)
   - Telugu (te)
   - Tamil (ta)
   - Malayalam (ml)
   - Gujarati (gu)
   - Odia (or)
   - Bengali (bn)
   - English/IAST (en)

## Future: Continuous Integration

Consider setting up GitHub Actions for automated testing on every commit.

## Performance Testing

For large texts:
```javascript
const largeText = "धर्मक्षेत्रे कुरुक्षेत्रे...".repeat(1000);
console.time('transliteration');
const result = transliterateText(largeText, 'kn');
console.timeEnd('transliteration');
```
