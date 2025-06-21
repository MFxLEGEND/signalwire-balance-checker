#!/usr/bin/env python3
"""
Comprehensive network diagnostic script to identify system-wide connectivity issues
"""

import requests
import socket
import time
import subprocess
import platform
from urllib.parse import urlparse

def test_basic_connectivity():
    """Test basic network connectivity"""
    print("🌐 TESTING BASIC CONNECTIVITY")
    print("=" * 40)
    
    test_hosts = [
        "8.8.8.8",  # Google DNS
        "1.1.1.1",  # Cloudflare DNS
        "google.com",
        "cloudflare.com"
    ]
    
    for host in test_hosts:
        try:
            # Test ping
            if platform.system().lower() == "windows":
                result = subprocess.run(['ping', '-n', '2', host], 
                                      capture_output=True, text=True, timeout=10)
            else:
                result = subprocess.run(['ping', '-c', '2', host], 
                                      capture_output=True, text=True, timeout=10)
            
            if result.returncode == 0:
                print(f"✅ Ping to {host}: SUCCESS")
            else:
                print(f"❌ Ping to {host}: FAILED")
        except Exception as e:
            print(f"❌ Ping to {host}: ERROR - {e}")

def test_dns_resolution():
    """Test DNS resolution for multiple sites"""
    print("\n🔍 TESTING DNS RESOLUTION")
    print("=" * 40)
    
    test_domains = [
        "google.com",
        "facebook.com", 
        "amazon.com",
        "microsoft.com",
        "cloudflare.com",
        "github.com",
        "stackoverflow.com",
        "reddit.com"
    ]
    
    dns_working = 0
    
    for domain in test_domains:
        try:
            ip_addresses = socket.gethostbyname_ex(domain)[2]
            print(f"✅ {domain}: {ip_addresses[0]}")
            dns_working += 1
        except Exception as e:
            print(f"❌ {domain}: DNS FAILED - {e}")
    
    print(f"\n📊 DNS Success Rate: {dns_working}/{len(test_domains)} ({dns_working/len(test_domains)*100:.1f}%)")
    return dns_working > len(test_domains) * 0.7  # 70% success rate

def test_http_access():
    """Test HTTP access to popular websites"""
    print("\n🌐 TESTING HTTP/HTTPS ACCESS")
    print("=" * 40)
    
    test_sites = [
        "https://google.com",
        "https://microsoft.com", 
        "https://github.com",
        "https://stackoverflow.com",
        "https://reddit.com",
        "https://amazon.com",
        "http://httpbin.org/get",  # Simple HTTP test
        "https://httpbin.org/get"  # Simple HTTPS test
    ]
    
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    })
    
    http_working = 0
    
    for site in test_sites:
        try:
            response = session.get(site, timeout=10, allow_redirects=True)
            if response.status_code < 400:
                print(f"✅ {site}: Status {response.status_code}")
                http_working += 1
            else:
                print(f"⚠️  {site}: Status {response.status_code}")
        except requests.exceptions.SSLError as e:
            print(f"🔒 {site}: SSL ERROR - {str(e)[:60]}...")
        except requests.exceptions.ConnectionError as e:
            print(f"❌ {site}: CONNECTION ERROR - {str(e)[:60]}...")
        except requests.exceptions.Timeout as e:
            print(f"⏰ {site}: TIMEOUT")
        except Exception as e:
            print(f"❌ {site}: ERROR - {str(e)[:60]}...")
    
    print(f"\n📊 HTTP Success Rate: {http_working}/{len(test_sites)} ({http_working/len(test_sites)*100:.1f}%)")
    return http_working > len(test_sites) * 0.7

def test_specific_protocols():
    """Test specific network protocols and ports"""
    print("\n🔧 TESTING SPECIFIC PROTOCOLS")
    print("=" * 40)
    
    # Test common ports
    test_connections = [
        ("google.com", 80, "HTTP"),
        ("google.com", 443, "HTTPS"),
        ("github.com", 22, "SSH"),
        ("outlook.com", 993, "IMAPS"),
        ("8.8.8.8", 53, "DNS"),
    ]
    
    for host, port, protocol in test_connections:
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(5)
            result = sock.connect_ex((host, port))
            sock.close()
            
            if result == 0:
                print(f"✅ {protocol} ({host}:{port}): OPEN")
            else:
                print(f"❌ {protocol} ({host}:{port}): BLOCKED/CLOSED")
        except Exception as e:
            print(f"❌ {protocol} ({host}:{port}): ERROR - {e}")

