from pyngrok import ngrok
import logging

# Enable debug logging
logging.basicConfig(level=logging.DEBUG)

# Set auth token
ngrok.set_auth_token("2yd0kPKniNHiAN1FUFVc2RprMJ0_CknDdPfKx6YxZrwf6SBt")

# Start tunnel
try:
    public_url = ngrok.connect(8080)
    print(f"ngrok tunnel established at: {public_url}")
    tunnels = ngrok.get_tunnels()
    print(f"Active tunnels: {tunnels}")
except Exception as e:
    print(f"Error establishing tunnel: {e}")

input("Press Enter to close the tunnel...") 