@echo off
echo ====================================
echo    COMPREHENSIVE BROWSER/NETWORK FIX
echo ====================================
echo.

echo [1/8] Closing all browsers...
taskkill /f /im chrome.exe 2>nul
taskkill /f /im opera.exe 2>nul  
taskkill /f /im brave.exe 2>nul
taskkill /f /im firefox.exe 2>nul
taskkill /f /im msedge.exe 2>nul
echo      - All browsers closed

echo.
echo [2/8] Flushing DNS cache...
ipconfig /flushdns
echo      - DNS cache cleared

echo.
echo [3/8] Resetting network stack...
netsh winsock reset
netsh int ip reset
echo      - Network stack reset (requires restart)

echo.
echo [4/8] Clearing Chrome data...
if exist "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Cache" (
    rd /s /q "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Cache" 2>nul
    echo      - Chrome cache cleared
) else (
    echo      - Chrome cache not found
)

echo.
echo [5/8] Clearing Opera data...
if exist "%APPDATA%\Opera Software\Opera Stable\Cache" (
    rd /s /q "%APPDATA%\Opera Software\Opera Stable\Cache" 2>nul
    echo      - Opera cache cleared
) else (
    echo      - Opera cache not found
)

echo.
echo [6/8] Clearing Brave data...
if exist "%LOCALAPPDATA%\BraveSoftware\Brave-Browser\User Data\Default\Cache" (
    rd /s /q "%LOCALAPPDATA%\BraveSoftware\Brave-Browser\User Data\Default\Cache" 2>nul
    echo      - Brave cache cleared
) else (
    echo      - Brave cache not found
)

echo.
echo [7/8] Checking for antivirus interference...
echo      - Please temporarily disable web protection in your antivirus
echo      - Common antivirus: Avast, AVG, McAfee, Norton, Bitdefender
echo      - Look for "Web Shield", "Web Protection", or "Real-time Protection"

echo.
echo [8/8] Testing connectivity...
python -c "import requests; print('✅ Google:', requests.get('https://google.com', timeout=5).status_code)" 2>nul

echo.
echo ====================================
echo    MANUAL STEPS REQUIRED:
echo ====================================
echo 1. RESTART YOUR COMPUTER (important for network reset)
echo 2. After restart, try these browsers in order:
echo    - Edge (built into Windows)
echo    - Firefox (download if needed)  
echo    - Chrome in incognito mode
echo 3. If still failing, try mobile hotspot test
echo.
echo ====================================
echo    ADVANCED SOLUTIONS:
echo ====================================
echo If problem persists after restart:
echo 1. Windows Security → Virus threat protection → Manage settings → Turn OFF Real-time protection (temporarily)
echo 2. Control Panel → Windows Defender Firewall → Turn off (temporarily)
echo 3. Run: sfc /scannow (to check system files)
echo 4. Check Windows Updates
echo.
pause 