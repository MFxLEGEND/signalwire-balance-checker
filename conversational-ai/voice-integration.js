/**
 * Voice Integration Module for Conversational AI
 * Multiple voice implementation options
 */

class VoiceIntegration {
    constructor(options = {}) {
        this.provider = options.provider || 'webspeech';
        this.voice = options.voice || 'default';
        this.rate = options.rate || 0.9;
        this.pitch = options.pitch || 1.0;
        this.volume = options.volume || 0.8;
        this.isNodeJS = typeof window === 'undefined';
        this.isEnabled = !this.isNodeJS;
        
        if (this.isNodeJS) {
            console.log('🔇 Voice system running in Node.js mode (text-only)');
            this.setupNodeJSMode();
        } else {
            this.setupVoiceProvider();
        }
    }

    setupNodeJSMode() {
        // In Node.js, we'll use console output instead of voice
        this.synthesis = null;
        this.voices = [];
        console.log('Voice integration running in text-only mode for Node.js environment');
    }

    setupVoiceProvider() {
        switch (this.provider) {
            case 'webspeech':
                this.setupWebSpeech();
                break;
            case 'elevenlabs':
                this.setupElevenLabs();
                break;
            case 'openai':
                this.setupOpenAI();
                break;
            case 'azure':
                this.setupAzure();
                break;
            default:
                this.setupWebSpeech();
        }
    }

    // ===== WEB SPEECH API (Browser-based, FREE) =====
    setupWebSpeech() {
        if (this.isNodeJS) {
            // Node.js environment - no speech synthesis available
            this.synthesis = null;
            console.log('Web Speech API not available in Node.js environment');
            return;
        }
        
        if ('speechSynthesis' in window) {
            this.synthesis = window.speechSynthesis;
            this.loadVoices();
        } else {
            console.error('Web Speech API not supported');
        }
    }

    loadVoices() {
        this.voices = this.synthesis.getVoices();
        
        // If voices aren't loaded yet, wait for them
        if (this.voices.length === 0) {
            this.synthesis.addEventListener('voiceschanged', () => {
                this.voices = this.synthesis.getVoices();
                console.log('Available voices:', this.voices.map(v => v.name));
            });
        }
    }

    async speakWithWebSpeech(text, options = {}) {
        return new Promise((resolve, reject) => {
            if (!this.synthesis) {
                reject(new Error('Speech synthesis not available'));
                return;
            }

            // Cancel any ongoing speech
            this.synthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            
            // Configure voice
            if (this.voices && this.voices.length > 0) {
                // Find preferred voice (e.g., female, UK English)
                const preferredVoice = this.voices.find(voice => 
                    voice.name.includes('Google UK English Female') ||
                    voice.name.includes('Microsoft Zira') ||
                    voice.lang === 'en-US'
                );
                
                if (preferredVoice) {
                    utterance.voice = preferredVoice;
                }
            }

            // Configure speech parameters
            utterance.rate = options.rate || this.rate;
            utterance.pitch = options.pitch || this.pitch;
            utterance.volume = options.volume || this.volume;

            // Event handlers
            utterance.onend = () => resolve();
            utterance.onerror = (event) => reject(event.error);
            
            // Add natural pauses for conversation flow
            utterance.onboundary = (event) => {
                if (event.name === 'sentence') {
                    // Could add visual indicators here
                }
            };

            this.synthesis.speak(utterance);
        });
    }

    // ===== ELEVENLABS INTEGRATION =====
    setupElevenLabs() {
        this.elevenLabsConfig = {
            apiKey: process.env.ELEVENLABS_API_KEY || 'your-api-key',
            voiceId: 'EXAVITQu4vr4xnSDxMaL', // Bella - conversational
            model: 'eleven_multilingual_v2'
        };
    }

    async speakWithElevenLabs(text, options = {}) {
        try {
            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${this.elevenLabsConfig.voiceId}`, {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': this.elevenLabsConfig.apiKey
                },
                body: JSON.stringify({
                    text: text,
                    model_id: this.elevenLabsConfig.model,
                    voice_settings: {
                        stability: options.stability || 0.5,
                        similarity_boost: options.similarity || 0.5,
                        style: options.style || 0.0,
                        use_speaker_boost: true
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`ElevenLabs API error: ${response.status}`);
            }

            const audioBuffer = await response.arrayBuffer();
            const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
            const audioUrl = URL.createObjectURL(audioBlob);
            
            return this.playAudio(audioUrl);
        } catch (error) {
            console.error('ElevenLabs speech error:', error);
            // Fallback to Web Speech API
            return this.speakWithWebSpeech(text, options);
        }
    }

    // ===== OPENAI REALTIME API =====
    setupOpenAI() {
        this.openAIConfig = {
            apiKey: process.env.OPENAI_API_KEY || 'your-api-key',
            model: 'tts-1',
            voice: 'alloy' // alloy, echo, fable, onyx, nova, shimmer
        };
    }

    async speakWithOpenAI(text, options = {}) {
        try {
            const response = await fetch('https://api.openai.com/v1/audio/speech', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.openAIConfig.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: options.model || this.openAIConfig.model,
                    input: text,
                    voice: options.voice || this.openAIConfig.voice,
                    response_format: 'mp3',
                    speed: options.speed || 1.0
                })
            });

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status}`);
            }

