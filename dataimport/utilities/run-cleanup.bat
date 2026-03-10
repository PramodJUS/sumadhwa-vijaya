@echo off
REM Quick runner for post-scraping cleanup utilities

echo ===============================================
echo   Post-Scraping Cleanup Utilities
echo ===============================================
echo.

echo Step 1: Normalize Dandas (।। to ॥)
echo ===============================================
python replace_dandas.py
echo.

echo Step 2: Clean Whitespace
echo ===============================================
python cleanup_whitespace.py
echo.

echo ===============================================
echo   Cleanup Complete!
echo ===============================================
echo.
pause
