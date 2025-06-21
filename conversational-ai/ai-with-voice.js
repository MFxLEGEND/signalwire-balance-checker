#!/usr/bin/env node

/**
 * Conversational AI with Voice Integration
 * Enhanced version with multiple voice provider support
 */

const readline = require('readline');
const VoiceIntegration = require('./voice-integration');

class VoiceEnabledConversationalAI {
    constructor(options = {}) {
        this.pace = options.pace || 'normal';
        this.voiceProvider = options.voiceProvider || 'webspeech';
        this.voiceEnabled = options.voiceEnabled !== false;
        
        this.config = this.getTimingConfig(this.pace);
        this.isActive = true;
        this.conversationHistory = [];
        
        // Initialize voice system
        if (this.voiceEnabled) {
            this.voice = new VoiceIntegration({
                provider: this.voiceProvider,
                rate: 0.9,
                pitch: 1.0,
                volume: 0.8
            });
        }
        
        this.setupInterface();
        this.setupEventHandlers();
    }
    
    getTimingConfig(pace) {
        const configs = {
            slow: {
                thinkingPauseMs: 3000,
                breathPauseMs: 1000,
                sentencePauseMs: 1500,
                typingDelayMs: 80
            },
            normal: {
                thinkingPauseMs: 1500,
                breathPauseMs: 500,
                sentencePauseMs: 800,
                typingDelayMs: 40
            },
            fast: {
                thinkingPauseMs: 800,
                breathPauseMs: 250,
                sentencePauseMs: 400,
                typingDelayMs: 20
            }
        };
        
        return configs[pace] || configs.normal;
    }
    
