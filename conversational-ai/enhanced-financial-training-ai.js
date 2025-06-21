#!/usr/bin/env node

/**
 * Enhanced Financial Services Training AI with Natural Conversation Flow
 * Includes cadence analysis, natural speech patterns, and human-like interactions
 */

const readline = require('readline');
const VoiceIntegration = require('./voice-integration');

class EnhancedFinancialTrainingAI {
    constructor(options = {}) {
        this.mode = options.mode || 'customer';
        this.scenario = options.scenario || 'general';
        this.difficulty = options.difficulty || 'beginner';
        this.voiceEnabled = options.voiceEnabled !== false;
        
        this.conversationState = {
            currentEmotion: 'neutral',
            stressLevel: 'low',
            urgency: 'medium',
            cooperation: 'high',
            understanding: 'medium',
            trustLevel: 'medium',
            energyLevel: 'medium'
        };
        
        this.conversationMetrics = {
            responseTimeMs: [],
            sentimentHistory: [],
            keywordDensity: {},
            interruptionCount: 0,
            escalationSignals: 0
        };
        
        this.naturalSpeechPatterns = {
            fillerWords: ['um', 'uh', 'you know', 'like', 'well', 'I mean'],
            hesitationPauses: [300, 500, 800, 1200], // milliseconds
            breathPauses: [200, 400, 600],
            stutterPatterns: ['w-wait', 'I-I', 'th-that', 'c-can you'],
            emotionalMarkers: {
                frustrated: ['*sigh*', 'oh come on', 'seriously?', 'this is ridiculous'],
                worried: ['oh no', 'oh my god', 'what if', 'I\'m scared'],
                confused: ['wait, what?', 'I don\'t understand', 'huh?', 'can you repeat'],
                relieved: ['thank goodness', 'oh thank you', 'finally', 'that\'s great'],
                angry: ['this is unacceptable', 'I\'m so frustrated', 'what the hell', 'I want a supervisor']
            }
        };
        
        this.setupDatabase();
        this.setupVoiceSystem();
        this.setupInterface();
        this.setupEventHandlers();
    }
    
    setupVoiceSystem() {
        if (this.voiceEnabled) {
            this.voice = new VoiceIntegration({
                provider: 'webspeech',
                rate: 0.85,
                pitch: 1.0,
                volume: 0.8
            });
        }
    }
    
