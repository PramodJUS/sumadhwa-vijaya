"""
Common Functions for Web Scraping
==================================

Reusable helper functions for scraping Sanskrit texts from dvaitavedanta.in.

Usage:
    from utilities.common_functions import clean_sanskrit_text, retry_on_failure

"""

import re
import time
from functools import wraps


# ============================================================================
# TEXT CLEANING
# ============================================================================

def clean_sanskrit_text(text, remove_author_lines=True, normalize_whitespace=True):
    """
    Clean and normalize Sanskrit text

    Args:
        text: Raw text to clean
        remove_author_lines: Remove lines containing author attribution keywords
        normalize_whitespace: Collapse multiple spaces and remove extra newlines

    Returns:
        Cleaned text
    """
    if not text:
        return ""

    # Remove zero-width characters
    text = text.replace('\xa0', ' ')
    text = text.replace('\u200b', '')
    text = text.replace('\u200c', '')  # Zero-width non-joiner
    text = text.replace('\u200d', '')  # Zero-width joiner

    # Split into lines for processing
    lines = text.split('\n')
    cleaned_lines = []

    for line in lines:
        # Normalize whitespace within line
        if normalize_whitespace:
            line = ' '.join(line.split())

        if not line:
            continue

        # Remove author attribution lines
        if remove_author_lines:
            author_keywords = [
                'कृता', 'कृत:', 'विरचित', 'विरचिता',
                'रचना', 'लेखक:', 'ग्रन्थकार:',
                'composed by', 'written by', 'author:'
            ]
            if any(keyword in line for keyword in author_keywords):
                continue

        cleaned_lines.append(line)

    # Join with single newlines
    result = '\n'.join(cleaned_lines)

    return result.strip()


def normalize_dandas(text):
    """
    Normalize Devanagari dandas

    Replaces:
        ।। (U+0964 U+0964) → ॥ (U+0965)

    Args:
        text: Text containing dandas

    Returns:
        Text with normalized dandas
    """
    if not text:
        return ""

    # Replace double vertical bar with double danda
    text = text.replace('।।', '॥')

    return text


def remove_html_tags(text):
    """
    Remove HTML tags from text

    Args:
        text: Text potentially containing HTML tags

    Returns:
        Text without HTML tags
    """
    if not text:
        return ""

    # Remove HTML tags
    clean = re.sub(r'<[^>]+>', '', text)

    # Remove HTML entities
    clean = clean.replace('&nbsp;', ' ')
    clean = clean.replace('&lt;', '<')
    clean = clean.replace('&gt;', '>')
    clean = clean.replace('&amp;', '&')
    clean = clean.replace('&quot;', '"')

    return clean


def extract_first_n_words(text, n=10):
    """
    Extract first N words from text (useful for pratika/quotation detection)

    Args:
        text: Text to extract from
        n: Number of words to extract

    Returns:
        First N words joined with space
    """
    if not text:
        return ""

    words = text.split()
    return ' '.join(words[:n])


# ============================================================================
# DOM TRAVERSAL (for use with Selenium)
# ============================================================================

def extract_text_between_elements(driver, start_element, stop_tag_names=None):
    """
    Extract text from siblings between start_element and next heading

    Args:
        driver: Selenium WebDriver instance
        start_element: Starting WebElement (e.g., H3 heading)
        stop_tag_names: List of tag names to stop at (default: ['h2', 'h3', 'h4'])

    Returns:
        Extracted and cleaned text
    """
    if stop_tag_names is None:
        stop_tag_names = ['h2', 'h3', 'h4']

    text_parts = []
    current = start_element

    while True:
        # Get next sibling element
        current = driver.execute_script("return arguments[0].nextElementSibling;", current)

        # Stop if no more siblings
        if current is None:
            break

        # Stop at next heading
        if current.tag_name.lower() in stop_tag_names:
            break

        # Extract text from content elements
        if current.tag_name.lower() in ['p', 'div', 'ul', 'ol', 'blockquote', 'pre']:
            text = clean_sanskrit_text(current.text)
            if text and len(text) > 5:  # Skip trivial elements
                text_parts.append(text)

    return '\n\n'.join(text_parts)


def find_heading_by_keyword(driver, container, tag_name, keyword):
    """
    Find heading element containing keyword

    Args:
        driver: Selenium WebDriver instance (not used, kept for consistency)
        container: Container WebElement to search within
        tag_name: Tag name to search (e.g., 'h2', 'h3')
        keyword: Text to search for in heading

    Returns:
        WebElement or None
    """
    from selenium.webdriver.common.by import By

    headings = container.find_elements(By.TAG_NAME, tag_name)

    for heading in headings:
        heading_text = clean_sanskrit_text(heading.text)
        if keyword in heading_text:
            return heading

    return None