    setupInterface() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: '\n💬 You: '
        });
    }
    
    setupEventHandlers() {
        process.on('SIGINT', () => {
            console.log('\n\n👋 Thanks for the conversation! Goodbye!');
            this.stop();
        });
        
        this.rl.on('line', async (input) => {
            const userInput = input.trim();
            
            // Handle voice commands
            if (userInput.toLowerCase().startsWith('/voice ')) {
                this.handleVoiceCommand(userInput.substring(7));
                this.rl.prompt();
                return;
            }
            
            // Handle other commands
            if (userInput.toLowerCase() === '/quit') {
                console.log('\n👋 Goodbye!');
                this.stop();
                return;
            }
            
            if (userInput.toLowerCase() === '/help') {
                this.showHelp();
                this.rl.prompt();
                return;
            }
            
            if (userInput.toLowerCase() === '/voices') {
                this.showAvailableVoices();
                this.rl.prompt();
                return;
            }
            
            if (userInput) {
                await this.processConversation(userInput);
            }
            
            this.rl.prompt();
        });
    }
    
    async start() {
        console.clear();
        console.log('🎙️ Voice-Enabled Conversational AI');
        console.log('═══════════════════════════════════');
        console.log('✨ Features: Natural timing + Voice synthesis');
        console.log('🔊 Voice Provider:', this.voiceProvider.toUpperCase());
        console.log('🎭 Conversation Pace:', this.pace.toUpperCase());
        console.log('');
        console.log('💡 Commands: /help, /voices, /voice [command], /quit');
        console.log('');
        
        // Test voice system
        if (this.voiceEnabled && this.voice) {
            console.log('🔊 Testing voice system...');
            try {
                await this.voice.testVoice("Voice system initialized successfully!");
                console.log('✅ Voice system ready!');
            } catch (error) {
                console.log('⚠️ Voice system error:', error.message);
                console.log('🔇 Continuing without voice...');
                this.voiceEnabled = false;
            }
        }
        
        console.log('');
        
        // AI greeting
        await this.showThinkingIndicator();
        
        const greeting = "Hello! I'm your voice-enabled conversational AI assistant. " +
                        "I can speak my responses with natural timing and cadence. " +
                        "What would you like to discuss about programming or technology today?";
        
        process.stdout.write('🤖 AI: ');
        await this.typeWithNaturalTiming(greeting);
        
        // Speak the greeting if voice is enabled
        if (this.voiceEnabled && this.voice) {
            console.log('\n🔊 Speaking response...');
            await this.voice.speak(greeting);
        }
        
        console.log('\n');
        this.rl.prompt();
    }
    
    async processConversation(userInput) {
        if (!this.isActive) return;
        
        try {
            this.conversationHistory.push({
                role: 'user',
                content: userInput,
                timestamp: new Date()
            });
            
            await this.showThinkingIndicator();
            
            const aiResponse = await this.generateResponse(userInput);
            
            this.conversationHistory.push({
                role: 'assistant',
                content: aiResponse,
                timestamp: new Date()
            });
            
            // Type response with natural timing
            process.stdout.write('🤖 AI: ');
            await this.typeWithNaturalTiming(aiResponse);
            
            // Speak response if voice is enabled
            if (this.voiceEnabled && this.voice) {
                console.log('\n🔊 Speaking response...');
                await this.speakWithNaturalVoiceTiming(aiResponse);
            }
            
            console.log('\n');
            
        } catch (error) {
            console.error('\n❌ Error in conversation:', error.message);
        }
    }
    
    async speakWithNaturalVoiceTiming(text) {
        try {
            // Split text into natural speech chunks
            const chunks = this.analyzeTextForVoicePauses(text);
            
            for (const chunk of chunks) {
                if (!this.isActive) break;
                
                // Speak the chunk
                await this.voice.speak(chunk.text);
                
                // Add natural pause
                if (chunk.pauseAfterMs > 0) {
                    await this.sleep(chunk.pauseAfterMs);
                }
            }
        } catch (error) {
            console.error('Voice synthesis error:', error.message);
        }
    }
    
    analyzeTextForVoicePauses(text) {
        const chunks = [];
        const sentences = text.split(/(?<=[.!?])\s+/);
        
        for (const sentence of sentences) {
            if (!sentence.trim()) continue;
            
            // Break long sentences for natural breathing
            const words = sentence.split(' ');
            let currentChunk = '';
            
            for (let i = 0; i < words.length; i++) {
                const word = words[i];
                currentChunk += (currentChunk ? ' ' : '') + word;
                
                // Add breathing pause at natural points
                if (this.isVoiceBreathingPoint(word, i, words.length)) {
                    chunks.push({
                        text: currentChunk,
                        pauseAfterMs: Math.floor(this.config.breathPauseMs * 0.7) // Shorter for voice
                    });
                    currentChunk = '';
                }
            }
            
            // Add remaining text
            if (currentChunk) {
                let pauseMs = Math.floor(this.config.sentencePauseMs * 0.8); // Shorter for voice
                
                if (sentence.endsWith('?') || sentence.endsWith('!')) {
                    pauseMs = Math.floor(this.config.sentencePauseMs * 1.2);
                }
                
                chunks.push({
                    text: currentChunk,
                    pauseAfterMs: pauseMs
                });
            }
        }
        
        return chunks;
    }
    
    isVoiceBreathingPoint(word, index, totalWords) {
        const breathingWords = ['and', 'but', 'or', 'so', 'because', 'however', 'therefore'];
        const endsWithComma = word.endsWith(',');
        const isBreathingWord = breathingWords.includes(word.toLowerCase().replace(/[,.!?]/, ''));
        const isLongClause = index > 0 && index % 6 === 0; // Shorter for voice
        
        return endsWithComma || isBreathingWord || isLongClause;
    }
    
    handleVoiceCommand(command) {
        const parts = command.split(' ');
        const action = parts[0].toLowerCase();
        
        switch (action) {
            case 'test':
                if (this.voiceEnabled && this.voice) {
                    this.voice.testVoice("This is a voice test. How does it sound?");
                } else {
                    console.log('❌ Voice system not available');
                }
                break;
                
            case 'provider':
                if (parts[1]) {
                    this.switchVoiceProvider(parts[1]);
                } else {
                    console.log('Current voice provider:', this.voiceProvider);
                    console.log('Available: webspeech, elevenlabs, openai, azure');
                }
                break;
                
            case 'rate':
                if (parts[1] && this.voice) {
                    const rate = parseFloat(parts[1]);
                    if (rate >= 0.5 && rate <= 2.0) {
                        this.voice.rate = rate;
                        console.log(`✅ Voice rate set to ${rate}`);
                    } else {
                        console.log('❌ Rate must be between 0.5 and 2.0');
                    }
                }
                break;
                
            case 'volume':
                if (parts[1] && this.voice) {
                    const volume = parseFloat(parts[1]);
                    if (volume >= 0 && volume <= 1.0) {
                        this.voice.volume = volume;
                        console.log(`✅ Voice volume set to ${volume}`);
                    } else {
                        console.log('❌ Volume must be between 0 and 1.0');
                    }
                }
                break;
                
            case 'off':
                this.voiceEnabled = false;
                console.log('🔇 Voice output disabled');
                break;
                
            case 'on':
                this.voiceEnabled = true;
                console.log('🔊 Voice output enabled');
                break;
                
            default:
                console.log('❌ Unknown voice command. Try: test, provider, rate, volume, on, off');
        }
    }
    
    switchVoiceProvider(provider) {
        const validProviders = ['webspeech', 'elevenlabs', 'openai', 'azure'];
        
        if (!validProviders.includes(provider)) {
            console.log('❌ Invalid provider. Available:', validProviders.join(', '));
            return;
        }
        
        this.voiceProvider = provider;
        
        if (this.voiceEnabled) {
            this.voice = new VoiceIntegration({
                provider: provider,
                rate: this.voice?.rate || 0.9,
                pitch: this.voice?.pitch || 1.0,
                volume: this.voice?.volume || 0.8
            });
            
            console.log(`✅ Switched to ${provider} voice provider`);
        }
    }
    
    showAvailableVoices() {
        if (!this.voiceEnabled || !this.voice) {
            console.log('❌ Voice system not available');
            return;
        }
        
        console.log('\n🎭 Available Voices:');
        const voices = this.voice.getAvailableVoices();
        
        if (voices.length > 0) {
            voices.forEach((voice, index) => {
                console.log(`  ${index + 1}. ${voice.name} (${voice.lang || voice.style})`);
            });
        } else {
            console.log('  No voices available for current provider');
        }
        console.log('');
    }
    
    async showThinkingIndicator() {
        if (!this.isActive) return;
        
        const thinkingFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
        let frameIndex = 0;
        
        process.stdout.write('\n🧠 ');
        
        const thinkingInterval = setInterval(() => {
            process.stdout.write(`\r🧠 ${thinkingFrames[frameIndex]} Thinking...`);
            frameIndex = (frameIndex + 1) % thinkingFrames.length;
        }, 100);
        
        await this.sleep(this.config.thinkingPauseMs);
        
        clearInterval(thinkingInterval);
        process.stdout.write('\r' + ' '.repeat(30) + '\r');
    }
    
    async typeWithNaturalTiming(text) {
        for (let i = 0; i < text.length; i++) {
            if (!this.isActive) break;
            
            const char = text[i];
            process.stdout.write(char);
            
            let delay = this.config.typingDelayMs;
            
            if (char === ' ') {
                delay = this.config.typingDelayMs * 0.3;
            } else if (char.match(/[.!?]/)) {
                delay = this.config.typingDelayMs * 3;
            } else if (char === ',') {
                delay = this.config.typingDelayMs * 2;
            }
            
            await this.sleep(delay);
        }
    }
    
    async generateResponse(userInput) {
        // Use existing response generation logic
        const isCodeRelated = this.isCodeRelated(userInput);
        const isDebugging = this.isDebuggingQuery(userInput);
        
        if (isDebugging) {
            return this.generateDebuggingResponse(userInput);
        } else if (isCodeRelated) {
            return this.generateCodeResponse(userInput);
        } else {
            return this.generateGeneralResponse(userInput);
        }
    }
    
    isCodeRelated(input) {
        const codeKeywords = [
            'function', 'variable', 'class', 'method', 'array', 'object',
            'loop', 'if', 'else', 'return', 'import', 'export', 'async'
        ];
        return codeKeywords.some(keyword => input.toLowerCase().includes(keyword));
    }
    
    isDebuggingQuery(input) {
        const debugKeywords = ['error', 'bug', 'issue', 'problem', 'not working', 'broken'];
        return debugKeywords.some(keyword => input.toLowerCase().includes(keyword));
    }
    
    generateDebuggingResponse(input) {
        const responses = [
            "I see you're dealing with a debugging challenge... Let me think through this systematically. When I encounter errors like this, I usually start by checking the most common culprits.",
            "Ah, debugging time! This is where we put on our detective hats. The key to effective debugging is being methodical and patient.",
            "Debugging can be frustrating, but it's also a great learning opportunity. I find that walking through the code step by step often reveals the issue."
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    generateCodeResponse(input) {
        const responses = [
            "That's a great programming question! Let me break this down for you. When working with code like this, I always consider both the immediate solution and the long-term maintainability.",
            "Interesting coding challenge! This reminds me of a pattern I've seen many times. The elegant solution here involves thinking about the problem from a different angle.",
            "Good question about programming! This is actually a fundamental concept that's worth understanding deeply."
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    generateGeneralResponse(input) {
        const responses = [
            "That's a thoughtful question! Let me consider this carefully. There are actually several ways to approach this topic, and each has its merits.",
            "I find that topic quite fascinating! There's actually more depth to this than might appear on the surface.",
            "Thanks for bringing that up! It's a topic that connects to many other areas."
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    showHelp() {
        console.log('\n📖 Voice-Enabled Conversational AI Help');
        console.log('═══════════════════════════════════════');
        console.log('🎭 Features:');
        console.log('   ✓ Natural thinking pauses');
        console.log('   ✓ Realistic typing rhythm');
        console.log('   ✓ Voice synthesis with natural timing');
        console.log('   ✓ Multiple voice providers');
        console.log('');
        console.log('💬 Commands:');
        console.log('   /help                    - Show this help');
        console.log('   /voices                  - List available voices');
        console.log('   /voice test              - Test voice synthesis');
        console.log('   /voice provider [name]   - Switch voice provider');
        console.log('   /voice rate [0.5-2.0]    - Adjust speech rate');
        console.log('   /voice volume [0-1.0]    - Adjust volume');
        console.log('   /voice on/off            - Enable/disable voice');
        console.log('   /quit                    - Exit conversation');
        console.log('');
        console.log('🔊 Voice Providers:');
        console.log('   webspeech   - Free browser-based (default)');
        console.log('   elevenlabs  - Premium natural voices');
        console.log('   openai      - OpenAI TTS');
        console.log('   azure       - Microsoft Azure Speech');
        console.log('');
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    stop() {
        this.isActive = false;
        this.rl.close();
        process.exit(0);
    }
}

// Main execution
if (require.main === module) {
    const args = process.argv.slice(2);
    const pace = args[0] || 'normal';
    const voiceProvider = args[1] || 'webspeech';
    
    console.log('🚀 Starting Voice-Enabled Conversational AI...');
    
    const ai = new VoiceEnabledConversationalAI({
        pace: pace,
        voiceProvider: voiceProvider,
        voiceEnabled: true
    });
    
    ai.start().catch(error => {
        console.error('❌ Failed to start AI:', error);
        process.exit(1);
    });
}

module.exports = VoiceEnabledConversationalAI; 