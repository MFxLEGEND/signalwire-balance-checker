#!/usr/bin/env node

/**
 * Conversational AI with Natural Pauses and Cadence
 * Usage: node conversational-ai-script.js YOUR_OPENAI_API_KEY [pace]
 * Pace options: slow, normal, fast
 */

const readline = require('readline');

class ConversationalTimingEngine {
    constructor(pace = 'normal') {
        this.config = this.getTimingConfig(pace);
        this.isActive = true;
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

    async addThinkingPause() {
        if (!this.isActive) return;
        
        process.stdout.write('\n🤔 Thinking');
        
        const thinkingDots = setInterval(() => {
            process.stdout.write('.');
        }, 500);
        
        await this.sleep(this.config.thinkingPauseMs);
        
        clearInterval(thinkingDots);
        process.stdout.write('\r' + ' '.repeat(20) + '\r');
    }

    async typeWithNaturalTiming(text) {
        const chunks = this.analyzeTextForPauses(text);
        
        for (const chunk of chunks) {
            if (!this.isActive) break;
            
            await this.typeText(chunk.text);
            
            if (chunk.pauseAfterMs > 0) {
                await this.sleep(chunk.pauseAfterMs);
            }
        }
    }

    async typeText(text) {
        for (const char of text) {
            if (!this.isActive) break;
            process.stdout.write(char);
            
            if (char === ' ') {
                await this.sleep(this.config.typingDelayMs * 0.5);
            } else if (char.match(/[.!?]/)) {
                await this.sleep(this.config.typingDelayMs * 2);
            } else {
                await this.sleep(this.config.typingDelayMs);
            }
        }
    }

    analyzeTextForPauses(text) {
        const chunks = [];
        const sentences = text.split(/(?<=[.!?])\s+/);
        
        for (const sentence of sentences) {
            if (!sentence.trim()) continue;
            
            const words = sentence.split(' ');
            let currentChunk = '';
            
            for (let j = 0; j < words.length; j++) {
                const word = words[j];
                currentChunk += (currentChunk ? ' ' : '') + word;
                
                if (this.isBreathingPoint(word, j, words.length)) {
                    chunks.push({
                        text: currentChunk,
                        pauseAfterMs: this.config.breathPauseMs
                    });
                    currentChunk = '';
                }
            }
            
            if (currentChunk) {
                chunks.push({
                    text: currentChunk,
                    pauseAfterMs: this.config.sentencePauseMs
                });
            }
        }
        
        return chunks;
    }

    isBreathingPoint(word, index, totalWords) {
        const breathingWords = ['and', 'but', 'or', 'so', 'because', 'however'];
        const endsWithComma = word.endsWith(',');
        const isBreathingWord = breathingWords.includes(word.toLowerCase().replace(/[,.!?]/, ''));
        const isLongClause = index > 0 && index % 8 === 0;
        
        return endsWithComma || isBreathingWord || isLongClause;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    setActive(active) {
        this.isActive = active;
    }
}

class ConversationalAI {
    constructor(apiKey, options = {}) {
        this.apiKey = apiKey;
        this.timingEngine = new ConversationalTimingEngine(options.pace || 'normal');
        this.conversationHistory = [];
        this.isActive = true;
        
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: '\n🎙️  You: '
        });
        
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        process.on('SIGINT', () => {
            console.log('\n\n👋 Goodbye! Conversation ended.');
            this.stop();
        });

        this.rl.on('line', async (input) => {
            const userInput = input.trim();
            
            if (userInput.toLowerCase() === '/quit') {
                console.log('\n👋 Goodbye!');
                this.stop();
                return;
            }
            
            if (userInput.toLowerCase() === '/pause') {
                this.pause();
                this.rl.prompt();
                return;
            }
            
            if (userInput.toLowerCase() === '/resume') {
                this.resume();
                this.rl.prompt();
                return;
            }
            
            if (userInput) {
                await this.processUserInput(userInput);
            }
            
            this.rl.prompt();
        });
    }

    async start() {
        console.log('\n🤖 Conversational AI with Natural Cadence');
        console.log('═══════════════════════════════════════════');
        console.log('Commands: /pause, /resume, /quit');
        
        await this.timingEngine.addThinkingPause();
        
        process.stdout.write('🤖 AI: ');
        await this.timingEngine.typeWithNaturalTiming(
            "Hello! I'm your conversational AI assistant with natural timing. " +
            "What would you like to talk about?"
        );
        
        console.log('\n');
        this.rl.prompt();
    }

    async processUserInput(userInput) {
        if (!this.isActive) return;
        
        try {
            this.conversationHistory.push({ role: 'user', content: userInput });
            
            await this.timingEngine.addThinkingPause();
            
            const aiResponse = await this.getAIResponse(userInput);
            
            this.conversationHistory.push({ role: 'assistant', content: aiResponse });
            
            process.stdout.write('🤖 AI: ');
            await this.timingEngine.typeWithNaturalTiming(aiResponse);
            console.log('\n');
            
        } catch (error) {
            console.error('\n❌ Error:', error.message);
        }
    }

    async getAIResponse(userInput) {
        // Demo responses - replace with actual OpenAI API call
        const responses = [
            "That's a fascinating question! Let me think about this carefully.",
            "I see what you're getting at. This is definitely worth exploring further.",
            "Great point! That's exactly the kind of detail that matters in programming.",
            "Interesting approach! Have you considered the edge cases with this solution?"
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    pause() {
        this.isActive = false;
        this.timingEngine.setActive(false);
        console.log('\n⏸️  Conversation paused. Type /resume to continue.');
    }

    resume() {
        this.isActive = true;
        this.timingEngine.setActive(true);
        console.log('\n▶️  Conversation resumed!');
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
    const apiKey = args[0] || process.env.OPENAI_API_KEY || 'demo-mode';
    
    const options = {
        pace: args[1] || 'normal'
    };
    
    const ai = new ConversationalAI(apiKey, options);
    ai.start();
}

module.exports = { ConversationalAI, ConversationalTimingEngine }; 