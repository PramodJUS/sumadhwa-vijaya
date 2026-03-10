# Contributing to Devanagari Transliterate

Thank you for your interest in contributing! Here are some guidelines.

## How to Contribute

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes**
4. **Test your changes** thoroughly
5. **Commit with clear messages**: `git commit -m "Add: feature description"`
6. **Push to your fork**: `git push origin feature/your-feature-name`
7. **Create a Pull Request**

## Commit Message Guidelines

Use clear, descriptive commit messages:
- `Add:` for new features (e.g., new script support)
- `Fix:` for bug fixes
- `Update:` for improvements to existing features
- `Docs:` for documentation changes
- `Test:` for adding tests
- `Refactor:` for code restructuring

## Adding New Script Support

When adding support for a new Indic script:

1. Create a new script file in `scripts/` folder (e.g., `punjabi-script.js`)
2. Define the character mapping following the existing format
3. Export the script mapping object
4. Update `transliterate.js` to include the new script
5. Add the script to the demo page
6. Update README.md with the new script
7. Add test cases

## Code Style

- Use meaningful variable names
- Add comments for complex mappings
- Follow existing code formatting
- Keep character mappings organized and consistent
- Maintain Unicode accuracy

## Testing

- Test transliteration with various input texts
- Verify special characters and conjuncts
- Test in both browser and Node.js environments
- Check edge cases (empty strings, special characters, etc.)

## Documentation

- Update README.md if you add new features or scripts
- Add JSDoc comments to new functions
- Update CHANGELOG.md
- Provide usage examples

## Questions?

Feel free to open an issue for discussion before starting work on major changes.