    setupDatabase() {
        // Enhanced customer database with personality profiles
        this.customerDatabase = {
            'frustrated_sarah_1234': {
                accountNumber: '****1234',
                name: 'Sarah Johnson',
                phone: '555-0123',
                email: 'sarah.j@email.com',
                personalityProfile: {
                    baseEmotion: 'frustrated',
                    communicationStyle: 'direct',
                    techSavvy: 'low',
                    patience: 'low',
                    trustInBanks: 'medium',
                    preferredPace: 'fast'
                },
                currentSituation: {
                    stressLevel: 'high',
                    timeConstraints: 'urgent',
                    previousCallHistory: 2,
                    issueComplexity: 'medium'
                },
                accountInfo: {
                    balance: 1247.82,
                    cardStatus: 'active',
                    recentTransactions: [
                        { date: '2025-06-14', amount: -523.99, merchant: 'Unknown Merchant XYZ', flagged: true },
                        { date: '2025-06-13', amount: -45.00, merchant: 'Gas Station', flagged: false }
                    ]
                },
                speechPatterns: {
                    interruptsFrequently: true,
                    speaksQuickly: true,
                    usesSlang: true,
                    stuttersWhenStressed: false,
                    repeatsConcerns: true
                }
            },
            'elderly_robert_5678': {
                accountNumber: '****5678',
                name: 'Robert Martinez',
                phone: '555-0456',
                email: 'r.martinez@email.com',
                personalityProfile: {
                    baseEmotion: 'cautious',
                    communicationStyle: 'polite',
                    techSavvy: 'very_low',
                    patience: 'high',
                    trustInBanks: 'high',
                    preferredPace: 'slow'
                },
                currentSituation: {
                    stressLevel: 'medium',
                    timeConstraints: 'none',
                    previousCallHistory: 0,
                    issueComplexity: 'simple'
                },
                accountInfo: {
                    balance: 8543.21,
                    cardStatus: 'locked',
                    recentTransactions: [
                        { date: '2025-06-12', amount: -89.99, merchant: 'Online Purchase', flagged: true }
                    ]
                },
                speechPatterns: {
                    interruptsFrequently: false,
                    speaksSlowly: true,
                    usesPoliteLanguage: true,
                    stuttersWhenConfused: true,
                    asksForClarification: true,
                    repeatsInformation: true
                }
            },
            'anxious_maria_9012': {
                accountNumber: '****9012',
                name: 'Maria Rodriguez',
                phone: '555-0789',
                email: 'maria.r@email.com',
                personalityProfile: {
                    baseEmotion: 'anxious',
                    communicationStyle: 'apologetic',
                    techSavvy: 'medium',
                    patience: 'medium',
                    trustInBanks: 'low',
                    preferredPace: 'variable'
                },
                currentSituation: {
                    stressLevel: 'very_high',
                    timeConstraints: 'moderate',
                    previousCallHistory: 1,
                    issueComplexity: 'high'
                },
                accountInfo: {
                    balance: 156.43,
                    cardStatus: 'compromised',
                    recentTransactions: [
                        { date: '2025-06-14', amount: -1200.00, merchant: 'Cash Advance ATM', flagged: true },
                        { date: '2025-06-14', amount: -890.50, merchant: 'Electronics Store', flagged: true }
                    ]
                },
                speechPatterns: {
                    interruptsFrequently: false,
                    speaksQuickly: false,
                    usesFillerWords: true,
                    stuttersWhenStressed: true,
                    breathesHeavily: true,
                    repeatsQuestions: true,
                    apologizesOften: true
                }
            }
        };
        
        this.currentCustomer = null;
        this.conversationHistory = [];
        this.responseTimeTracker = [];
    }
    
