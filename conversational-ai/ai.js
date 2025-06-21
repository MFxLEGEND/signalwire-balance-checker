#!/usr/bin/env node

/**
 * Conversational AI with Natural Timing and Pauses
 * Perfect for integration with Cursor IDE
 */

const readline = require('readline');

class NaturalConversationAI {
    constructor(pace = 'normal') {
        this.pace = pace;
        this.config = this.getTimingConfig(pace);
        this.isActive = true;
        this.conversationHistory = [];
        
        // Create readline interface
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: '\n💬 You: '
        });
        
        this.setupEventHandlers();
    }
    
    getTimingConfig(pace) {
        const configs = {
            slow: {
                thinkingPauseMs: 3000,      // 3 seconds to think
                breathPauseMs: 1000,        // 1 second breathing pause
                sentencePauseMs: 1500,      // 1.5 seconds between sentences
                typingDelayMs: 80,          // 80ms per character
                emphasisPauseMs: 2000       // 2 seconds for emphasis
            },
            normal: {
                thinkingPauseMs: 1500,      // 1.5 seconds to think
                breathPauseMs: 500,         // 0.5 second breathing pause
                sentencePauseMs: 800,       // 0.8 seconds between sentences
                typingDelayMs: 40,          // 40ms per character
                emphasisPauseMs: 1000       // 1 second for emphasis
            },
            fast: {
                thinkingPauseMs: 800,       // 0.8 seconds to think
                breathPauseMs: 250,         // 0.25 second breathing pause
                sentencePauseMs: 400,       // 0.4 seconds between sentences
                typingDelayMs: 20,          // 20ms per character
                emphasisPauseMs: 500        // 0.5 seconds for emphasis
            }
        };
        
        return configs[pace] || configs.normal;
    }
    
    setupEventHandlers() {
        // Handle Ctrl+C gracefully
        process.on('SIGINT', () => {
            console.log('\n\n👋 Thanks for the conversation! Goodbye!');
            this.stop();
        });
        
        // Handle user input
        this.rl.on('line', async (input) => {
            const userInput = input.trim();
            
            // Handle commands
            if (userInput.toLowerCase() === '/quit' || userInput.toLowerCase() === '/exit') {
                console.log('\n👋 Goodbye!');
                this.stop();
                return;
            }
            
            if (userInput.toLowerCase() === '/help') {
                this.showHelp();
                this.rl.prompt();
                return;
            }
            
            if (userInput.toLowerCase().startsWith('/pace ')) {
                const newPace = userInput.substring(6).trim();
                this.changePace(newPace);
                this.rl.prompt();
                return;
            }
            
            if (userInput.toLowerCase() === '/status') {
                this.showStatus();
                this.rl.prompt();
                return;
            }
            
            // Process conversation
            if (userInput) {
                await this.processConversation(userInput);
            }
            
            this.rl.prompt();
        });
    }
    
    async start() {
        console.clear();
        console.log('🤖 Conversational AI with Natural Timing & Cadence');
        console.log('═══════════════════════════════════════════════════');
        console.log('✨ Features: Natural pauses, thinking time, breathing rhythm');
        console.log('🎭 Current pace:', this.pace.toUpperCase());
        console.log('');
        console.log('💡 Commands: /help, /pace [slow|normal|fast], /status, /quit');
        console.log('');
        
        // Initial AI greeting with natural timing
        await this.showThinkingIndicator();
        
        process.stdout.write('🤖 AI: ');
        await this.speakWithNaturalTiming(
            "Hello! I'm your conversational AI assistant with natural timing and cadence. " +
            "I'll pause to think before responding, breathe naturally during explanations, " +
            "and maintain a human-like conversation flow. " +
            "What would you like to discuss about your code or programming today?"
        );
        
        console.log('\n');
        this.rl.prompt();
    }
    
    async processConversation(userInput) {
        if (!this.isActive) return;
        
        try {
            // Add to conversation history
            this.conversationHistory.push({
                role: 'user',
                content: userInput,
                timestamp: new Date()
            });
            
            // Show thinking process
            await this.showThinkingIndicator();
            
            // Generate AI response
            const aiResponse = await this.generateResponse(userInput);
            
            // Add AI response to history
            this.conversationHistory.push({
                role: 'assistant',
                content: aiResponse,
                timestamp: new Date()
            });
            
            // Speak the response with natural timing
            process.stdout.write('🤖 AI: ');
            await this.speakWithNaturalTiming(aiResponse);
            console.log('\n');
            
        } catch (error) {
            console.error('\n❌ Error in conversation:', error.message);
        }
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
        
        // Thinking pause duration
        await this.sleep(this.config.thinkingPauseMs);
        
        clearInterval(thinkingInterval);
        process.stdout.write('\r' + ' '.repeat(30) + '\r');
    }
    
    async speakWithNaturalTiming(text) {
        const speechChunks = this.analyzeTextForNaturalPauses(text);
        
        for (const chunk of speechChunks) {
            if (!this.isActive) break;
            
            // Type the text chunk with natural rhythm
            await this.typeWithRhythm(chunk.text);
            
            // Add the natural pause after this chunk
            if (chunk.pauseAfterMs > 0) {
                await this.sleep(chunk.pauseAfterMs);
            }
        }
    }
    
    async typeWithRhythm(text) {
        for (let i = 0; i < text.length; i++) {
            if (!this.isActive) break;
            
            const char = text[i];
            process.stdout.write(char);
            
            // Natural typing rhythm with variations
            let delay = this.config.typingDelayMs;
            
            if (char === ' ') {
                delay = this.config.typingDelayMs * 0.3; // Faster spaces
            } else if (char.match(/[.!?]/)) {
                delay = this.config.typingDelayMs * 3; // Slower at sentence ends
            } else if (char === ',') {
                delay = this.config.typingDelayMs * 2; // Pause at commas
            } else if (char === '\n') {
                delay = this.config.typingDelayMs * 5; // Longer at line breaks
            }
            
            await this.sleep(delay);
        }
    }
    
    analyzeTextForNaturalPauses(text) {
        const chunks = [];
        const sentences = text.split(/(?<=[.!?])\s+/);
        
        for (let i = 0; i < sentences.length; i++) {
            const sentence = sentences[i].trim();
            if (!sentence) continue;
            
            // Break long sentences into breathing chunks
            const words = sentence.split(' ');
            let currentChunk = '';
            
            for (let j = 0; j < words.length; j++) {
                const word = words[j];
                currentChunk += (currentChunk ? ' ' : '') + word;
                
                // Check for natural breathing points
                if (this.isNaturalBreathingPoint(word, j, words.length)) {
                    chunks.push({
                        text: currentChunk,
                        pauseAfterMs: this.config.breathPauseMs
                    });
                    currentChunk = '';
                }
            }
            
            // Add remaining text with sentence pause
            if (currentChunk) {
                let pauseMs = this.config.sentencePauseMs;
                
                // Adjust pause based on punctuation and context
                if (sentence.endsWith('?') || sentence.endsWith('!')) {
                    pauseMs = this.config.emphasisPauseMs;
                }
                
                // Longer pause before new topics or important points
                if (this.isTopicTransition(sentence)) {
                    pauseMs = this.config.emphasisPauseMs * 1.5;
                }
                
                chunks.push({
                    text: currentChunk,
                    pauseAfterMs: pauseMs
                });
            }
        }
        
        return chunks;
    }
    
    isNaturalBreathingPoint(word, index, totalWords) {
        // Words that naturally create breathing pauses
        const breathingWords = [
            'and', 'but', 'or', 'so', 'because', 'however', 'therefore',
            'meanwhile', 'additionally', 'furthermore', 'moreover', 'nevertheless'
        ];
        
        const cleanWord = word.toLowerCase().replace(/[,.!?;:]/, '');
        const endsWithComma = word.endsWith(',');
        const isBreathingWord = breathingWords.includes(cleanWord);
        const isLongClause = index > 0 && index % 8 === 0; // Every 8 words
        
        return endsWithComma || isBreathingWord || isLongClause;
    }
    
    isTopicTransition(sentence) {
        const transitionWords = [
            'So', 'Now', 'Next', 'Then', 'However', 'Additionally',
            'Furthermore', 'Meanwhile', 'On the other hand', 'In contrast',
            'For example', 'Let me explain', 'Here\'s the thing'
        ];
        
        return transitionWords.some(word => sentence.startsWith(word));
    }
    
    async generateResponse(userInput) {
        // Analyze input for context
        const isCodeRelated = this.isCodeRelated(userInput);
        const isQuestion = userInput.includes('?');
        const isDebugging = this.isDebuggingQuery(userInput);
        
        if (isDebugging) {
            return this.generateDebuggingResponse(userInput);
        } else if (isCodeRelated) {
            return this.generateCodeResponse(userInput);
        } else if (isQuestion) {
            return this.generateQuestionResponse(userInput);
        } else {
            return this.generateGeneralResponse(userInput);
        }
    }
    
    isCodeRelated(input) {
        const codeKeywords = [
            'function', 'variable', 'class', 'method', 'array', 'object',
            'loop', 'if', 'else', 'return', 'import', 'export', 'async',
            'await', 'promise', 'callback', 'api', 'database', 'query',
            'algorithm', 'data structure', 'recursion', 'iteration'
        ];
        
        return codeKeywords.some(keyword => 
            input.toLowerCase().includes(keyword)
        );
    }
    
    isDebuggingQuery(input) {
        const debugKeywords = [
            'error', 'bug', 'issue', 'problem', 'not working', 'broken',
            'exception', 'crash', 'fail', 'debug', 'trace', 'stack trace'
        ];
        
        return debugKeywords.some(keyword =>
            input.toLowerCase().includes(keyword)
        );
    }
    
    generateDebuggingResponse(input) {
        const responses = [
            "I see you're dealing with a debugging challenge... Let me think through this systematically. " +
            "When I encounter errors like this, I usually start by checking the most common culprits. " +
            "Can you share the specific error message you're seeing? That'll help me pinpoint what's going wrong.",
            
            "Ah, debugging time! This is where we put on our detective hats... " +
            "The key to effective debugging is being methodical and patient. " +
            "First, let's isolate the problem. Where exactly does the issue occur? " +
            "Is it consistent or intermittent?",
            
            "Debugging can be frustrating, but it's also a great learning opportunity... " +
            "I find that walking through the code step by step often reveals the issue. " +
            "Have you tried using console.log statements or a debugger to trace the execution flow?",
            
            "Let's tackle this bug together! In my experience, most bugs fall into a few categories... " +
            "Could this be a logic error, a syntax issue, or maybe a problem with data types? " +
            "Sometimes the solution is simpler than we initially think."
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    generateCodeResponse(input) {
        const responses = [
            "That's a great programming question! Let me break this down for you... " +
            "When working with code like this, I always consider both the immediate solution and the long-term maintainability. " +
            "The approach I'd recommend depends on your specific use case. What are you trying to achieve?",
            
            "Interesting coding challenge! This reminds me of a pattern I've seen many times... " +
            "The elegant solution here involves thinking about the problem from a different angle. " +
            "Let me walk you through the key concepts step by step.",
            
            "Good question about programming! This is actually a fundamental concept that's worth understanding deeply... " +
            "I think the best way to explain this is with a practical example. " +
            "Have you worked with similar patterns before, or should we start with the basics?",
            
            "Ah, this touches on some important programming principles... " +
            "The key thing to remember is that clean, readable code is often more valuable than clever code. " +
            "Let me explain the most straightforward approach first, then we can explore optimizations."
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    generateQuestionResponse(input) {
        const responses = [
            "That's a thoughtful question! Let me consider this carefully... " +
            "There are actually several ways to approach this topic, and each has its merits. " +
            "What specific aspect are you most curious about?",
            
            "Great question! This is something I find quite interesting to discuss... " +
            "The answer depends on several factors, but I can give you a comprehensive overview. " +
            "Are you looking for a theoretical explanation or practical guidance?",
            
            "Excellent question! You've touched on something that's worth exploring in detail... " +
            "I think the most helpful approach is to break this down into smaller, manageable pieces. " +
            "Let me start with the fundamentals and build up from there.",
            
            "That's exactly the kind of question that leads to deeper understanding... " +
            "I appreciate that you're thinking critically about this topic. " +
            "The answer involves several interconnected concepts. Shall we dive in?"
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    generateGeneralResponse(input) {
        const responses = [
            "I find that topic quite fascinating! Let me share my thoughts on this... " +
            "There's actually more depth to this than might appear on the surface. " +
            "What sparked your interest in this particular area?",
            
            "That's an interesting point you've raised... " +
            "I think there are multiple perspectives worth considering here. " +
            "From my experience, the key is finding the right balance. What's your take on it?",
            
            "Thanks for bringing that up! It's a topic that connects to many other areas... " +
            "I've been thinking about similar concepts recently, and I'm curious about your perspective. " +
            "How does this relate to what you're working on?",
            
            "That's a really insightful observation... " +
            "You've highlighted something that I think deserves more attention. " +
            "The implications of this extend beyond what we might initially consider."
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    changePace(newPace) {
        if (['slow', 'normal', 'fast'].includes(newPace)) {
            this.pace = newPace;
            this.config = this.getTimingConfig(newPace);
            console.log(`\n⚡ Conversation pace changed to: ${newPace.toUpperCase()}`);
            console.log(`   Thinking time: ${this.config.thinkingPauseMs}ms`);
            console.log(`   Typing speed: ${this.config.typingDelayMs}ms per character`);
        } else {
            console.log('\n❌ Invalid pace. Available options: slow, normal, fast');
        }
    }
    
    showStatus() {
        console.log('\n📊 Conversation Status:');
        console.log(`   Current pace: ${this.pace.toUpperCase()}`);
        console.log(`   Messages exchanged: ${this.conversationHistory.length}`);
        console.log(`   Thinking time: ${this.config.thinkingPauseMs}ms`);
        console.log(`   Typing speed: ${this.config.typingDelayMs}ms/char`);
        console.log(`   Session active: ${this.isActive ? 'Yes' : 'No'}`);
    }
    
    showHelp() {
        console.log('\n📖 Conversational AI Help');
        console.log('══════════════════════════');
        console.log('🎭 Features:');
        console.log('   ✓ Natural thinking pauses before responses');
        console.log('   ✓ Breathing pauses during explanations');
        console.log('   ✓ Realistic typing rhythm and speed');
        console.log('   ✓ Context-aware responses');
        console.log('   ✓ Adjustable conversation pace');
        console.log('');
        console.log('💬 Commands:');
        console.log('   /help              - Show this help message');
        console.log('   /pace slow         - Slow conversation (3s thinking, 80ms typing)');
        console.log('   /pace normal       - Normal conversation (1.5s thinking, 40ms typing)');
        console.log('   /pace fast         - Fast conversation (0.8s thinking, 20ms typing)');
        console.log('   /status            - Show current conversation status');
        console.log('   /quit or /exit     - End conversation');
        console.log('   Ctrl+C             - Quick exit');
        console.log('');
        console.log('💡 Tips:');
        console.log('   • Ask about code, debugging, algorithms, or general programming');
        console.log('   • The AI will pause to "think" before complex responses');
        console.log('   • Natural breathing pauses make conversations feel more human');
        console.log('   • Try different paces to find your preferred conversation speed');
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    stop() {
        this.isActive = false;
        console.log('\n📊 Conversation Summary:');
        console.log(`   Total messages: ${this.conversationHistory.length}`);
        console.log(`   Session duration: Active conversation`);
        console.log(`   Final pace: ${this.pace}`);
        console.log('\nThank you for using Natural Conversation AI! 🤖✨');
        
        this.rl.close();
        process.exit(0);
    }
}

// Main execution
if (require.main === module) {
    const args = process.argv.slice(2);
    const pace = args[0] || 'normal';
    
    if (!['slow', 'normal', 'fast'].includes(pace)) {
        console.log('Usage: node ai.js [slow|normal|fast]');
        console.log('Example: node ai.js normal');
        process.exit(1);
    }
    
    console.log('🚀 Starting Natural Conversation AI...');
    
    const ai = new NaturalConversationAI(pace);
    ai.start().catch(error => {
        console.error('❌ Failed to start AI:', error);
        process.exit(1);
    });
}

module.exports = NaturalConversationAI;
