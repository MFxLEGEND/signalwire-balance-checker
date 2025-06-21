@echo off
echo ====================================
echo    BROWSER CACHE CLEANER
echo ====================================
echo.

echo [1/4] Clearing Chrome DNS cache...
start chrome --new-window "chrome://net-internals/#dns"
timeout /t 3 /nobreak >nul
echo      - Please click "Clear host cache" in the Chrome tab that opened
echo.

echo [2/4] Clearing Opera DNS cache...
start "" "C:\Users\%USERNAME%\AppData\Local\Programs\Opera\opera.exe" --new-window "opera://net-internals/#dns" 2>nul
timeout /t 3 /nobreak >nul
echo      - Please click "Clear host cache" in the Opera tab that opened  
echo.

echo [3/4] Clearing Windows DNS cache...
ipconfig /flushdns
echo.

echo [4/4] Instructions for manual browser cache clear:
echo.
echo CHROME:
echo   1. Go to chrome://settings/clearBrowserData
echo   2. Select "All time" and check "Cookies and other site data"
echo   3. Click "Clear data"
echo.
echo OPERA:
echo   1. Press Ctrl+Shift+Delete
echo   2. Select "All time" and check "Cookies and other site data"  
echo   3. Click "Clear data"
echo.
echo ====================================
echo    CACHE CLEARING COMPLETE!
echo ====================================
echo.
echo Now try accessing https://stake.us in your browser
echo.
pause 