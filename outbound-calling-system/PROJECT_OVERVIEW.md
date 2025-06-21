# Outbound Calling System - Project Overview

## 📁 Folder Structure

```
outbound-calling-system/
├── PROJECT_OVERVIEW.md     # This file - project navigation guide
├── configs/                # Asterisk configuration files
│   ├── asterisk_dialplan.conf    # Dialplan for DTMF handling
│   └── sip_trunk_config.conf     # SIP trunk configurations
├── scripts/                # Python automation scripts
│   ├── outbound_caller.py         # Main calling class
│   └── test_calls.py             # Test and example scripts
├── docs/                   # Documentation
│   ├── README.md                 # Quick start guide
│   └── setup_guide.md           # Detailed installation guide
└── examples/               # Example configurations and scripts
    ├── sample_calls.csv          # Sample CSV for bulk calling
    ├── bank_system_example.py    # Bank system automation example
    └── conference_call_example.py # Conference call example
```

## 🚀 Quick Start

1. **Read Documentation First**
   ```bash
   # Start here for overview
   cat docs/README.md
   
   # For detailed setup
   cat docs/setup_guide.md
   ```

2. **Test the System**
   ```bash
   cd scripts/
   python test_calls.py --interactive
   ```

3. **Configure for Your Provider**
   ```bash
   # Edit with your VoIP provider details
   nano configs/sip_trunk_config.conf
   ```

## 🎯 Common Use Cases

### Quick Call with DTMF
```bash
cd scripts/
python outbound_caller.py 15551234567 --dtmf "123#456*"
```

### Bank System Navigation
```bash
cd scripts/
python -c "
from outbound_caller import OutboundCaller
caller = OutboundCaller()
caller.make_immediate_call(
    phone_number='18005551234',
    dtmf_sequence='2*123456789#1234#1',
    context='outbound-service-system'
)"
```

### Bulk Calling from CSV
```bash
cd examples/
python bulk_calling_example.py sample_calls.csv
```

## 🔧 Configuration Files

| File | Purpose | Edit Required |
|------|---------|---------------|
| `configs/sip_trunk_config.conf` | VoIP provider settings | ✅ **YES** - Add your credentials |
| `configs/asterisk_dialplan.conf` | Call flow logic | ⚠️ Optional - Customize as needed |

## 📞 VoIP Provider Setup

### Recommended: VoIP.ms
1. Sign up at https://voip.ms
2. Add $10 credit
3. Get SIP credentials
4. Update `configs/sip_trunk_config.conf`

### Alternative: Sonetel
1. Sign up at https://sonetel.com
2. Get API access
3. Configure SIP settings

## 🧪 Testing Workflow

```bash
# 1. Test basic functionality
cd scripts/
python test_calls.py

# 2. Interactive testing
python test_calls.py --interactive

# 3. Test specific scenarios
python examples/bank_system_example.py
python examples/conference_call_example.py
```

## 🆘 Troubleshooting

| Issue | Check | Solution |
|-------|-------|----------|
| Scripts not found | Current directory | `cd scripts/` before running |
| Config errors | Provider credentials | Edit `configs/sip_trunk_config.conf` |
| DTMF not working | Codec settings | Ensure ulaw/alaw in config |
| No calls made | Asterisk status | Check if Asterisk is running |

## 💡 Next Steps

1. **Setup WSL** (if on Windows)
2. **Install Asterisk** following `docs/setup_guide.md`
3. **Configure VoIP Provider** in `configs/`
4. **Test with** `scripts/test_calls.py`
5. **Customize** examples for your needs

## 📋 File Descriptions

### Scripts (`scripts/`)
- **`outbound_caller.py`** - Main class for creating calls
- **`test_calls.py`** - Comprehensive testing suite

### Configs (`configs/`)
- **`asterisk_dialplan.conf`** - Controls call flow and DTMF
- **`sip_trunk_config.conf`** - VoIP provider connection

### Docs (`docs/`)
- **`README.md`** - Project overview and quick start
- **`setup_guide.md`** - Step-by-step installation

### Examples (`examples/`)
- **`sample_calls.csv`** - Example data for bulk calling
- **`bank_system_example.py`** - Automated banking system
- **`conference_call_example.py`** - Conference automation

## 🌟 Features Included

✅ **Free & Open Source** - No licensing costs  
✅ **DTMF Support** - Send button presses automatically  
✅ **Multiple Scenarios** - Bank, conference, voicemail systems  
✅ **Scheduling** - Queue calls for future execution  
✅ **Bulk Calling** - Process multiple calls from CSV  
✅ **Comprehensive Testing** - Built-in test suite  
✅ **Documentation** - Detailed guides and examples  
✅ **Cross-Platform** - Windows (WSL), Linux, Docker  

## 💰 Cost Summary

- **Software**: FREE
- **VoIP Service**: $1-5/month
- **Phone Number**: $1-2/month (optional)
- **Total**: $2-7/month

---

**Need Help?** Start with `docs/README.md` for quick overview or `docs/setup_guide.md` for detailed setup!

**Ready to Begin?** Jump to `scripts/test_calls.py --interactive` for hands-on testing! 