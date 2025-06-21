/**
 * Natural Speech Patterns Module
 * Handles natural conversation flow, timing, and human-like speech generation
 */

class NaturalSpeechPatterns {
    constructor() {
        this.fillerWords = ['um', 'uh', 'you know', 'like', 'well', 'I mean'];
        this.hesitationPauses = [300, 500, 800, 1200]; // milliseconds
        this.breathPauses = [200, 400, 600];
        this.stutterPatterns = ['w-wait', 'I-I', 'th-that', 'c-can you'];
        
        this.emotionalMarkers = {
            frustrated: ['*sigh*', 'oh come on', 'seriously?', 'this is ridiculous'],
            worried: ['oh no', 'oh my god', 'what if', 'I\'m scared'],
            confused: ['wait, what?', 'I don\'t understand', 'huh?', 'can you repeat'],
            relieved: ['thank goodness', 'oh thank you', 'finally', 'that\'s great'],
            angry: ['this is unacceptable', 'I\'m so frustrated', 'what the hell', 'I want a supervisor']
        };
        
        this.contextualResponses = {
            greeting: {
                'angry': "Finally! I've been trying to reach someone for over an hour!",
                'frustrated': "Thank goodness someone answered. I really need help here.",
                'worried': "Oh thank you for taking my call. I'm really concerned about my account.",
                'cautious': "Hello, yes, I need assistance with my banking account please.",
                'neutral': "Hi, thank you for taking my call. I have a question about my account.",
                'hopeful': "Hello! I'm hoping you can help me sort out an issue with my account."
            },
            verification: {
                'angry': "Why do I have to go through all this every time? Fine, what do you need?",
                'frustrated': "*sigh* Okay, what information do you need from me?",
                'worried': "Oh, um, yes of course. What do you need to verify?",
                'cautious': "Certainly. I understand you need to verify my identity first.",
                'neutral': "Of course, what verification information do you need?"
            },
            transaction: {
                'angry': "I absolutely did NOT make that purchase!",
                'frustrated': "No, I definitely didn't make that purchase. That's why I'm calling.",
                'worried': "Oh no... I was afraid of that. No, I didn't make that purchase.",
                'cautious': "No, I don't recall making that purchase.",
                'neutral': "No, I didn't authorize that transaction."
            },
            process_acknowledgment: {
                'angry': "Fine, just get this fixed as quickly as possible.",
                'frustrated': "Okay, I just want this resolved today.",
                'worried': "Oh... okay, um, how long will all of this take?",
                'cautious': "I see. And this process is secure, correct?",
                'neutral': "Alright, I understand. What's the next step?",
                'hopeful': "That sounds good. I appreciate you explaining the process."
            }
        };
    }

    generateNaturalCustomerResponse(representativeResponse, analysis, customerProfile, conversationState) {
        const personality = customerProfile.personalityProfile;
        const speechPatterns = customerProfile.speechPatterns;
        const currentEmotion = conversationState.currentEmotion;
        
        // Determine base response content
        let baseResponse = this.generateContextualResponse(representativeResponse, analysis, currentEmotion, customerProfile);
        
        // Add natural speech patterns based on personality and emotional state
        const naturalResponse = this.addNaturalSpeechPatterns(baseResponse, {
            personality,
            speechPatterns,
            currentEmotion,
            analysis
        });
        
        return naturalResponse;
    }

    generateContextualResponse(repResponse, analysis, emotion, customer) {
        // Response based on what representative said
        if (analysis.containsGreeting) {
            return this.contextualResponses.greeting[emotion] || this.contextualResponses.greeting['neutral'];
        } else if (repResponse.toLowerCase().includes('verify') || repResponse.toLowerCase().includes('security')) {
            return this.contextualResponses.verification[emotion] || this.contextualResponses.verification['neutral'];
        } else if (repResponse.toLowerCase().includes('transaction') || repResponse.toLowerCase().includes('charge')) {
            return this.generateTransactionResponse(emotion, customer);
        } else if (analysis.explainsProcess) {
            return this.contextualResponses.process_acknowledgment[emotion] || this.contextualResponses.process_acknowledgment['neutral'];
        } else if (analysis.isQuestionAsking) {
            return this.generateQuestionResponse(emotion);
        } else {
            return this.generateGeneralResponse(emotion);
        }
    }

    generateTransactionResponse(emotion, customer) {
        const transaction = customer.accountInfo.recentTransactions.find(t => t.flagged);
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
        const sentences = response.split('. ');
        
        return sentences.map(sentence => {
            if (Math.random() < 0.4) { // 40% chance to add filler
                const filler = this.fillerWords[Math.floor(Math.random() * this.fillerWords.length)];
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
        const markers = this.emotionalMarkers[emotion];
        if (!markers || Math.random() > 0.2) return response;
        
        const marker = markers[Math.floor(Math.random() * markers.length)];
        return `${marker}... ${response}`;
    }

    parseResponseForTiming(response, emotion) {
        const segments = [];
        const parts = response.split(/(\*[^*]+\*|\.\.\.|\,|\!|\?)/);
        
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
            if (emotion === 'angry') {
                pauseAfter = Math.max(200, pauseAfter - 200); // Faster, more abrupt
            } else if (emotion === 'worried') {
                pauseBefore += 200; // More hesitation
                pauseAfter += 300;
            }
            
            segments.push({
                text: text,
                pauseBefore: pauseBefore,
                pauseAfter: pauseAfter,
                emotion: emotion
            });
        }
        
        return segments;
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

    async deliverNaturalResponse(response, emotion, voiceSystem = null) {
        // Parse response for natural timing markers
        const deliveryPlan = this.parseResponseForTiming(response, emotion);
        
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
        if (voiceSystem) {
            console.log('\n🔊 [Speaking with natural voice patterns...]');
            await this.speakWithNaturalVoice(response, emotion, voiceSystem);
        }
        
        console.log('\n');
    }

    async speakWithNaturalVoice(text, emotion, voiceSystem) {
        if (!voiceSystem) return;
        
        try {
            // Clean text for speech (remove markers)
            const cleanText = text.replace(/\*[^*]+\*/g, '').replace(/\.\.\./g, '');
            
            // Adjust voice parameters based on emotion
            const voiceSettings = this.getVoiceSettings(emotion);
            
            await voiceSystem.speak(cleanText, voiceSettings);
        } catch (error) {
            console.log('Voice synthesis error:', error.message);
        }
    }
}

module.exports = NaturalSpeechPatterns; 