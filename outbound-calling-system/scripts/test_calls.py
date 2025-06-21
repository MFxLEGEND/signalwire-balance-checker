#!/usr/bin/env python3
"""
Test Script for Outbound Calling with DTMF
Demonstrates various calling scenarios
"""

import time
from outbound_caller import OutboundCaller
from datetime import datetime

def test_basic_dtmf_call():
    """Test basic call with DTMF sequence"""
    print("🧪 Testing Basic DTMF Call...")
    
    caller = OutboundCaller(asterisk_spool_dir="/var/spool/asterisk")
    
    # Call a test number and send DTMF
    result = caller.make_immediate_call(
        phone_number="15551234567",  # Replace with your test number
        dtmf_sequence="123#456*789",
        caller_id="Test System <5555551234>",
        context="outbound-calls"
    )
    
    if result:
        print("✅ Basic DTMF call test successful!")
    else:
        print("❌ Basic DTMF call test failed!")
    
    return result

def test_bank_system_navigation():
    """Test automated bank system navigation"""
    print("🏦 Testing Bank System Navigation...")
    
    caller = OutboundCaller()
    
    # Simulate calling a bank system
    # Typical sequence: Wait -> Press 2 for account services -> Account# -> PIN -> Balance inquiry
    dtmf_sequence = "2*123456789#1234#1"  # Menu -> Account -> PIN -> Balance
    
    result = caller.make_immediate_call(
        phone_number="18005551234",  # Bank's number
        dtmf_sequence=dtmf_sequence,
        caller_id="Account Checker <5555551234>",
        context="outbound-service-system"
    )
    
    if result:
        print("✅ Bank system navigation test created!")
    else:
        print("❌ Bank system navigation test failed!")
    
    return result

def test_conference_call():
    """Test conference call with access codes"""
    print("📞 Testing Conference Call...")
    
    caller = OutboundCaller()
    
    # Conference call with ID and PIN
    result = caller.create_call_file(
        phone_number="18005551234",
        context="outbound-conference",
        extension="s",
        priority="1",
        caller_id="Conference User <5555551234>"
    )
    
    # You would set conference variables separately
    # This is just creating the call file structure
    
    if result:
        print("✅ Conference call test created!")
    else:
        print("❌ Conference call test failed!")
    
    return result

def test_scheduled_call():
    """Test scheduling a call for later"""
    print("⏰ Testing Scheduled Call...")
    
    caller = OutboundCaller()
    
    # Schedule a call for 2 minutes from now
    result = caller.schedule_call(
        phone_number="15551234567",
        dtmf_sequence="*123#",
        minutes_from_now=2,
        caller_id="Scheduled Call <5555551234>"
    )
    
    if result:
        print("✅ Scheduled call test successful!")
        print(f"📅 Call scheduled for 2 minutes from now")
    else:
        print("❌ Scheduled call test failed!")
    
    return result

def test_voicemail_navigation():
    """Test voicemail system navigation"""
    print("📧 Testing Voicemail Navigation...")
    
    caller = OutboundCaller()
    
    result = caller.create_call_file(
        phone_number="15551234567",
        context="outbound-voicemail",
        extension="s",
        priority="1",
        caller_id="VM System <5555551234>"
    )
    
    if result:
        print("✅ Voicemail navigation test created!")
    else:
        print("❌ Voicemail navigation test failed!")
    
    return result

def test_bulk_calls():
    """Test multiple calls with different DTMF sequences"""
    print("📋 Testing Bulk Calls...")
    
    caller = OutboundCaller()
    
    # List of test calls
    test_calls = [
        {
            "phone": "15551111111",
            "dtmf": "111#",
            "description": "Test call 1"
        },
        {
            "phone": "15552222222", 
            "dtmf": "222*333#",
            "description": "Test call 2"
        },
        {
            "phone": "15553333333",
            "dtmf": "*999#",
            "description": "Test call 3"
        }
    ]
    
    success_count = 0
    
    for i, call in enumerate(test_calls):
        print(f"Creating call {i+1}: {call['description']}")
        
        result = caller.make_immediate_call(
            phone_number=call["phone"],
            dtmf_sequence=call["dtmf"],
            caller_id=f"Bulk Test {i+1} <555555{i+1}234>"
        )
        
        if result:
            success_count += 1
            print(f"  ✅ Call {i+1} created successfully")
        else:
            print(f"  ❌ Call {i+1} failed")
        
        # Small delay between calls
        time.sleep(1)
    
    print(f"📊 Bulk test results: {success_count}/{len(test_calls)} calls created")
    return success_count == len(test_calls)