            const audioBuffer = await response.arrayBuffer();
            const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
            const audioUrl = URL.createObjectURL(audioBlob);
            
            return this.playAudio(audioUrl);
        } catch (error) {
            console.error('OpenAI speech error:', error);
            return this.speakWithWebSpeech(text, options);
        }
    }

    // ===== AZURE COGNITIVE SERVICES =====
    setupAzure() {
        this.azureConfig = {
            subscriptionKey: process.env.AZURE_SPEECH_KEY || 'your-key',
            region: process.env.AZURE_SPEECH_REGION || 'eastus',
            voice: 'en-US-JennyMultilingualNeural'
        };
    }

    async speakWithAzure(text, options = {}) {
        try {
            const ssml = `
                <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
                    <voice name="${options.voice || this.azureConfig.voice}">
                        <prosody rate="${options.rate || '0.9'}" pitch="${options.pitch || 'medium'}">
                            ${text}
                        </prosody>
                    </voice>
                </speak>
            `;

            const response = await fetch(`https://${this.azureConfig.region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
                method: 'POST',
                headers: {
                    'Ocp-Apim-Subscription-Key': this.azureConfig.subscriptionKey,
                    'Content-Type': 'application/ssml+xml',
                    'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3'
                },
                body: ssml
            });

            if (!response.ok) {
                throw new Error(`Azure Speech error: ${response.status}`);
            }

            const audioBuffer = await response.arrayBuffer();
            const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
            const audioUrl = URL.createObjectURL(audioBlob);
            
            return this.playAudio(audioUrl);
        } catch (error) {
            console.error('Azure speech error:', error);
            return this.speakWithWebSpeech(text, options);
        }
    }

    // ===== SPEECH RECOGNITION (INPUT) =====
    setupSpeechRecognition() {
        if (this.isNodeJS) {
            console.log('🎤 Speech recognition not available in Node.js environment');
            return false;
        }
        
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';
            
            return true;
        }
        return false;
    }

    startListening(onResult, onError) {
        if (!this.recognition) {
            if (!this.setupSpeechRecognition()) {
                onError('Speech recognition not supported');
                return;
            }
        }

        this.recognition.onresult = (event) => {
            const last = event.results.length - 1;
            const text = event.results[last][0].transcript;
            
            if (event.results[last].isFinal) {
                onResult(text);
            }
        };

        this.recognition.onerror = (event) => {
            onError(event.error);
        };

        this.recognition.start();
    }

    stopListening() {
        if (this.recognition) {
            this.recognition.stop();
        }
    }

    // ===== UTILITY METHODS =====
    async playAudio(audioUrl) {
        return new Promise((resolve, reject) => {
            const audio = new Audio(audioUrl);
            audio.onended = () => {
                URL.revokeObjectURL(audioUrl);
                resolve();
            };
            audio.onerror = (error) => {
                URL.revokeObjectURL(audioUrl);
                reject(error);
            };
            audio.play().catch(reject);
        });
    }

    // Main speak method - automatically uses configured provider
    async speak(text, options = {}) {
        if (this.isNodeJS) {
            // In Node.js, just display the text that would be spoken
            console.log(`🔊 [VOICE]: ${text}`);
            return Promise.resolve();
        }
        
        switch (this.provider) {
            case 'elevenlabs':
                return this.speakWithElevenLabs(text, options);
            case 'openai':
                return this.speakWithOpenAI(text, options);
            case 'azure':
                return this.speakWithAzure(text, options);
            default:
                return this.speakWithWebSpeech(text, options);
        }
    }

    // Get available voices for current provider
    getAvailableVoices() {
        switch (this.provider) {
            case 'webspeech':
                return this.voices ? this.voices.map(v => ({
                    name: v.name,
                    lang: v.lang,
                    gender: v.name.toLowerCase().includes('female') ? 'female' : 'male'
                })) : [];
            case 'elevenlabs':
                return [
                    { name: 'Bella', id: 'EXAVITQu4vr4xnSDxMaL', style: 'conversational' },
                    { name: 'Rachel', id: '21m00Tcm4TlvDq8ikWAM', style: 'calm' },
                    { name: 'Domi', id: 'AZnzlk1XvdvUeBnXmlld', style: 'strong' },
                    { name: 'Elli', id: 'MF3mGyEYCl7XYWbV9V6O', style: 'emotional' }
                ];
            case 'openai':
                return [
                    { name: 'Alloy', id: 'alloy', style: 'neutral' },
                    { name: 'Echo', id: 'echo', style: 'male' },
                    { name: 'Fable', id: 'fable', style: 'british_male' },
                    { name: 'Onyx', id: 'onyx', style: 'deep_male' },
                    { name: 'Nova', id: 'nova', style: 'female' },
                    { name: 'Shimmer', id: 'shimmer', style: 'soft_female' }
                ];
            default:
                return [];
        }
    }

    // Test different voices
    async testVoice(text = "Hello! This is a test of the voice synthesis system.") {
        console.log(`Testing ${this.provider} voice...`);
        try {
            await this.speak(text);
            console.log('Voice test successful!');
        } catch (error) {
            console.error('Voice test failed:', error);
        }
    }
}

// Export for use in main AI script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VoiceIntegration;
}

// Browser usage example
if (typeof window !== 'undefined') {
    window.VoiceIntegration = VoiceIntegration;
} 