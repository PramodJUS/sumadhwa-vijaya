---
name: Bug Report
about: Report a bug or incorrect transliteration
title: '[BUG] '
labels: bug
assignees: ''
---

## Bug Description
A clear description of what the bug is.

## Script Affected
Which script(s) are affected? (e.g., Kannada, Telugu, etc.)

## Steps to Reproduce
1. Input text: '...'
2. Target script: '...'
3. Expected output: '...'
4. Actual output: '...'

## Expected Behavior
What you expected to happen (correct transliteration).

## Actual Behavior
What actually happened (incorrect transliteration).

## Environment
- Node.js version (if applicable): [e.g. 18.0.0]
- Browser (if applicable): [e.g. Chrome 120]
- Library version: [e.g. 1.0.0]

## Code Sample
```javascript
// Minimal code to reproduce the issue
const text = "देवनागरी";
const result = transliterateText(text, 'kn');
console.log(result); // Wrong output
```

## Additional Context
Any other relevant information, Unicode codes, or script-specific details.