# ============================================================================
# ERROR HANDLING & RETRIES
# ============================================================================

def retry_on_failure(max_retries=3, delay=2, exceptions=(Exception,)):
    """
    Decorator to retry function on failure

    Usage:
        @retry_on_failure(max_retries=3, delay=2)
        def fetch_page(url):
            # ... code that might fail

    Args:
        max_retries: Maximum number of retry attempts
        delay: Seconds to wait between retries
        exceptions: Tuple of exception types to catch

    Returns:
        Decorated function
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    if attempt < max_retries - 1:
                        print(f"    [RETRY {attempt + 1}/{max_retries}] {func.__name__} failed: {e}")
                        time.sleep(delay)
                    else:
                        print(f"    [FAILED] {func.__name__} exhausted retries")
                        raise
            return None
        return wrapper
    return decorator


# ============================================================================
# VALIDATION
# ============================================================================

def validate_json_structure(data, expected_keys):
    """
    Validate JSON structure has expected keys

    Args:
        data: Dictionary to validate
        expected_keys: List of required keys

    Returns:
        Tuple (is_valid: bool, missing_keys: list)
    """
    missing_keys = []

    for key in expected_keys:
        if key not in data:
            missing_keys.append(key)

    is_valid = len(missing_keys) == 0

    return is_valid, missing_keys


def count_characters(data):
    """
    Count total characters in nested dictionary (for JSON validation)

    Args:
        data: Nested dictionary (e.g., grantha-details.json)

    Returns:
        Total character count
    """
    total = 0

    def count_recursive(obj):
        nonlocal total
        if isinstance(obj, str):
            total += len(obj)
        elif isinstance(obj, dict):
            for value in obj.values():
                count_recursive(value)
        elif isinstance(obj, list):
            for item in obj:
                count_recursive(item)

    count_recursive(data)
    return total


def find_empty_commentaries(data):
    """
    Find empty commentary fields in scraped data

    Args:
        data: Grantha details dictionary

    Returns:
        List of tuples: [(topic_id, part_key, commentary_key), ...]
    """
    empty_fields = []

    for topic_id, parts in data.items():
        for part_key, commentaries in parts.items():
            for commentary_key, text in commentaries.items():
                if not text or len(text.strip()) == 0:
                    empty_fields.append((topic_id, part_key, commentary_key))

    return empty_fields


# ============================================================================
# FILE UTILITIES
# ============================================================================

def create_backup_filename(original_path, suffix=None):
    """
    Create backup filename with timestamp

    Args:
        original_path: Original file path
        suffix: Optional suffix (default: timestamp)

    Returns:
        Backup file path

    Example:
        create_backup_filename("data.json")
        -> "data-backup-20260310.json"
    """
    from pathlib import Path
    from datetime import datetime

    path = Path(original_path)
    stem = path.stem
    ext = path.suffix

    if suffix is None:
        suffix = datetime.now().strftime("%Y%m%d")

    backup_name = f"{stem}-backup-{suffix}{ext}"
    backup_path = path.parent / backup_name

    return str(backup_path)


# ============================================================================
# EXAMPLE USAGE
# ============================================================================

if __name__ == "__main__":
    # Example 1: Text cleaning
    raw_text = """
    श्रीमध्वमतानुसारेण   ब्रह्मसूत्रम् ।।

    विरचित श्रीमदाचार्य माध्वेन कृत:

    अथातो ब्रह्मजिज्ञासा ॥
    """

    cleaned = clean_sanskrit_text(raw_text)
    print("Cleaned text:")
    print(cleaned)
    print()

    # Example 2: Danda normalization
    text_with_dandas = "ॐ तत्सत् ।। श्रीकृष्णार्पणमस्तु ।।"
    normalized = normalize_dandas(text_with_dandas)
    print("Normalized dandas:")
    print(normalized)
    print()

    # Example 3: Validation
    test_data = {
        "1": {
            "Part#1": {
                "main_text": "...",
                "commentary_1": "...",
                "commentary_2": ""  # Empty!
            }
        }
    }

    empty_fields = find_empty_commentaries(test_data)
    if empty_fields:
        print("Empty commentaries found:")
        for topic_id, part_key, commentary_key in empty_fields:
            print(f"  Topic {topic_id}, {part_key}, {commentary_key}")
    else:
        print("No empty commentaries found")
