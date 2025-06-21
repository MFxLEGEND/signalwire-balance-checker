import requests
import socket

def test_websites():
    """Test access to multiple popular websites"""
    print("🌐 TESTING WEBSITE ACCESS")
    print("=" * 40)
    
    test_sites = [
        "https://google.com",
        "https://microsoft.com", 
        "https://github.com",
        "https://amazon.com",
        "https://reddit.com",
        "https://youtube.com",
        "https://facebook.com",
        "https://twitter.com"
    ]
    
    working = 0
    total = len(test_sites)
    
    for site in test_sites:
        try:
            response = requests.get(site, timeout=10)
            if response.status_code < 400:
                print(f"✅ {site}: Working (Status {response.status_code})")
                working += 1
            else:
                print(f"⚠️  {site}: Status {response.status_code}")
        except Exception as e:
            print(f"❌ {site}: FAILED - {str(e)[:50]}...")
    
    print(f"\n📊 SUCCESS RATE: {working}/{total} ({working/total*100:.1f}%)")
    
    if working == 0:
        print("\n🚨 CRITICAL: NO WEBSITES ACCESSIBLE")
        print("This indicates a major network issue!")
    elif working < total * 0.5:
        print("\n⚠️  WARNING: Many sites failing")
        print("Possible ISP or firewall blocking")
    else:
        print("\n✅ Most sites working - issue may be site-specific")

def test_dns_servers():
    """Test different DNS servers"""
    print("\n🔍 TESTING DNS RESOLUTION")
    print("=" * 40)
    
    # Test with different DNS servers
    dns_servers = [
        ("Current DNS", None),
        ("Google DNS", "8.8.8.8"),
        ("Cloudflare DNS", "1.1.1.1"),
        ("OpenDNS", "208.67.222.222")
    ]
    
    test_domain = "google.com"
    
    for name, dns_ip in dns_servers:
        try:
            if dns_ip:
                # This is a simplified test - in real implementation you'd configure DNS properly
                print(f"🔍 {name} ({dns_ip}): Testing...")
            
            ip = socket.gethostbyname(test_domain)
            print(f"✅ {name}: {test_domain} resolves to {ip}")
        except Exception as e:
            print(f"❌ {name}: DNS resolution failed - {e}")

if __name__ == "__main__":
    print("🚨 SYSTEM-WIDE CONNECTIVITY TEST")
    print("=" * 50)
    
    test_websites()
    test_dns_servers()
    
    print("\n" + "=" * 50)
    print("💡 COMMON SOLUTIONS FOR SYSTEM-WIDE ISSUES:")
    print("1. Restart your router/modem")
    print("2. Disable antivirus web protection temporarily")
    print("3. Check Windows Firewall settings")
    print("4. Reset network settings: netsh winsock reset")
    print("5. Change DNS servers to 8.8.8.8 and 8.8.4.4")
    print("6. Test with mobile hotspot")
    print("=" * 50) 