def check_network_configuration():
    """Check network configuration"""
    print("\n⚙️  CHECKING NETWORK CONFIGURATION")
    print("=" * 40)
    
    try:
        # Get DNS servers
        if platform.system().lower() == "windows":
            result = subprocess.run(['ipconfig', '/all'], 
                                  capture_output=True, text=True, timeout=10)
            lines = result.stdout.split('\n')
            dns_lines = [line.strip() for line in lines if 'DNS Servers' in line]
            if dns_lines:
                print(f"🔍 Current DNS: {dns_lines[0]}")
            else:
                print("❓ Could not determine DNS servers")
        
        # Check for proxy settings
        try:
            import winreg
            internet_settings = winreg.OpenKey(winreg.HKEY_CURRENT_USER,
                r"Software\Microsoft\Windows\CurrentVersion\Internet Settings")
            try:
                proxy_enable = winreg.QueryValueEx(internet_settings, "ProxyEnable")[0]
                if proxy_enable:
                    proxy_server = winreg.QueryValueEx(internet_settings, "ProxyServer")[0]
                    print(f"🔄 Proxy Enabled: {proxy_server}")
                else:
                    print("✅ No system proxy detected")
            except FileNotFoundError:
                print("✅ No proxy settings found")
            winreg.CloseKey(internet_settings)
        except Exception as e:
            print(f"❓ Could not check proxy settings: {e}")
            
    except Exception as e:
        print(f"❌ Error checking network config: {e}")

def diagnose_issue(dns_ok, http_ok):
    """Provide diagnosis based on test results"""
    print("\n" + "=" * 60)
    print("🎯 DIAGNOSIS & SOLUTIONS")
    print("=" * 60)
    
    if dns_ok and http_ok:
        print("✅ GOOD NEWS: Network connectivity appears normal!")
        print("🔍 Issue may be browser-specific or site-specific")
        print("\n💡 SOLUTIONS:")
        print("1. Clear all browser caches and cookies")
        print("2. Try different browsers")
        print("3. Disable browser extensions")
        print("4. Check antivirus/firewall settings")
        
    elif dns_ok and not http_ok:
        print("⚠️  DNS works but HTTP/HTTPS fails")
        print("🔍 Issue: HTTP/HTTPS traffic is being blocked")
        print("\n💡 SOLUTIONS:")
        print("1. Check firewall settings")
        print("2. Disable antivirus web protection temporarily")
        print("3. Check for corporate/parental control software")
        print("4. Try different DNS servers")
        print("5. Contact ISP about HTTP filtering")
        
    elif not dns_ok and not http_ok:
        print("❌ Both DNS and HTTP are failing")
        print("🔍 Issue: Major network connectivity problem")
        print("\n💡 SOLUTIONS:")
        print("1. Restart router and modem")
        print("2. Check network cable connections")
        print("3. Flush DNS cache: ipconfig /flushdns")
        print("4. Reset network settings")
        print("5. Contact ISP for support")
        
    else:  # DNS fails but HTTP works (unusual)
        print("🤔 Unusual: DNS fails but HTTP works")
        print("🔍 Issue: DNS resolution problems")
        print("\n💡 SOLUTIONS:")
        print("1. Change DNS servers to 8.8.8.8 and 8.8.4.4")
        print("2. Flush DNS cache")
        print("3. Restart DNS client service")

def main():
    print("🚨 COMPREHENSIVE NETWORK DIAGNOSTICS")
    print("=" * 60)
    print("🕐 This will test multiple aspects of your network connectivity...")
    print()
    
    # Run all tests
    test_basic_connectivity()
    dns_ok = test_dns_resolution()
    http_ok = test_http_access()
    test_specific_protocols()
    check_network_configuration()
    
    # Provide diagnosis
    diagnose_issue(dns_ok, http_ok)
    
    print("\n" + "=" * 60)
    print("📋 NEXT STEPS:")
    print("1. Try the suggested solutions above")
    print("2. Test with mobile hotspot to isolate ISP issues")
    print("3. If problem persists, contact your ISP")
    print("=" * 60)

if __name__ == "__main__":
    main() 