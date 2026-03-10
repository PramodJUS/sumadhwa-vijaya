# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.4] - 2026-01-02

### Performance
- Added LRU caching for transliteration results
- Cache stores up to 200 recent transliterations
- Significantly improves performance for repeated content

## [1.0.0] - 2025-12-29

### Added
- Initial release of Devanagari Transliterate library
- Support for 8 Indic scripts:
  - Kannada (kn)
  - Telugu (te)
  - Tamil (ta)
  - Malayalam (ml)
  - Gujarati (gu)
  - Odia (or)
  - Bengali (bn)
  - English/IAST (en)
- Character-by-character mapping system
- Browser and Node.js compatibility
- Comprehensive documentation
- Interactive demo page
- Zero external dependencies

### Features
- Accurate transliteration from Devanagari to multiple scripts
- Support for special characters and conjuncts
- Preserves formatting and non-Devanagari text
- Configurable transliteration options
- Lightweight and fast

[1.0.0]: https://github.com/PramodJUS/devanagari-transliterate/releases/tag/v1.0.0