def test_dtmf_variations():
    """Test different DTMF sequence formats"""
    print("🔢 Testing DTMF Variations...")
    
    caller = OutboundCaller()
    
    dtmf_tests = [
        "123456789",           # Numbers only
        "*123#",               # With star and pound
        "1*2*3*4*5#",         # Multiple stars
        "###",                 # Multiple pounds
        "0*0*0#1234567890#",  # Complex sequence
        "1,2,3,4,5",          # With pauses (commas)
    ]
    
    success_count = 0
    
    for i, dtmf in enumerate(dtmf_tests):
        print(f"Testing DTMF sequence {i+1}: '{dtmf}'")
        
        result = caller.make_immediate_call(
            phone_number="15551234567",
            dtmf_sequence=dtmf,
            caller_id=f"DTMF Test {i+1} <5555551234>"
        )
        
        if result:
            success_count += 1
            print(f"  ✅ DTMF test {i+1} successful")
        else:
            print(f"  ❌ DTMF test {i+1} failed")
    
    print(f"📊 DTMF variation results: {success_count}/{len(dtmf_tests)} tests passed")
    return success_count == len(dtmf_tests)

def run_all_tests():
    """Run all test scenarios"""
    print("🚀 Starting Outbound Calling DTMF Tests")
    print("=" * 50)
    
    tests = [
        ("Basic DTMF Call", test_basic_dtmf_call),
        ("Bank System Navigation", test_bank_system_navigation),
        ("Conference Call", test_conference_call),
        ("Scheduled Call", test_scheduled_call),
        ("Voicemail Navigation", test_voicemail_navigation),
        ("Bulk Calls", test_bulk_calls),
        ("DTMF Variations", test_dtmf_variations),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n📋 Running: {test_name}")
        print("-" * 30)
        
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ Test failed with error: {e}")
            results.append((test_name, False))
        
        print("")  # Add spacing between tests
    
    # Print summary
    print("=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    
    passed = 0
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
        if result:
            passed += 1
    
    print(f"\nOverall: {passed}/{len(results)} tests passed")
    
    if passed == len(results):
        print("🎉 All tests passed! Your system is ready to use.")
    else:
        print("⚠️  Some tests failed. Check configuration and try again.")

def interactive_test():
    """Interactive test mode for manual testing"""
    print("🎮 Interactive Test Mode")
    print("=" * 30)
    
    caller = OutboundCaller()
    
    while True:
        print("\nOptions:")
        print("1. Make test call")
        print("2. Schedule test call")
        print("3. Test DTMF sequence")
        print("4. Exit")
        
        choice = input("\nEnter your choice (1-4): ").strip()
        
        if choice == "1":
            phone = input("Enter phone number: ").strip()
            dtmf = input("Enter DTMF sequence (optional): ").strip()
            
            result = caller.make_immediate_call(
                phone_number=phone,
                dtmf_sequence=dtmf,
                caller_id="Interactive Test <5555551234>"
            )
            
            if result:
                print("✅ Call file created successfully!")
            else:
                print("❌ Failed to create call file!")
        
        elif choice == "2":
            phone = input("Enter phone number: ").strip()
            dtmf = input("Enter DTMF sequence (optional): ").strip()
            minutes = int(input("Schedule in how many minutes? "))
            
            result = caller.schedule_call(
                phone_number=phone,
                dtmf_sequence=dtmf,
                minutes_from_now=minutes
            )
            
            if result:
                print(f"✅ Call scheduled for {minutes} minutes from now!")
            else:
                print("❌ Failed to schedule call!")
        
        elif choice == "3":
            dtmf = input("Enter DTMF sequence to test: ").strip()
            
            result = caller.make_immediate_call(
                phone_number="15551234567",  # Test number
                dtmf_sequence=dtmf,
                caller_id="DTMF Test <5555551234>"
            )
            
            if result:
                print("✅ DTMF test call created!")
            else:
                print("❌ Failed to create DTMF test!")
        
        elif choice == "4":
            print("👋 Goodbye!")
            break
        
        else:
            print("❌ Invalid choice. Please try again.")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "--interactive":
            interactive_test()
        elif sys.argv[1] == "--help":
            print("Usage:")
            print("  python test_calls.py              # Run all tests")
            print("  python test_calls.py --interactive # Interactive mode") 
            print("  python test_calls.py --help       # Show this help")
        else:
            print("Unknown argument. Use --help for usage.")
    else:
        run_all_tests() 