/**
 * Training GUI Controller
 * Handles the web interface for Enhanced Financial Training AI
 */

class TrainingGUI {
    constructor() {
        this.trainingAI = null;
        this.currentSession = null;
        this.isSessionActive = false;
        this.voiceEnabled = true;
        this.messageHistory = [];
        this.analysisMetrics = {
            responseTime: 0,
            empathyScore: 0,
            professionalismScore: 0,
            jargonScore: 0
        };
        
        this.initializeGUI();
        this.setupEventListeners();
    }

    initializeGUI() {
        console.log('🖥️ Initializing Training GUI...');
        
        // Initialize voice controls
        this.updateVoiceControls();
        
        // Setup tooltips and help text
        this.setupTooltips();
        
        console.log('✅ GUI initialized successfully');
    }

    setupEventListeners() {
        // Scenario selection
        document.querySelectorAll('.scenario-card').forEach(card => {
            card.addEventListener('click', () => {
                this.selectScenario(card.dataset.scenario);
            });
        });

        // Voice controls
        document.getElementById('voiceEnabled').addEventListener('change', (e) => {
            this.voiceEnabled = e.target.checked;
            this.updateVoiceControls();
        });

        document.getElementById('voiceProvider').addEventListener('change', (e) => {
            this.updateVoiceProvider(e.target.value);
        });

        document.getElementById('speechRate').addEventListener('input', (e) => {
            document.getElementById('rateValue').textContent = e.target.value + 'x';
            if (this.trainingAI?.voiceSystem) {
                this.trainingAI.voiceSystem.rate = parseFloat(e.target.value);
            }
        });

        document.getElementById('voicePitch').addEventListener('input', (e) => {
            document.getElementById('pitchValue').textContent = e.target.value;
            if (this.trainingAI?.voiceSystem) {
                this.trainingAI.voiceSystem.pitch = parseFloat(e.target.value);
            }
        });

        // Action buttons
        document.getElementById('testVoice').addEventListener('click', () => {
            this.testVoice();
        });

        document.getElementById('startSession').addEventListener('click', () => {
            this.startTrainingSession();
        });

        document.getElementById('pauseSession').addEventListener('click', () => {
            this.pauseSession();
        });

        document.getElementById('endSession').addEventListener('click', () => {
            this.endSession();
        });

        // Chat input
        document.getElementById('messageInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        document.getElementById('sendMessage').addEventListener('click', () => {
            this.sendMessage();
        });

        document.getElementById('voiceButton').addEventListener('click', () => {
            this.toggleVoiceInput();
        });

        // Analysis actions
        document.getElementById('viewAnalytics').addEventListener('click', () => {
            this.showAnalytics();
        });