    setupInterface() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: '\n👤 Representative: '
        });
    }
    
    setupEventHandlers() {
        process.on('SIGINT', () => {
            this.endSession();
        });
        
        this.rl.on('line', async (input) => {
            const startTime = Date.now();
            const userInput = input.trim();
            
            if (userInput.toLowerCase().startsWith('/')) {
                await this.handleCommand(userInput);
            } else if (userInput) {
                await this.processNaturalConversation(userInput, startTime);
            }
            
            this.rl.prompt();
        });
    }
    
    async processNaturalConversation(representativeResponse, startTime) {
        // Analyze representative's response timing and content
        const responseTime = startTime - (this.lastResponseTime || startTime);
        this.responseTimeTracker.push(responseTime);
        this.lastResponseTime = Date.now();
        
        // Analyze conversation cadence and content
        const conversationAnalysis = this.analyzeConversationCadence(representativeResponse, responseTime);
        
        // Update conversation state based on analysis
        this.updateConversationState(conversationAnalysis);
        
        // Log interaction
        this.conversationHistory.push({
            timestamp: new Date(),
            speaker: 'representative',
            message: representativeResponse,
            responseTime: responseTime,
            analysis: conversationAnalysis
        });
        
        // Generate natural customer response with human-like patterns
        const customerResponse = await this.generateNaturalCustomerResponse(representativeResponse, conversationAnalysis);
        
        // Display response with natural timing
        await this.deliverNaturalResponse(customerResponse);
        
        // Update metrics
        this.updateConversationMetrics(representativeResponse, customerResponse);
    }
    
    analyzeConversationCadence(response, responseTime) {
        const analysis = {
            // Timing analysis
            responseSpeed: this.categorizeResponseTime(responseTime),
            
            // Content analysis
            isEmpathetic: /sorry|understand|apologize|concern/i.test(response),
            isDirective: /need to|must|have to|require/i.test(response),
            isQuestionAsking: /\?/.test(response) && response.split('?').length > 1,
            providesInformation: /let me|I can|according to|shows that/i.test(response),
            usesJargon: /verification|authenticate|authorization|compliance/i.test(response),
            
            // Professional markers
            containsGreeting: /hello|hi|good morning|thank you for calling/i.test(response),
            containsClosing: /anything else|help you with|have a great day/i.test(response),
            followsScript: this.detectScriptedLanguage(response),
            
            // Emotional indicators
            showsUrgency: /immediately|right away|urgent|asap/i.test(response),
            showsPatience: /take your time|no rush|whenever you're ready/i.test(response),
            showsConfidence: /I can help|I'll take care|let me handle/i.test(response),
            
            // Technical competence
            explainsProcess: /process|procedure|steps|next we'll/i.test(response),
            usesProperTerminology: this.checkFinancialTerminology(response),
            
            // Length and complexity
            wordCount: response.split(' ').length,
            sentenceCount: response.split(/[.!?]+/).length,
            complexity: this.calculateResponseComplexity(response)
        };
        
        return analysis;
    }
    
    categorizeResponseTime(responseTime) {
        if (responseTime < 2000) return 'very_fast';
        if (responseTime < 5000) return 'fast';
        if (responseTime < 10000) return 'normal';
        if (responseTime < 20000) return 'slow';
        return 'very_slow';
    }
    
    detectScriptedLanguage(response) {
        const scriptedPhrases = [
            'thank you for calling',
            'I\'d be happy to help',
            'for security purposes',
            'I understand your concern',
            'let me look into that',
            'is there anything else'
        ];
        
        return scriptedPhrases.some(phrase => response.toLowerCase().includes(phrase));
    }
    
    checkFinancialTerminology(response) {
        const financialTerms = [
            'dispute', 'chargeback', 'authorization', 'verification', 'fraud',
            'transaction', 'merchant', 'settlement', 'account', 'balance'
        ];
        
        const foundTerms = financialTerms.filter(term => 
            response.toLowerCase().includes(term)
        );
        
        return foundTerms.length;
    }
    
    calculateResponseComplexity(response) {
        const words = response.split(' ');
        const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
        const sentenceLength = words.length;
        
        if (avgWordLength > 6 && sentenceLength > 20) return 'high';
        if (avgWordLength > 4 && sentenceLength > 10) return 'medium';
        return 'low';
    }
    
    updateConversationState(analysis) {
        const customer = this.currentCustomer;
        if (!customer) return;
        
        // Update emotional state based on representative's approach
        if (analysis.isEmpathetic && this.conversationState.currentEmotion !== 'relieved') {
            this.adjustEmotionalState('calmer');
        }
        
        if (analysis.responseSpeed === 'very_slow' && customer.personalityProfile.patience === 'low') {
            this.adjustEmotionalState('more_frustrated');
        }
        
        if (analysis.usesJargon && customer.personalityProfile.techSavvy === 'low') {
            this.adjustEmotionalState('confused');
        }
        
        if (analysis.showsConfidence) {
            this.conversationState.trustLevel = Math.min(10, this.conversationState.trustLevel + 1);
        }
        
        // Update stress level
        if (analysis.showsUrgency) {
            this.conversationState.stressLevel = 'high';
        } else if (analysis.showsPatience) {
            this.conversationState.stressLevel = Math.max(1, this.conversationState.stressLevel - 1);
        }
    }
    
    adjustEmotionalState(direction) {
        const emotions = ['angry', 'frustrated', 'worried', 'cautious', 'neutral', 'hopeful', 'relieved', 'satisfied'];
        const currentIndex = emotions.indexOf(this.conversationState.currentEmotion);
        
        switch (direction) {
            case 'calmer':
                if (currentIndex < emotions.length - 1) {
                    this.conversationState.currentEmotion = emotions[currentIndex + 1];
                }
                break;
            case 'more_frustrated':
                if (currentIndex > 0) {
                    this.conversationState.currentEmotion = emotions[currentIndex - 1];
                }
                break;
            case 'confused':
                this.conversationState.currentEmotion = 'worried';
                break;
        }
    }
    
    async generateNaturalCustomerResponse(representativeResponse, analysis) {
        const customer = this.currentCustomer;
        if (!customer) return "I need help with my account.";
        
        const personality = customer.personalityProfile;
        const speechPatterns = customer.speechPatterns;
        const currentEmotion = this.conversationState.currentEmotion;
        
        // Determine base response content
        let baseResponse = this.generateContextualResponse(representativeResponse, analysis);
        
        // Add natural speech patterns based on personality and emotional state
        const naturalResponse = this.addNaturalSpeechPatterns(baseResponse, {
            personality,
            speechPatterns,
            currentEmotion,
            analysis
        });
        
        return naturalResponse;
    }
    
    generateContextualResponse(repResponse, analysis) {
        const customer = this.currentCustomer;
        const emotion = this.conversationState.currentEmotion;
        
        // Response based on what representative said
        if (analysis.containsGreeting) {
            return this.generateGreetingResponse(emotion);
        } else if (repResponse.toLowerCase().includes('verify') || repResponse.toLowerCase().includes('security')) {
            return this.generateVerificationResponse(emotion);
        } else if (repResponse.toLowerCase().includes('transaction') || repResponse.toLowerCase().includes('charge')) {
            return this.generateTransactionResponse(emotion);
        } else if (analysis.explainsProcess) {
            return this.generateProcessAcknowledgment(emotion);
        } else if (analysis.isQuestionAsking) {
            return this.generateQuestionResponse(emotion);
        } else {
            return this.generateGeneralResponse(emotion);
        }
    }
    
    generateGreetingResponse(emotion) {
        const responses = {
            'angry': "Finally! I've been trying to reach someone for over an hour!",
            'frustrated': "Thank goodness someone answered. I really need help here.",
            'worried': "Oh thank you for taking my call. I'm really concerned about my account.",
            'cautious': "Hello, yes, I need assistance with my banking account please.",
            'neutral': "Hi, thank you for taking my call. I have a question about my account.",
            'hopeful': "Hello! I'm hoping you can help me sort out an issue with my account."
        };
        
        return responses[emotion] || responses['neutral'];
    }
    
    generateVerificationResponse(emotion) {
        const responses = {
            'angry': "Why do I have to go through all this every time? Fine, what do you need?",
            'frustrated': "*sigh* Okay, what information do you need from me?",
            'worried': "Oh, um, yes of course. What do you need to verify?",
            'cautious': "Certainly. I understand you need to verify my identity first.",
            'neutral': "Of course, what verification information do you need?"
        };
        
        return responses[emotion] || responses['neutral'];
    }
    
    generateTransactionResponse(emotion) {
        const transaction = this.currentCustomer.accountInfo.recentTransactions.find(t => t.flagged);
        if (!transaction) return "I'm not sure which transaction you're referring to.";
        
        const responses = {
            'angry': `That ${transaction.merchant} charge for $${Math.abs(transaction.amount)}? I absolutely did NOT make that purchase!`,
            'frustrated': `No, I definitely didn't make that purchase at ${transaction.merchant}. That's why I'm calling.`,
            'worried': `Oh no, that ${transaction.merchant} charge... I was afraid of that. No, I didn't make that purchase.`,
            'cautious': `The ${transaction.merchant} transaction? No, I don't recall making that purchase.`,
            'neutral': `No, I didn't authorize that ${transaction.merchant} transaction for $${Math.abs(transaction.amount)}.`
        };
        
        return responses[emotion] || responses['neutral'];
    }
    
    generateProcessAcknowledgment(emotion) {
        const responses = {
            'angry': "Fine, just get this fixed as quickly as possible.",
            'frustrated': "Okay, I just want this resolved today.",
            'worried': "Oh... okay, um, how long will all of this take?",
            'cautious': "I see. And this process is secure, correct?",
            'neutral': "Alright, I understand. What's the next step?",
            'hopeful': "That sounds good. I appreciate you explaining the process."
        };
        
        return responses[emotion] || responses['neutral'];
    }
    
    generateQuestionResponse(emotion) {
        const responses = {
            'angry': "Look, I just need this fixed. What else do you need to know?",
            'frustrated': "I already told you everything I know about this.",
            'worried': "Um, I'm not sure... can you help me figure that out?",
            'cautious': "Let me think about that for a moment...",
            'neutral': "Good question. Let me consider that."
        };
        
        return responses[emotion] || responses['neutral'];
    }
    
    generateGeneralResponse(emotion) {
        const responses = {
            'angry': "This is ridiculous. I shouldn't have to deal with this.",
            'frustrated': "I just want to get this sorted out.",
            'worried': "I'm really not sure what to do about this situation.",
            'cautious': "I want to make sure we handle this properly.",
            'neutral': "I see. What would you recommend?",
            'hopeful': "That sounds promising. What can we do?"
        };
        
        return responses[emotion] || responses['neutral'];
    }
    
    addNaturalSpeechPatterns(baseResponse, context) {
        const { personality, speechPatterns, currentEmotion, analysis } = context;
        let response = baseResponse;
        
        // Add stuttering if customer is stressed or confused
        if ((speechPatterns.stuttersWhenStressed && currentEmotion === 'worried') ||
            (speechPatterns.stuttersWhenConfused && analysis.usesJargon)) {
            response = this.addStuttering(response);
        }
        
        // Add filler words for anxious customers
        if (speechPatterns.usesFillerWords && (currentEmotion === 'worried' || currentEmotion === 'frustrated')) {
            response = this.addFillerWords(response);
        }
        
        // Add breathing sounds for stressed customers
        if (speechPatterns.breathesHeavily && currentEmotion === 'angry') {
            response = this.addBreathingSounds(response);
        }
        
        // Add interruption patterns for impatient customers
        if (speechPatterns.interruptsFrequently && personality.patience === 'low') {
            response = this.addInterruptionPatterns(response);
        }
        
        // Add repetition for elderly or confused customers
        if (speechPatterns.repeatsInformation || speechPatterns.repeatsQuestions) {
            response = this.addRepetitionPatterns(response);
        }
        
        // Add apologies for apologetic customers
        if (speechPatterns.apologizesOften) {
            response = this.addApologies(response);
        }
        
        // Add emotional markers
        response = this.addEmotionalMarkers(response, currentEmotion);
        
        return response;
    }
    
    addStuttering(response) {
        const words = response.split(' ');
        const stutterChance = 0.3; // 30% chance to stutter
        
        return words.map(word => {
            if (Math.random() < stutterChance && word.length > 2) {
                const firstChar = word.charAt(0).toLowerCase();
                if (['w', 'th', 'c', 'i'].includes(firstChar)) {
                    return `${firstChar}-${word}`;
                }
            }
            return word;
        }).join(' ');
    }
    
    addFillerWords(response) {
        const fillers = this.naturalSpeechPatterns.fillerWords;
        const sentences = response.split('. ');
        
        return sentences.map(sentence => {
            if (Math.random() < 0.4) { // 40% chance to add filler
                const filler = fillers[Math.floor(Math.random() * fillers.length)];
                return `${filler}, ${sentence}`;
            }
            return sentence;
        }).join('. ');
    }
    
    addBreathingSounds(response) {
        const breathingMarkers = ['*takes a deep breath*', '*sighs*', '*exhales*'];
        const marker = breathingMarkers[Math.floor(Math.random() * breathingMarkers.length)];
        
        // Add at the beginning for stressed responses
        return `${marker} ${response}`;
    }
    
    addInterruptionPatterns(response) {
        // Add interruption-style language
        const interruptionStarters = ['Wait, wait,', 'Hold on,', 'But,', 'No, no,'];
        const starter = interruptionStarters[Math.floor(Math.random() * interruptionStarters.length)];
        
        if (Math.random() < 0.3) {
            return `${starter} ${response}`;
        }
        return response;
    }
    
    addRepetitionPatterns(response) {
        // Add some repetition for emphasis or confusion
        if (response.includes('?')) {
            return `${response} I mean, ${response.toLowerCase()}`;
        } else if (Math.random() < 0.2) {
            const words = response.split(' ');
            const lastWord = words[words.length - 1];
            return `${response} ${lastWord}`;
        }
        return response;
    }
    
    addApologies(response) {
        const apologies = ['I\'m sorry,', 'Sorry,', 'I apologize,'];
        const apology = apologies[Math.floor(Math.random() * apologies.length)];
        
        if (Math.random() < 0.3) {
            return `${apology} ${response}`;
        }
        return response;
    }
    
    addEmotionalMarkers(response, emotion) {
        const markers = this.naturalSpeechPatterns.emotionalMarkers[emotion];
        if (!markers || Math.random() > 0.2) return response;
        
        const marker = markers[Math.floor(Math.random() * markers.length)];
        return `${marker}... ${response}`;
    }
    
    async deliverNaturalResponse(response) {
        // Parse response for natural timing markers
        const deliveryPlan = this.parseResponseForTiming(response);
        
        console.log('\n📱 Customer: ', { newline: false });
        
        for (const segment of deliveryPlan) {
            // Add pre-pause if specified
            if (segment.pauseBefore > 0) {
                await this.naturalPause(segment.pauseBefore);
            }
            
            // Type the text with natural rhythm
            await this.typeWithNaturalRhythm(segment.text, segment.emotion);
            
            // Add post-pause if specified
            if (segment.pauseAfter > 0) {
                await this.naturalPause(segment.pauseAfter);
            }
        }
        
        // Speak with voice if enabled
        if (this.voiceEnabled && this.voice) {
            console.log('\n🔊 [Speaking with natural voice patterns...]');
            await this.speakWithNaturalVoice(response);
        }
        
        console.log('\n');
    }
    
    parseResponseForTiming(response) {
        const segments = [];
        const parts = response.split(/(\*[^*]+\*|\.\.\.|\,|\!|\?)/);
        
        let currentEmotion = this.conversationState.currentEmotion;
        
        for (const part of parts) {
            if (!part.trim()) continue;
            
            let pauseBefore = 0;
            let pauseAfter = 0;
            let text = part;
            
            // Handle special markers
            if (part.startsWith('*') && part.endsWith('*')) {
                // Breathing or action marker
                pauseBefore = 500;
                pauseAfter = 300;
                text = ''; // Don't type the marker
            } else if (part === '...') {
                // Hesitation
                pauseBefore = 800;
                text = '...';
                pauseAfter = 1200;
            } else if (part === ',') {
                pauseAfter = 400;
            } else if (part === '.' || part === '!' || part === '?') {
                pauseAfter = 600;
            }
            
            // Adjust timing based on emotional state
            if (currentEmotion === 'angry') {
                pauseAfter = Math.max(200, pauseAfter - 200); // Faster, more abrupt
            } else if (currentEmotion === 'worried') {
                pauseBefore += 200; // More hesitation
                pauseAfter += 300;
            }
            
            segments.push({
                text: text,
                pauseBefore: pauseBefore,
                pauseAfter: pauseAfter,
                emotion: currentEmotion
            });
        }
        
        return segments;
    }
    
    async typeWithNaturalRhythm(text, emotion) {
        if (!text) return;
        
        const baseDelay = this.getBaseTypingDelay(emotion);
        
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            process.stdout.write(char);
            
            let delay = baseDelay;
            
            // Adjust delay based on character
            if (char === ' ') {
                delay = baseDelay * 0.3;
            } else if (char.match(/[.!?]/)) {
                delay = baseDelay * 3;
            } else if (char === ',') {
                delay = baseDelay * 2;
            } else if (char === '-') {
                delay = baseDelay * 1.5; // Stuttering
            }
            
            // Add slight randomness for natural feel
            delay += (Math.random() - 0.5) * baseDelay * 0.3;
            
            await this.naturalPause(Math.max(10, delay));
        }
    }
    
    getBaseTypingDelay(emotion) {
        const delays = {
            'angry': 30,        // Fast, aggressive typing
            'frustrated': 35,   // Slightly faster
            'worried': 60,      // Slower, more hesitant
            'cautious': 50,     // Measured pace
            'neutral': 40,      // Normal pace
            'hopeful': 35,      // Slightly eager
            'relieved': 30      // More relaxed
        };
        
        return delays[emotion] || 40;
    }
    
    async speakWithNaturalVoice(text) {
        if (!this.voice) return;
        
        try {
            // Clean text for speech (remove markers)
            const cleanText = text.replace(/\*[^*]+\*/g, '').replace(/\.\.\./g, '');
            
            // Adjust voice parameters based on emotion
            const voiceSettings = this.getVoiceSettings(this.conversationState.currentEmotion);
            
            await this.voice.speak(cleanText, voiceSettings);
        } catch (error) {
            console.log('Voice synthesis error:', error.message);
        }
    }
    
    getVoiceSettings(emotion) {
        const settings = {
            'angry': { rate: 1.1, pitch: 1.1, volume: 0.9 },
            'frustrated': { rate: 1.0, pitch: 1.0, volume: 0.8 },
            'worried': { rate: 0.8, pitch: 0.9, volume: 0.7 },
            'cautious': { rate: 0.85, pitch: 0.95, volume: 0.8 },
            'neutral': { rate: 0.9, pitch: 1.0, volume: 0.8 },
            'hopeful': { rate: 0.95, pitch: 1.05, volume: 0.8 },
            'relieved': { rate: 0.9, pitch: 1.0, volume: 0.8 }
        };
        
        return settings[emotion] || settings['neutral'];
    }
    
    async naturalPause(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    updateConversationMetrics(repResponse, customerResponse) {
        // Track keywords
        const words = customerResponse.toLowerCase().split(' ');
        words.forEach(word => {
            this.conversationMetrics.keywordDensity[word] = (this.conversationMetrics.keywordDensity[word] || 0) + 1;
        });
        
        // Track sentiment
        this.conversationMetrics.sentimentHistory.push(this.conversationState.currentEmotion);
        
        // Track escalation signals
        if (['angry', 'frustrated'].includes(this.conversationState.currentEmotion)) {
            this.conversationMetrics.escalationSignals++;
        }
    }
    
    // Command handlers and other methods...
    async handleCommand(command) {
        const [cmd, ...args] = command.toLowerCase().split(' ');
        
        switch (cmd) {
            case '/customer':
                if (args[0]) {
                    this.selectCustomer(args[0]);
                } else {
                    this.showCustomerOptions();
                }
                break;
            case '/emotion':
                if (args[0]) {
                    this.setCustomerEmotion(args[0]);
                } else {
                    this.showCurrentEmotion();
                }
                break;
            case '/analysis':
                this.showConversationAnalysis();
                break;
            case '/voice':
                if (args[0] === 'on') {
                    this.voiceEnabled = true;
                    console.log('🔊 Voice enabled');
                } else if (args[0] === 'off') {
                    this.voiceEnabled = false;
                    console.log('🔇 Voice disabled');
                } else {
                    console.log(`Voice is currently ${this.voiceEnabled ? 'enabled' : 'disabled'}`);
                }
                break;
            case '/help':
                this.showHelp();
                break;
            case '/quit':
                this.endSession();
                break;
            default:
                console.log('❌ Unknown command. Type /help for available commands.');
        }
    }
    
    async start() {
        console.clear();
        console.log('🏦 Enhanced Financial Services Training AI');
        console.log('═══════════════════════════════════════════');
        console.log('🎭 Natural Conversation with Human-like Patterns');
        console.log('🗣️  Voice synthesis with emotional cadence');
        console.log('🧠 Advanced conversation analysis and adaptation');
        console.log('');
        console.log('💡 Commands: /customer [id], /emotion [state], /help, /quit');
        console.log('');
        
        this.showCustomerOptions();
        this.rl.prompt();
    }
    
    showCustomerOptions() {
        console.log('👥 Available Customer Personalities:');
        console.log('');
        
        Object.entries(this.customerDatabase).forEach(([id, customer]) => {
            const emotion = customer.personalityProfile.baseEmotion;
            const icon = this.getEmotionIcon(emotion);
            console.log(`${icon} ${id} - ${customer.name} (${emotion}, ${customer.personalityProfile.communicationStyle})`);
            console.log(`   Tech Savvy: ${customer.personalityProfile.techSavvy}, Patience: ${customer.personalityProfile.patience}`);
            console.log('');
        });
    }
    
    getEmotionIcon(emotion) {
        const icons = {
            'frustrated': '😤',
            'cautious': '🤔',
            'anxious': '😰',
            'angry': '😡',
            'worried': '😟',
            'neutral': '😐',
            'hopeful': '🙂',
            'relieved': '😌'
        };
        return icons[emotion] || '😐';
    }
    
    selectCustomer(customerId) {
        if (this.customerDatabase[customerId]) {
            this.currentCustomer = this.customerDatabase[customerId];
            this.conversationState.currentEmotion = this.currentCustomer.personalityProfile.baseEmotion;
            console.log(`✅ Selected customer: ${this.currentCustomer.name}`);
            console.log(`   Personality: ${this.currentCustomer.personalityProfile.baseEmotion}, ${this.currentCustomer.personalityProfile.communicationStyle}`);
        } else {
            console.log('❌ Customer not found');
        }
    }
    
    setCustomerEmotion(emotion) {
        const validEmotions = ['angry', 'frustrated', 'worried', 'cautious', 'neutral', 'hopeful', 'relieved'];
        if (validEmotions.includes(emotion)) {
            this.conversationState.currentEmotion = emotion;
            console.log(`✅ Customer emotion set to: ${emotion} ${this.getEmotionIcon(emotion)}`);
        } else {
            console.log(`❌ Invalid emotion. Valid options: ${validEmotions.join(', ')}`);
        }
    }
    
    showCurrentEmotion() {
        const emotion = this.conversationState.currentEmotion;
        console.log(`\n📊 Current Customer State:`);
        console.log(`   Emotion: ${emotion} ${this.getEmotionIcon(emotion)}`);
        console.log(`   Stress Level: ${this.conversationState.stressLevel}`);
        console.log(`   Trust Level: ${this.conversationState.trustLevel}/10`);
        console.log(`   Cooperation: ${this.conversationState.cooperation}`);
    }
    
    showConversationAnalysis() {
        console.log('\n📈 Conversation Analysis');
        console.log('════════════════════════');
        console.log(`Total Interactions: ${this.conversationHistory.length}`);
        console.log(`Avg Response Time: ${Math.round(this.responseTimeTracker.reduce((a, b) => a + b, 0) / this.responseTimeTracker.length)}ms`);
        console.log(`Emotion Progression: ${this.conversationMetrics.sentimentHistory.join(' → ')}`);
        console.log(`Escalation Signals: ${this.conversationMetrics.escalationSignals}`);
        console.log('');
        
        // Show top keywords
        const topKeywords = Object.entries(this.conversationMetrics.keywordDensity)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);
        
        console.log('🔤 Top Customer Keywords:');
        topKeywords.forEach(([word, count]) => {
            console.log(`   ${word}: ${count}`);
        });
        console.log('');
    }
    
    showHelp() {
        console.log('\n📖 Enhanced Financial Training AI Help');
        console.log('═════════════════════════════════════════');
        console.log('🎭 Customer Management:');
        console.log('   /customer [id]       - Select customer personality');
        console.log('   /emotion [state]     - Change customer emotional state');
        console.log('   /customer            - Show available customers');
        console.log('');
        console.log('🎯 Scenario Control:');
        console.log('   /start [scenario]    - Begin training scenario');
        console.log('   /start               - List available scenarios');
        console.log('');
        console.log('🔊 Voice & Analysis:');
        console.log('   /voice on/off        - Toggle voice synthesis');
        console.log('   /analysis            - Show conversation metrics');
        console.log('   /emotion             - Show current customer state');
        console.log('');
        console.log('💡 Tips for Natural Conversations:');
        console.log('   • Pay attention to customer emotional cues');
        console.log('   • Adjust your pace based on customer responses');
        console.log('   • Notice speech patterns (stuttering, hesitation)');
        console.log('   • Respond appropriately to emotional state changes');
        console.log('');
    }
    
    endSession() {
        if (this.conversationHistory.length > 0) {
            this.showConversationAnalysis();
        }
        
        console.log('\n🎓 Training Session Complete');
        console.log('Thank you for using the Enhanced Financial Services Training AI!');
        process.exit(0);
    }
}

// Main execution
if (require.main === module) {
    const args = process.argv.slice(2);
    const mode = args[0] || 'customer';
    const scenario = args[1] || 'general';
    
    console.log('🚀 Starting Enhanced Financial Training AI...');
    
    const trainingAI = new EnhancedFinancialTrainingAI({
        mode: mode,
        scenario: scenario,
        voiceEnabled: true
    });
    
    trainingAI.start().catch(error => {
        console.error('❌ Failed to start training system:', error);
        process.exit(1);
    });
}

module.exports = EnhancedFinancialTrainingAI; 