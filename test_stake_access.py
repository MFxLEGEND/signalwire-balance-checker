#!/usr/bin/env python3
"""
Test script to diagnose stake.us accessibility issues
"""

import requests
import socket
import urllib.parse
import time
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

def test_dns_resolution():
    """Test DNS resolution for stake.us"""
    print("🔍 Testing DNS Resolution...")
    try:
        ip_addresses = socket.gethostbyname_ex('stake.us')[2]
        print(f"✅ DNS Resolution: {', '.join(ip_addresses)}")
        return True
    except Exception as e:
        print(f"❌ DNS Resolution failed: {e}")
        return False

def test_http_connection():
    """Test HTTP connection to stake.us"""
    print("\n🌐 Testing HTTP Connection...")
    
    # Setup session with retries
    session = requests.Session()
    retry_strategy = Retry(
        total=3,
        backoff_factor=1,
        status_forcelist=[429, 500, 502, 503, 504],
    )
    adapter = HTTPAdapter(max_retries=retry_strategy)
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    
    # Test different approaches
    test_urls = [
        "https://stake.us",
        "http://stake.us",
        "https://104.18.32.62",  # Direct IP
        "https://172.64.155.194"  # Alternate IP
    ]
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    for url in test_urls:
        try:
            print(f"  Testing: {url}")
            response = session.get(url, headers=headers, timeout=10, allow_redirects=True)
            print(f"  ✅ Status: {response.status_code}")
            print(f"  ✅ Content-Type: {response.headers.get('content-type', 'N/A')}")
            print(f"  ✅ Content Length: {len(response.text)} chars")
            if response.status_code == 200:
                print(f"  ✅ SUCCESS: Website accessible via {url}")
                return True
            else:
                print(f"  ⚠️  Non-200 status: {response.status_code}")
        except requests.exceptions.SSLError as e:
            print(f"  ❌ SSL Error: {e}")
        except requests.exceptions.ConnectionError as e:
            print(f"  ❌ Connection Error: {e}")
        except requests.exceptions.Timeout as e:
            print(f"  ❌ Timeout: {e}")
        except Exception as e:
            print(f"  ❌ Other Error: {e}")
        print()
    
    return False

def test_specific_blocking():
    """Test for specific types of blocking"""
    print("🔍 Testing for Specific Blocking Mechanisms...")
    
    # Test if it's geo-blocking
    session = requests.Session()
    
    # Different User-Agent strings
    user_agents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59'
    ]
    
    for i, ua in enumerate(user_agents, 1):
        try:
            print(f"  Test {i}: Different User-Agent")
            headers = {'User-Agent': ua}
            response = session.get('https://stake.us', headers=headers, timeout=5)
            print(f"    ✅ Status: {response.status_code}")
        except Exception as e:
            print(f"    ❌ Failed: {e}")

def main():
    print("=" * 50)
    print("🎯 STAKE.US ACCESSIBILITY DIAGNOSTICS")
    print("=" * 50)
    
    # Test 1: DNS Resolution
    dns_works = test_dns_resolution()
    
    # Test 2: HTTP Connection
    http_works = test_http_connection()
    
    # Test 3: Specific blocking
    test_specific_blocking()
    
    print("\n" + "=" * 50)
    print("📊 DIAGNOSIS SUMMARY")
    print("=" * 50)
    print(f"DNS Resolution: {'✅ Working' if dns_works else '❌ Failed'}")
    print(f"HTTP Access: {'✅ Working' if http_works else '❌ Failed'}")
    
    if dns_works and http_works:
        print("\n🎉 GOOD NEWS: stake.us is accessible via Python!")
        print("🔍 Issue is likely browser-specific blocking or filtering")
        print("\n💡 SOLUTIONS:")
        print("1. Try different browsers (Firefox, Edge)")
        print("2. Use Incognito/Private mode")
        print("3. Disable browser extensions")
        print("4. Check browser security settings")
        print("5. Try VPN or proxy")
    elif dns_works and not http_works:
        print("\n⚠️  DNS works but HTTP fails")
        print("🔍 Issue is likely ISP HTTP/HTTPS filtering")
        print("\n💡 SOLUTIONS:")
        print("1. Try VPN or proxy")
        print("2. Contact ISP about filtering")
        print("3. Use different network (mobile hotspot)")
    else:
        print("\n❌ Network-level issues detected")
        print("💡 SOLUTIONS:")
        print("1. Check internet connection")
        print("2. Try different DNS servers")
        print("3. Contact ISP for support")

if __name__ == "__main__":
    main() 