        document.getElementById('exportReport').addEventListener('click', () => {
            this.exportReport();
        });
    }

    async selectScenario(scenarioId) {
        console.log(`🎭 Selecting scenario: ${scenarioId}`);
        
        // Update UI
        document.querySelectorAll('.scenario-card').forEach(card => {
            card.classList.remove('active');
        });
        document.querySelector(`[data-scenario="${scenarioId}"]`).classList.add('active');

        // Initialize AI system if not already done
        if (!this.trainingAI) {
            try {
                // Create mock AI system for GUI demo
                this.trainingAI = new MockTrainingAI();
                console.log('✅ Training AI system initialized');
            } catch (error) {
                console.error('❌ Failed to initialize AI system:', error);
                this.showError('Failed to initialize AI system. Running in demo mode.');
                this.trainingAI = new MockTrainingAI();
            }
        }

        // Load scenario
        const scenario = this.getScenarioData(scenarioId);
        this.currentSession = {
            scenarioId,
            scenario,
            startTime: new Date(),
            messageCount: 0,
            analysisData: []
        };

        // Update customer info display
        this.updateCustomerDisplay(scenario);
        
        // Update objectives
        this.updateObjectives(scenario);
        
        // Enable chat controls
        this.enableChatControls();
        
        // Add welcome message from customer
        this.addMessage('customer', scenario.greeting, { 
            emotion: scenario.initialEmotion,
            naturalPatterns: scenario.speechPatterns 
        });

        this.showFeedback('Scenario loaded successfully', 'good');
    }

    getScenarioData(scenarioId) {
        const scenarios = {
            frustrated_sarah: {
                name: 'Sarah Johnson',
                avatar: 'S',
                emotion: 'frustrated',
                initialEmotion: 7, // High frustration
                techSavviness: 'high',
                patience: 'low',
                greeting: "Look, I need help RIGHT NOW! Someone used my card for a $500 charge at some electronics store I've never even heard of!",
                speechPatterns: {
                    interruption: 0.8,
                    repetition: 0.6,
                    stuttering: 0.3,
                    breathingPauses: 0.4
                },
                objectives: [
                    'De-escalate the customer\'s frustration',
                    'Gather transaction details efficiently',
                    'Explain fraud protection clearly',
                    'Maintain professional tone throughout'
                ]
            },
            elderly_robert: {
                name: 'Robert Smith',
                avatar: 'R',
                emotion: 'confused',
                initialEmotion: 3,
                techSavviness: 'low',
                patience: 'high',
                greeting: "Hello there... um, I'm having some trouble with my account. I tried to use my card at the grocery store and it didn't work. Could you help me?",
                speechPatterns: {
                    interruption: 0.1,
                    repetition: 0.7,
                    stuttering: 0.2,
                    breathingPauses: 0.8
                },
                objectives: [
                    'Use simple, clear language',
                    'Be patient and understanding',
                    'Avoid technical jargon',
                    'Provide step-by-step guidance'
                ]
            },
            anxious_maria: {
                name: 'Maria Rodriguez',
                avatar: 'M',
                emotion: 'anxious',
                initialEmotion: 6,
                techSavviness: 'medium',
                patience: 'medium',
                greeting: "Hi, I'm really worried... I got an email saying my account might be compromised? I'm not sure what to do and I'm scared someone has access to my money.",
                speechPatterns: {
                    interruption: 0.4,
                    repetition: 0.5,
                    stuttering: 0.6,
                    breathingPauses: 0.7
                },
                objectives: [
                    'Reassure and calm the customer',
                    'Verify account security efficiently',
                    'Explain security measures clearly',
                    'Build trust and confidence'
                ]
            }
        };

        return scenarios[scenarioId] || scenarios.frustrated_sarah;
    }

    updateCustomerDisplay(scenario) {
        document.getElementById('customerAvatar').textContent = scenario.avatar;
        document.getElementById('customerName').textContent = scenario.name;
        document.getElementById('emotionState').textContent = `${scenario.emotion} (Level ${scenario.initialEmotion}/10)`;
        
        // Update avatar color based on emotion
        const avatar = document.getElementById('customerAvatar');
        const emotionColors = {
            frustrated: 'linear-gradient(135deg, #e74c3c, #c0392b)',
            anxious: 'linear-gradient(135deg, #f39c12, #e67e22)',
            confused: 'linear-gradient(135deg, #9b59b6, #8e44ad)',
            angry: 'linear-gradient(135deg, #e74c3c, #c0392b)'
        };
        avatar.style.background = emotionColors[scenario.emotion] || emotionColors.frustrated;
    }

    updateObjectives(scenario) {
        const objectivesList = document.getElementById('objectivesList');
        objectivesList.innerHTML = '';
        
        scenario.objectives.forEach(objective => {
            const li = document.createElement('li');
            li.innerHTML = `<span class="status-indicator status-warning"></span>${objective}`;
            objectivesList.appendChild(li);
        });
    }

    enableChatControls() {
        document.getElementById('messageInput').disabled = false;
        document.getElementById('sendMessage').disabled = false;
        document.getElementById('voiceButton').disabled = false;
        document.getElementById('messageInput').placeholder = 'Type your response to the customer...';
        this.isSessionActive = true;
    }

    addMessage(type, content, options = {}) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        // Add natural speech patterns to customer messages
        if (type === 'customer' && options.naturalPatterns) {
            content = this.addSpeechPatterns(content, options.naturalPatterns);
        }
        
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.innerHTML = `
            <div class="message-content">${content}</div>
            <div class="message-time">${timeString}</div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Add to history
        this.messageHistory.push({
            type,
            content,
            timestamp: now,
            options
        });

        // Speak the message if voice is enabled and it's from customer
        if (this.voiceEnabled && type === 'customer' && this.trainingAI?.voiceSystem) {
            this.trainingAI.voiceSystem.speak(content, {
                emotion: options.emotion || 'neutral'
            });
        }
    }

    addSpeechPatterns(text, patterns) {
        let modifiedText = text;
        
        // Add stuttering
        if (patterns.stuttering > Math.random()) {
            const words = modifiedText.split(' ');
            const targetWord = words[Math.floor(Math.random() * Math.min(3, words.length))];
            const stutteredWord = targetWord.charAt(0) + '-' + targetWord;
            modifiedText = modifiedText.replace(targetWord, stutteredWord);
        }
        
        // Add breathing pauses
        if (patterns.breathingPauses > Math.random()) {
            const sentences = modifiedText.split('. ');
            if (sentences.length > 1) {
                const insertIndex = Math.floor(Math.random() * (sentences.length - 1));
                sentences[insertIndex] += ' *takes a breath*';
                modifiedText = sentences.join('. ');
            }
        }
        
        // Add filler words for repetition
        if (patterns.repetition > Math.random()) {
            const fillers = ['um...', 'uh...', 'you know...', 'like...'];
            const filler = fillers[Math.floor(Math.random() * fillers.length)];
            modifiedText = filler + ' ' + modifiedText;
        }
        
        return modifiedText;
    }

    showTypingIndicator() {
        document.getElementById('typingIndicator').style.display = 'block';
    }

    hideTypingIndicator() {
        document.getElementById('typingIndicator').style.display = 'none';
    }

    async sendMessage() {
        const input = document.getElementById('messageInput');
        const message = input.value.trim();
        
        if (!message || !this.isSessionActive) return;
        
        // Add representative message
        this.addMessage('representative', message);
        input.value = '';
        
        // Update session data
        this.currentSession.messageCount++;
        
        // Analyze the response
        this.analyzeResponse(message);
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Generate customer response (mock)
        setTimeout(() => {
            this.hideTypingIndicator();
            this.generateCustomerResponse(message);
        }, 1500 + Math.random() * 2000); // Natural delay
    }

    analyzeResponse(message) {
        // Mock analysis - in real system this would use the AI analysis
        const analysis = {
            responseTime: 2.3 + Math.random() * 3,
            empathyScore: this.calculateEmpathyScore(message),
            professionalismScore: this.calculateProfessionalismScore(message),
            jargonScore: this.calculateJargonScore(message)
        };
        
        this.updateAnalysisMetrics(analysis);
        this.provideFeedback(message, analysis);
    }

    calculateEmpathyScore(message) {
        const empathyWords = ['understand', 'sorry', 'apologize', 'feel', 'help', 'support', 'concern'];
        const words = message.toLowerCase().split(' ');
        const empathyCount = words.filter(word => empathyWords.some(emp => word.includes(emp))).length;
        return Math.min(10, Math.max(0, (empathyCount / words.length) * 100 + Math.random() * 2));
    }

    calculateProfessionalismScore(message) {
        const unprofessionalWords = ['yeah', 'ok', 'sure', 'whatever', 'stuff', 'things'];
        const words = message.toLowerCase().split(' ');
        const unprofessionalCount = words.filter(word => unprofessionalWords.includes(word)).length;
        return Math.max(0, 10 - unprofessionalCount * 2 + Math.random() * 1);
    }

    calculateJargonScore(message) {
        const jargonWords = ['authenticate', 'verification', 'protocol', 'system', 'database', 'processing'];
        const words = message.toLowerCase().split(' ');
        const jargonCount = words.filter(word => jargonWords.some(jarg => word.includes(jarg))).length;
        return (jargonCount / words.length) * 100;
    }

    updateAnalysisMetrics(analysis) {
        // Update display values
        document.getElementById('responseTime').textContent = analysis.responseTime.toFixed(1) + 's';
        document.getElementById('empathyScore').textContent = analysis.empathyScore.toFixed(1);
        document.getElementById('professionalismScore').textContent = analysis.professionalismScore.toFixed(1);
        document.getElementById('jargonScore').textContent = analysis.jargonScore.toFixed(1) + '%';
        
        // Update progress bars
        document.getElementById('responseTimeBar').style.width = Math.min(100, (analysis.responseTime / 10) * 100) + '%';
        document.getElementById('empathyBar').style.width = (analysis.empathyScore * 10) + '%';
        document.getElementById('professionalismBar').style.width = (analysis.professionalismScore * 10) + '%';
        document.getElementById('jargonBar').style.width = analysis.jargonScore + '%';
        
        // Store for reporting
        this.analysisMetrics = analysis;
    }

    provideFeedback(message, analysis) {
        const feedbackList = document.getElementById('feedbackList');
        const feedback = [];
        
        if (analysis.empathyScore < 5) {
            feedback.push({ text: 'Consider using more empathetic language', status: 'warning' });
        }
        
        if (analysis.jargonScore > 30) {
            feedback.push({ text: 'Try to use less technical jargon', status: 'warning' });
        }
        
        if (analysis.professionalismScore > 8) {
            feedback.push({ text: 'Excellent professional tone!', status: 'good' });
        }
        
        if (analysis.responseTime < 3) {
            feedback.push({ text: 'Quick response time - great!', status: 'good' });
        }
        
        // Update feedback display
        feedbackList.innerHTML = '';
        feedback.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<span class="status-indicator status-${item.status}"></span>${item.text}`;
            feedbackList.appendChild(li);
        });
    }

    generateCustomerResponse(representativeMessage) {
        // Simple mock responses based on scenario and representative input
        const responses = this.getCustomerResponses();
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        this.addMessage('customer', randomResponse, {
            emotion: this.currentSession.scenario.emotion,
            naturalPatterns: this.currentSession.scenario.speechPatterns
        });
    }

    getCustomerResponses() {
        // Mock responses - in real system these would be generated by AI
        return [
            "Okay, but I'm still really worried about this. What exactly are you going to do?",
            "I appreciate your help, but can you explain that in simpler terms?",
            "That sounds good, but how long will this take? I need to use my account today.",
            "I'm not sure I understand. Can you walk me through this step by step?",
            "Thank you for being patient with me. What's the next step?"
        ];
    }

    updateVoiceControls() {
        const isEnabled = document.getElementById('voiceEnabled').checked;
        document.getElementById('voiceProvider').disabled = !isEnabled;
        document.getElementById('speechRate').disabled = !isEnabled;
        document.getElementById('voicePitch').disabled = !isEnabled;
        document.getElementById('testVoice').disabled = !isEnabled;
    }

    async testVoice() {
        const testText = "Hello! This is a test of the voice synthesis system for financial training.";
        
        if (this.trainingAI?.voiceSystem) {
            try {
                await this.trainingAI.voiceSystem.speak(testText);
                this.showFeedback('Voice test successful!', 'good');
            } catch (error) {
                this.showFeedback('Voice test failed: ' + error.message, 'error');
            }
        } else {
            this.showFeedback('Voice system not initialized', 'warning');
            console.log('🔊 Voice Test:', testText);
        }
    }

    startTrainingSession() {
        if (!this.currentSession) {
            this.showFeedback('Please select a scenario first', 'warning');
            return;
        }
        
        this.isSessionActive = true;
        this.showFeedback('Training session started', 'good');
        
        // Focus on input
        document.getElementById('messageInput').focus();
    }

    pauseSession() {
        this.isSessionActive = false;
        this.showFeedback('Session paused', 'warning');
    }

    endSession() {
        if (confirm('Are you sure you want to end the current session?')) {
            this.resetSession();
            this.showFeedback('Session ended', 'error');
        }
    }

    resetSession() {
        this.currentSession = null;
        this.isSessionActive = false;
        this.messageHistory = [];
        
        // Reset UI
        document.getElementById('chatMessages').innerHTML = `
            <div class="message system">
                Welcome to the Enhanced Financial Training AI! Select a scenario from the sidebar to begin your training session.
            </div>
        `;
        
        document.getElementById('messageInput').disabled = true;
        document.getElementById('sendMessage').disabled = true;
        document.getElementById('voiceButton').disabled = true;
        document.getElementById('messageInput').placeholder = 'Select a scenario to begin...';
        
        // Reset customer display
        document.getElementById('customerName').textContent = 'Select a scenario to begin';
        document.getElementById('emotionState').textContent = 'No active session';
        
        // Reset metrics
        this.updateAnalysisMetrics({
            responseTime: 0,
            empathyScore: 0,
            professionalismScore: 0,
            jargonScore: 0
        });
        
        // Clear scenarios
        document.querySelectorAll('.scenario-card').forEach(card => {
            card.classList.remove('active');
        });
    }

    showFeedback(message, type) {
        const feedbackList = document.getElementById('feedbackList');
        const li = document.createElement('li');
        li.innerHTML = `<span class="status-indicator status-${type}"></span>${message}`;
        feedbackList.insertBefore(li, feedbackList.firstChild);
        
        // Remove old feedback items if too many
        while (feedbackList.children.length > 5) {
            feedbackList.removeChild(feedbackList.lastChild);
        }
    }

    showError(message) {
        alert('Error: ' + message);
    }

    showAnalytics() {
        if (!this.currentSession) {
            this.showFeedback('No active session to analyze', 'warning');
            return;
        }
        
        const analytics = {
            sessionDuration: new Date() - this.currentSession.startTime,
            messageCount: this.currentSession.messageCount,
            averageResponseTime: this.analysisMetrics.responseTime,
            empathyScore: this.analysisMetrics.empathyScore,
            professionalismScore: this.analysisMetrics.professionalismScore,
            jargonUsage: this.analysisMetrics.jargonScore
        };
        
        console.log('📊 Session Analytics:', analytics);
        alert(`Session Analytics:\n\nDuration: ${Math.round(analytics.sessionDuration / 1000)}s\nMessages: ${analytics.messageCount}\nEmpathy Score: ${analytics.empathyScore.toFixed(1)}/10\nProfessionalism: ${analytics.professionalismScore.toFixed(1)}/10`);
    }

    exportReport() {
        if (!this.currentSession) {
            this.showFeedback('No session data to export', 'warning');
            return;
        }
        
        const report = {
            scenario: this.currentSession.scenarioId,
            startTime: this.currentSession.startTime,
            duration: new Date() - this.currentSession.startTime,
            messageCount: this.currentSession.messageCount,
            messages: this.messageHistory,
            finalMetrics: this.analysisMetrics
        };
        
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `training-report-${this.currentSession.scenarioId}-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showFeedback('Report exported successfully', 'good');
    }

    setupTooltips() {
        // Add helpful tooltips and descriptions
        const elements = [
            { id: 'responseTime', tooltip: 'Average time to respond to customer messages' },
            { id: 'empathyScore', tooltip: 'How empathetic your responses are (0-10)' },
            { id: 'professionalismScore', tooltip: 'Professional language usage (0-10)' },
            { id: 'jargonScore', tooltip: 'Percentage of technical jargon used' }
        ];
        
        elements.forEach(({ id, tooltip }) => {
            const element = document.getElementById(id);
            if (element) {
                element.title = tooltip;
            }
        });
    }

    toggleVoiceInput() {
        // Placeholder for voice input functionality
        this.showFeedback('Voice input feature coming soon!', 'warning');
    }

    updateVoiceProvider(provider) {
        if (this.trainingAI?.voiceSystem) {
            this.trainingAI.voiceSystem.provider = provider;
            this.showFeedback(`Voice provider changed to ${provider}`, 'good');
        }
    }
}

// Mock Training AI class for demo purposes
class MockTrainingAI {
    constructor() {
        this.voiceSystem = {
            speak: async (text, options = {}) => {
                console.log(`🔊 [MOCK VOICE]: ${text}`);
                return Promise.resolve();
            },
            provider: 'webspeech',
            rate: 0.9,
            pitch: 1.0
        };
    }
}

// Initialize GUI when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.trainingGUI = new TrainingGUI();
    console.log('🎯 Training GUI ready!');
}); 