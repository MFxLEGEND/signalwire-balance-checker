@echo off
echo ===============================================
echo 🚀 STARTING NGROK TUNNEL FOR SIGNALWIRE
echo ===============================================
echo.

echo 🔧 Starting ngrok tunnel...
echo 🌐 Tunnel URL: https://just-just-starfish.ngrok-free.app
echo 📡 Local Port: 8080
echo.

echo ⚡ Run this command first:
echo    python main.py
echo.
echo 🔄 Then run ngrok in another terminal:
ngrok start webhook

echo.
echo ===============================================
echo ✅ NGROK TUNNEL ACTIVE
echo ===============================================
pause 