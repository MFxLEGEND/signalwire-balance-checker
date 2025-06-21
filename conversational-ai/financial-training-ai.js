#!/usr/bin/env node

/**
 * Financial Services Customer Service AI Training System
 * Specialized training tool for fraud/member services representatives
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

class FinancialServiceTrainingAI {
    constructor(options = {}) {
        this.mode = options.mode || 'customer'; // 'customer' or 'trainer'
        this.scenario = options.scenario || 'general';
        this.difficulty = options.difficulty || 'beginner'; // beginner, intermediate, advanced
        this.voiceEnabled = options.voiceEnabled || false;
        
        this.currentCustomer = null;
        this.currentSession = {
            startTime: new Date(),
            interactions: [],
            resolved: false,
            escalated: false,
            notes: []
        };
        
        this.setupDatabase();
        this.setupScenarios();
        this.setupInterface();
        this.setupEventHandlers();
    }
    
    setupDatabase() {
        // Mock customer database
        this.customerDatabase = {
            'john_doe_1234': {
                accountNumber: '****1234',
                fullAccountNumber: '4532123456781234',
                name: 'John Doe',
                phone: '555-0123',
                email: 'john.doe@email.com',
                accountType: 'Checking',
                balance: 2847.32,
                availableBalance: 2347.32,
                lastLogin: '2025-06-13 14:30:00',
                securityQuestions: {
                    mothersMaidenName: 'smith',
                    firstPetName: 'buddy',
                    birthCity: 'chicago'
                },
                recentTransactions: [
                    { date: '2025-06-14', amount: -45.67, merchant: 'Amazon.com', type: 'purchase', status: 'posted' },
                    { date: '2025-06-13', amount: -892.50, merchant: 'Best Buy', type: 'purchase', status: 'pending', flagged: true },
                    { date: '2025-06-13', amount: -3.99, merchant: 'Netflix', type: 'subscription', status: 'posted' },
                    { date: '2025-06-12', amount: 2500.00, merchant: 'Direct Deposit - Employer', type: 'deposit', status: 'posted' },
                    { date: '2025-06-11', amount: -125.00, merchant: 'Shell Gas Station', type: 'purchase', status: 'posted' }
                ],
                alerts: [
                    { type: 'fraud', message: 'Unusual large purchase detected', transaction: 'Best Buy $892.50', priority: 'high' },
                    { type: 'account', message: 'Low balance warning threshold reached', priority: 'medium' }
                ],
                cardStatus: 'active',
                disputeHistory: [],
                riskScore: 'medium'
            },
            'jane_smith_5678': {
                accountNumber: '****5678',
                fullAccountNumber: '4532567812345678',
                name: 'Jane Smith',
                phone: '555-0456',
                email: 'jane.smith@email.com',
                accountType: 'Savings',
                balance: 15420.89,
                availableBalance: 15420.89,
                lastLogin: '2025-06-14 09:15:00',
                securityQuestions: {
                    mothersMaidenName: 'johnson',
                    firstPetName: 'whiskers',
                    birthCity: 'denver'
                },
                recentTransactions: [
                    { date: '2025-06-14', amount: -1500.00, merchant: 'Wire Transfer', type: 'transfer', status: 'posted' },
                    { date: '2025-06-13', amount: -200.00, merchant: 'ATM Withdrawal', type: 'withdrawal', status: 'posted' },
                    { date: '2025-06-10', amount: 3200.00, merchant: 'Tax Refund', type: 'deposit', status: 'posted' }
                ],
                alerts: [],
                cardStatus: 'locked',
                disputeHistory: [
                    { date: '2025-05-15', amount: 79.99, merchant: 'Unknown Charge', status: 'resolved', outcome: 'credit_issued' }
                ],
                riskScore: 'low'
            }
        };
        
        // Transaction types and common scenarios
        this.transactionTypes = {
            fraud: ['unauthorized_purchase', 'card_skimming', 'account_takeover', 'phishing_victim'],
            dispute: ['merchant_issue', 'billing_error', 'service_not_received', 'duplicate_charge'],
            account: ['balance_inquiry', 'transfer_funds', 'update_info', 'close_account'],
            card: ['lost_card', 'stolen_card', 'damaged_card', 'pin_issues']
        };
    }
    
    setupScenarios() {
        this.trainingScenarios = {
            'fraud_detection': {
                title: 'Fraud Detection & Response',
                description: 'Customer calls about suspicious activity on their account',
                difficulty: 'intermediate',
                objectives: [
                    'Verify customer identity',
                    'Review flagged transactions',
                    'Determine if fraud occurred',
                    'Take appropriate protective actions',
                    'Educate customer on prevention'
                ],
                customerPersona: {
                    emotional_state: 'concerned',
                    urgency: 'high',
                    knowledge_level: 'basic',
                    cooperation: 'high'
                }
            },
            'dispute_resolution': {
                title: 'Transaction Dispute Resolution',
                description: 'Customer wants to dispute a charge they don\'t recognize',
                difficulty: 'beginner',
                objectives: [
                    'Gather dispute details',
                    'Review transaction information',
                    'Explain dispute process',
                    'File dispute if appropriate',
                    'Set expectations for timeline'
                ],
                customerPersona: {
                    emotional_state: 'frustrated',
                    urgency: 'medium',
                    knowledge_level: 'basic',
                    cooperation: 'medium'
                }
            },
            'account_verification': {
                title: 'Identity Verification',
                description: 'Customer locked out needs to verify identity',
                difficulty: 'beginner',
                objectives: [
                    'Follow verification procedures',
                    'Ask appropriate security questions',
                    'Maintain security protocols',
                    'Assist with account access',
                    'Document verification attempt'
                ],
                customerPersona: {
                    emotional_state: 'impatient',
                    urgency: 'high',
                    knowledge_level: 'medium',
                    cooperation: 'medium'
                }
            },
            'card_services': {
                title: 'Lost/Stolen Card Assistance',
                description: 'Customer reports lost or stolen debit card',
                difficulty: 'beginner',
                objectives: [
                    'Secure the compromised card',
                    'Review recent transactions',
                    'Order replacement card',
                    'Explain temporary solutions',
                    'Provide follow-up information'
                ],
                customerPersona: {
                    emotional_state: 'worried',
                    urgency: 'high',
                    knowledge_level: 'basic',
                    cooperation: 'high'
                }
            },
            'complex_fraud': {
                title: 'Complex Fraud Investigation',
                description: 'Multiple suspicious transactions across several days',
                difficulty: 'advanced',
                objectives: [
                    'Analyze transaction patterns',
                    'Coordinate with fraud team',
                    'Manage customer expectations',
                    'Document investigation steps',
                    'Provide interim solutions'
                ],
                customerPersona: {
                    emotional_state: 'angry',
                    urgency: 'high',
                    knowledge_level: 'high',
                    cooperation: 'low'
                }
            }
        };
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
            const userInput = input.trim();
            
            if (userInput.toLowerCase().startsWith('/')) {
                await this.handleCommand(userInput);
            } else if (userInput) {
                await this.processInteraction(userInput);
            }
            
            this.rl.prompt();
        });
    }
    
    async start() {
        console.clear();
        console.log('🏦 Financial Services Customer Service Training System');
        console.log('═══════════════════════════════════════════════════════');
        console.log('');
        
        if (this.mode === 'trainer') {
            await this.startTrainerMode();
        } else {
            await this.startCustomerMode();
        }
    }
    
    async startCustomerMode() {
        console.log('📋 Available Training Scenarios:');
        console.log('');
        
        Object.entries(this.trainingScenarios).forEach(([key, scenario], index) => {
            const difficultyIcon = scenario.difficulty === 'beginner' ? '🟢' : 
                                  scenario.difficulty === 'intermediate' ? '🟡' : '🔴';
            console.log(`${index + 1}. ${difficultyIcon} ${scenario.title}`);
            console.log(`   ${scenario.description}`);
            console.log('');
        });
        
        console.log('💡 Commands: /scenario [name], /customer [id], /help, /quit');
        console.log('');
        
        // Auto-start with a scenario if specified
        if (this.scenario !== 'general') {
            await this.startScenario(this.scenario);
        } else {
            console.log('🎯 Choose a scenario to begin training, or use /scenario [name]');
        }
        
        this.rl.prompt();
    }
    
    async startTrainerMode() {
        console.log('🎓 TRAINER MODE - Monitor trainee performance');
        console.log('');
        console.log('Features:');
        console.log('• Real-time interaction monitoring');
        console.log('• Performance scoring');
        console.log('• Objective tracking');
        console.log('• Session analytics');
        console.log('');
        this.rl.prompt();
    }
    
    async startScenario(scenarioName) {
        const scenario = this.trainingScenarios[scenarioName];
        if (!scenario) {
            console.log('❌ Scenario not found. Available scenarios:');
            Object.keys(this.trainingScenarios).forEach(name => {
                console.log(`   ${name}`);
            });
            return;
        }
        
        this.currentScenario = scenario;
        this.currentSession.scenario = scenarioName;
        
        console.log(`\n🎭 Starting Scenario: ${scenario.title}`);
        console.log(`📊 Difficulty: ${scenario.difficulty.toUpperCase()}`);
        console.log(`📝 Description: ${scenario.description}`);
        console.log('');
        console.log('🎯 Training Objectives:');
        scenario.objectives.forEach((obj, index) => {
            console.log(`   ${index + 1}. ${obj}`);
        });
        console.log('');
        
        // Select appropriate customer
        await this.selectCustomerForScenario(scenarioName);
        
        console.log('📞 CALL INCOMING...');
        console.log('');
        
        await this.simulateThinking(1500);
        
        // Customer's opening statement
        const openingStatement = this.generateOpeningStatement(scenarioName);
        console.log(`📱 Customer: ${openingStatement}`);
        console.log('');
        console.log('💡 Remember to follow proper verification and service procedures');
        console.log('💡 Type /help for available commands during the call');
        console.log('');
    }
    
    async selectCustomerForScenario(scenarioName) {
        // Select customer based on scenario
        const customerIds = Object.keys(this.customerDatabase);
        let selectedId;
        
        switch (scenarioName) {
            case 'fraud_detection':
            case 'complex_fraud':
                selectedId = 'john_doe_1234'; // Has flagged transactions
                break;
            case 'card_services':
                selectedId = 'jane_smith_5678'; // Has locked card
                break;
            default:
                selectedId = customerIds[Math.floor(Math.random() * customerIds.length)];
        }
        
        this.currentCustomer = this.customerDatabase[selectedId];
        console.log(`🆔 Customer Account: ${this.currentCustomer.name} (${this.currentCustomer.accountNumber})`);
    }
    
    generateOpeningStatement(scenarioName) {
        const statements = {
            'fraud_detection': [
                "Hi, I'm calling because I got an alert about suspicious activity on my account. I'm really worried someone might have stolen my card information.",
                "Hello, I need help right away. There's a charge on my account for almost $900 at Best Buy and I never made that purchase!",
                "I just checked my account online and there's a huge purchase I didn't make. What's going on with my account?"
            ],
            'dispute_resolution': [
                "I need to dispute a charge on my account. There's something there that I definitely didn't authorize.",
                "Hi, I'm looking at my statement and there's a charge I don't recognize. Can you help me figure out what it is?",
                "I want to file a dispute. There's a merchant charge that doesn't look right to me."
            ],
            'account_verification': [
                "I'm locked out of my online banking and I need to access my account urgently.",
                "Hi, I can't log into my account and I need to check my balance for a payment today.",
                "My account seems to be frozen or something. I can't access anything online."
            ],
            'card_services': [
                "I think I lost my debit card. I can't find it anywhere and I'm worried someone might use it.",
                "My card was stolen from my car last night. I need to cancel it immediately!",
                "I can't find my debit card and I'm not sure if I lost it or if someone took it."
            ],
            'complex_fraud': [
                "This is the third time I'm calling about fraudulent charges. Nothing has been resolved and now there are even more suspicious transactions!",
                "I'm extremely frustrated. Despite reporting fraud last week, there are new unauthorized charges and my account still isn't secure!",
                "I need to speak to a supervisor immediately. This fraud situation is getting worse, not better."
            ]
        };
        
        const scenarioStatements = statements[scenarioName] || [
            "Hi, I need help with my account please.",
            "Hello, I have a question about my banking account.",
            "I'm calling about an issue with my account."
        ];
        
        return scenarioStatements[Math.floor(Math.random() * scenarioStatements.length)];
    }
    
    async processInteraction(representativeResponse) {
        // Log the interaction
        this.currentSession.interactions.push({
            timestamp: new Date(),
            speaker: 'representative',
            message: representativeResponse,
            analysis: this.analyzeResponse(representativeResponse)
        });
        
        // Generate customer response based on the scenario and representative's response
        await this.simulateThinking(800);
        
        const customerResponse = await this.generateCustomerResponse(representativeResponse);
        
        console.log(`📱 Customer: ${customerResponse}`);
        
        // Log customer response
        this.currentSession.interactions.push({
            timestamp: new Date(),
            speaker: 'customer',
            message: customerResponse,
            analysis: {}
        });
        
        // Check if scenario objectives are being met
        this.evaluateProgress();
    }
    
    analyzeResponse(response) {
        const analysis = {
            containsGreeting: /hello|hi|good (morning|afternoon|evening)|thank you for calling/i.test(response),
            containsEmpathy: /understand|sorry|apologize|concern|help|assist/i.test(response),
            asksVerification: /verify|confirm|security|identity|name|address|phone|ssn/i.test(response),
            providesInformation: /let me|I can|here's|according to|shows|indicates/i.test(response),
            asksQuestions: /\?/.test(response),
            professional: !/um|uh|like|totally|awesome|cool/i.test(response),
            followsProtocol: this.checkProtocolCompliance(response)
        };
        
        return analysis;
    }
    
    checkProtocolCompliance(response) {
        // Check if response follows financial services protocols
        const protocols = {
            noAccountDetails: !/\b\d{4,}\b/.test(response), // No full account numbers
            noSSN: !/\b\d{3}-\d{2}-\d{4}\b/.test(response), // No SSN sharing
            appropriateLanguage: !/damn|hell|crap|stupid/i.test(response),
            securityFocus: /verify|secure|protect|confirm/i.test(response)
        };
        
        return protocols;
    }
    
    async generateCustomerResponse(representativeResponse) {
        const scenario = this.currentScenario;
        const customer = this.currentCustomer;
        const persona = scenario.customerPersona;
        
        // Analyze what the representative said to determine appropriate response
        const analysis = this.analyzeResponse(representativeResponse);
        
        let response = '';
        
        // Response based on representative's approach
        if (analysis.containsGreeting && !this.currentSession.greeted) {
            this.currentSession.greeted = true;
            response = this.generatePersonalizedGreetingResponse(persona);
        } else if (analysis.asksVerification) {
            response = await this.handleVerificationRequest(representativeResponse);
        } else if (representativeResponse.toLowerCase().includes('security question')) {
            response = this.handleSecurityQuestion(representativeResponse);
        } else if (representativeResponse.toLowerCase().includes('transaction')) {
            response = this.handleTransactionInquiry(representativeResponse);
        } else if (analysis.providesInformation) {
            response = this.generateInformationAcknowledgment(persona);
        } else {
            response = this.generateContextualResponse(representativeResponse, persona);
        }
        
        return response;
    }
    
    generatePersonalizedGreetingResponse(persona) {
        const responses = {
            'concerned': [
                "Thank you for taking my call. I'm really worried about my account right now.",
                "Hi, yes, I'm very concerned about some activity on my account.",
                "Hello, I need your help with something urgent on my account."
            ],
            'frustrated': [
                "Finally! I've been trying to get through for 20 minutes. I need help with a charge on my account.",
                "Thank goodness. I'm really frustrated about something on my statement.",
                "About time. I have a problem that needs to be resolved immediately."
            ],
            'worried': [
                "Thank you. I'm really worried - I think someone might have my card information.",
                "Hi, I'm very concerned about the security of my account.",
                "Hello, I'm worried about some activity I didn't authorize."
            ],
            'angry': [
                "I shouldn't have to keep calling about this! This is unacceptable!",
                "This is ridiculous. I've called multiple times and nothing gets resolved.",
                "I'm extremely upset about how this has been handled so far."
            ]
        };
        
        const stateResponses = responses[persona.emotional_state] || responses['concerned'];
        return stateResponses[Math.floor(Math.random() * stateResponses.length)];
    }
    
    async handleVerificationRequest(representativeResponse) {
        if (representativeResponse.toLowerCase().includes('name')) {
            return `Yes, my name is ${this.currentCustomer.name}.`;
        } else if (representativeResponse.toLowerCase().includes('phone') || representativeResponse.toLowerCase().includes('number')) {
            return `My phone number is ${this.currentCustomer.phone}.`;
        } else if (representativeResponse.toLowerCase().includes('address')) {
            return "My address is 123 Main Street, Anytown, State 12345.";
        } else if (representativeResponse.toLowerCase().includes('last four') || representativeResponse.toLowerCase().includes('account')) {
            return `The last four digits of my account are ${this.currentCustomer.accountNumber.slice(-4)}.`;
        } else {
            return "What information do you need to verify my identity?";
        }
    }
    
    handleSecurityQuestion(representativeResponse) {
        if (representativeResponse.toLowerCase().includes('mother') && representativeResponse.toLowerCase().includes('maiden')) {
            return `My mother's maiden name is ${this.currentCustomer.securityQuestions.mothersMaidenName}.`;
        } else if (representativeResponse.toLowerCase().includes('pet')) {
            return `My first pet's name was ${this.currentCustomer.securityQuestions.firstPetName}.`;
        } else if (representativeResponse.toLowerCase().includes('born') || representativeResponse.toLowerCase().includes('birth')) {
            return `I was born in ${this.currentCustomer.securityQuestions.birthCity}.`;
        } else {
            return "I'm ready to answer the security question.";
        }
    }
    
    handleTransactionInquiry(representativeResponse) {
        const flaggedTransaction = this.currentCustomer.recentTransactions.find(t => t.flagged);
        
        if (flaggedTransaction) {
            return `No, I definitely did not make that ${flaggedTransaction.merchant} purchase for $${Math.abs(flaggedTransaction.amount)}. I've never shopped there recently.`;
        } else {
            return "Let me think about my recent purchases... can you tell me more about which transaction you're asking about?";
        }
    }
    
    generateInformationAcknowledgment(persona) {
        const responses = {
            'high': ["Okay, I understand. What do we do next?", "That makes sense. How long will this take?", "I see. What are my options?"],
            'medium': ["Alright, so what happens now?", "Okay, what's the next step?", "I understand. What should I expect?"],
            'low': ["What does that mean exactly?", "I don't understand. Can you explain that differently?", "So what does this mean for my account?"]
        };
        
        const cooperationLevel = persona.cooperation;
        const levelResponses = responses[cooperationLevel] || responses['medium'];
        return levelResponses[Math.floor(Math.random() * levelResponses.length)];
    }
    
    generateContextualResponse(representativeResponse, persona) {
        // Generate response based on emotional state and context
        const urgency = persona.urgency;
        const emotionalState = persona.emotional_state;
        
        if (urgency === 'high' && emotionalState === 'angry') {
            return "This is taking too long! I need this resolved now, not later!";
        } else if (urgency === 'high' && emotionalState === 'worried') {
            return "I'm really concerned about the security of my account. How quickly can we fix this?";
        } else if (emotionalState === 'frustrated') {
            return "I just want to get this sorted out. It shouldn't be this complicated.";
        } else {
            return "Okay, I'm listening. What do you need from me?";
        }
    }
    
    evaluateProgress() {
        const interactions = this.currentSession.interactions;
        const repResponses = interactions.filter(i => i.speaker === 'representative');
        
        if (repResponses.length === 0) return;
        
        const latestResponse = repResponses[repResponses.length - 1];
        const analysis = latestResponse.analysis;
        
        // Provide real-time feedback
        if (repResponses.length === 1 && !analysis.containsGreeting) {
            console.log('\n💡 TIP: Consider starting with a professional greeting');
        }
        
        if (repResponses.length >= 2 && !repResponses.some(r => r.analysis.asksVerification)) {
            console.log('\n⚠️  REMINDER: Don\'t forget to verify customer identity');
        }
    }
    
    async handleCommand(command) {
        const [cmd, ...args] = command.toLowerCase().split(' ');
        
        switch (cmd) {
            case '/help':
                this.showHelp();
                break;
            case '/scenario':
                if (args[0]) {
                    await this.startScenario(args[0]);
                } else {
                    this.listScenarios();
                }
                break;
            case '/customer':
                if (args[0]) {
                    this.showCustomerInfo(args[0]);
                } else {
                    this.showCustomerInfo();
                }
                break;
            case '/account':
                this.showAccountDetails();
                break;
            case '/transactions':
                this.showTransactionHistory();
                break;
            case '/notes':
                if (args.length > 0) {
                    this.addNote(args.join(' '));
                } else {
                    this.showNotes();
                }
                break;
            case '/escalate':
                this.escalateCall();
                break;
            case '/resolve':
                this.resolveCall();
                break;
            case '/score':
                this.showCurrentScore();
                break;
            case '/end':
                this.endSession();
                break;
            case '/quit':
                this.endSession();
                break;
            default:
                console.log('❌ Unknown command. Type /help for available commands.');
        }
    }
    
    showHelp() {
        console.log('\n📖 Customer Service Training Commands');
        console.log('═══════════════════════════════════════');
        console.log('📋 Scenario Management:');
        console.log('   /scenario [name]     - Start a training scenario');
        console.log('   /scenario            - List available scenarios');
        console.log('');
        console.log('👤 Customer Information:');
        console.log('   /customer           - Show current customer details');
        console.log('   /account            - Show account information');
        console.log('   /transactions       - Show transaction history');
        console.log('');
        console.log('📝 Call Management:');
        console.log('   /notes [text]       - Add note or show notes');
        console.log('   /escalate           - Escalate to supervisor');
        console.log('   /resolve            - Mark call as resolved');
        console.log('   /end                - End current call');
        console.log('');
        console.log('📊 Training Features:');
        console.log('   /score              - Show current performance score');
        console.log('   /help               - Show this help menu');
        console.log('   /quit               - Exit training system');
        console.log('');
    }
    
    showCustomerInfo(customerId = null) {
        const customer = customerId ? this.customerDatabase[customerId] : this.currentCustomer;
        
        if (!customer) {
            console.log('❌ No customer information available');
            return;
        }
        
        console.log('\n👤 Customer Information');
        console.log('═══════════════════════');
        console.log(`Name: ${customer.name}`);
        console.log(`Account: ${customer.accountNumber}`);
        console.log(`Phone: ${customer.phone}`);
        console.log(`Email: ${customer.email}`);
        console.log(`Account Type: ${customer.accountType}`);
        console.log(`Risk Score: ${customer.riskScore.toUpperCase()}`);
        console.log(`Card Status: ${customer.cardStatus.toUpperCase()}`);
        console.log(`Last Login: ${customer.lastLogin}`);
        
        if (customer.alerts.length > 0) {
            console.log('\n🚨 Active Alerts:');
            customer.alerts.forEach(alert => {
                console.log(`   ${alert.priority.toUpperCase()}: ${alert.message}`);
            });
        }
        console.log('');
    }
    
    showAccountDetails() {
        if (!this.currentCustomer) {
            console.log('❌ No customer selected');
            return;
        }
        
        const customer = this.currentCustomer;
        console.log('\n💰 Account Details');
        console.log('══════════════════');
        console.log(`Account Number: ${customer.accountNumber}`);
        console.log(`Account Type: ${customer.accountType}`);
        console.log(`Current Balance: $${customer.balance.toFixed(2)}`);
        console.log(`Available Balance: $${customer.availableBalance.toFixed(2)}`);
        console.log(`Card Status: ${customer.cardStatus}`);
        console.log('');
    }
    
    showTransactionHistory() {
        if (!this.currentCustomer) {
            console.log('❌ No customer selected');
            return;
        }
        
        const customer = this.currentCustomer;
        console.log('\n💳 Recent Transactions');
        console.log('══════════════════════');
        
        customer.recentTransactions.forEach(transaction => {
            const flag = transaction.flagged ? '🚩' : '  ';
            const amount = transaction.amount < 0 ? `-$${Math.abs(transaction.amount).toFixed(2)}` : `+$${transaction.amount.toFixed(2)}`;
            console.log(`${flag} ${transaction.date} | ${amount.padStart(10)} | ${transaction.merchant} | ${transaction.status.toUpperCase()}`);
        });
        console.log('');
    }
    
    addNote(note) {
        this.currentSession.notes.push({
            timestamp: new Date(),
            note: note
        });
        console.log('✅ Note added to call record');
    }
    
    showNotes() {
        console.log('\n📝 Call Notes');
        console.log('═════════════');
        
        if (this.currentSession.notes.length === 0) {
            console.log('No notes recorded for this call');
        } else {
            this.currentSession.notes.forEach((note, index) => {
                console.log(`${index + 1}. [${note.timestamp.toLocaleTimeString()}] ${note.note}`);
            });
        }
        console.log('');
    }
    
    escalateCall() {
        this.currentSession.escalated = true;
        console.log('\n🔺 Call Escalated to Supervisor');
        console.log('Reason for escalation will be documented in the call record.');
        console.log('In real scenarios, provide detailed handoff notes to supervisor.');
        console.log('');
    }
    
    resolveCall() {
        this.currentSession.resolved = true;
        console.log('\n✅ Call Marked as Resolved');
        console.log('Customer issue has been addressed successfully.');
        this.generateSessionSummary();
    }
    
    showCurrentScore() {
        const interactions = this.currentSession.interactions;
        const repResponses = interactions.filter(i => i.speaker === 'representative');
        
        if (repResponses.length === 0) {
            console.log('📊 No interactions to score yet');
            return;
        }
        
        const scores = {
            professionalism: 0,
            protocol: 0,
            empathy: 0,
            efficiency: 0
        };
        
        repResponses.forEach(response => {
            const analysis = response.analysis;
            if (analysis.professional) scores.professionalism += 20;
            if (analysis.followsProtocol.securityFocus) scores.protocol += 20;
            if (analysis.containsEmpathy) scores.empathy += 20;
            if (analysis.asksQuestions && analysis.providesInformation) scores.efficiency += 20;
        });
        
        // Normalize scores
        Object.keys(scores).forEach(key => {
            scores[key] = Math.min(100, scores[key]);
        });
        
        console.log('\n📊 Current Performance Score');
        console.log('════════════════════════════');
        console.log(`Professionalism: ${scores.professionalism}/100`);
        console.log(`Protocol Compliance: ${scores.protocol}/100`);
        console.log(`Empathy & Service: ${scores.empathy}/100`);
        console.log(`Efficiency: ${scores.efficiency}/100`);
        
        const overall = Math.round((scores.professionalism + scores.protocol + scores.empathy + scores.efficiency) / 4);
        console.log(`\nOverall Score: ${overall}/100`);
        console.log('');
    }
    
    generateSessionSummary() {
        const duration = (new Date() - this.currentSession.startTime) / 1000;
        const interactions = this.currentSession.interactions.length;
        
        console.log('\n📋 Session Summary');
        console.log('══════════════════');
        console.log(`Duration: ${Math.round(duration)}s`);
        console.log(`Interactions: ${interactions}`);
        console.log(`Resolved: ${this.currentSession.resolved ? 'Yes' : 'No'}`);
        console.log(`Escalated: ${this.currentSession.escalated ? 'Yes' : 'No'}`);
        console.log(`Notes: ${this.currentSession.notes.length}`);
        
        this.showCurrentScore();
    }
    
    async simulateThinking(ms) {
        await new Promise(resolve => setTimeout(resolve, ms));
    }
    
    endSession() {
        if (this.currentSession.interactions.length > 0) {
            this.generateSessionSummary();
        }
        
        console.log('\n🎓 Training Session Complete');
        console.log('Thank you for using the Financial Services Training System!');
        process.exit(0);
    }
    
    listScenarios() {
        console.log('\n📋 Available Training Scenarios:');
        console.log('');
        
        Object.entries(this.trainingScenarios).forEach(([key, scenario]) => {
            const difficultyIcon = scenario.difficulty === 'beginner' ? '🟢' : 
                                  scenario.difficulty === 'intermediate' ? '🟡' : '🔴';
            console.log(`${difficultyIcon} ${key}`);
            console.log(`   ${scenario.title}`);
            console.log(`   ${scenario.description}`);
            console.log('');
        });
    }
}

// Main execution
if (require.main === module) {
    const args = process.argv.slice(2);
    const mode = args[0] || 'customer';
    const scenario = args[1] || 'general';
    const difficulty = args[2] || 'beginner';
    
    console.log('🚀 Starting Financial Services Training System...');
    
    const trainingAI = new FinancialServiceTrainingAI({
        mode: mode,
        scenario: scenario,
        difficulty: difficulty,
        voiceEnabled: false
    });
    
    trainingAI.start().catch(error => {
        console.error('❌ Failed to start training system:', error);
        process.exit(1);
    });
}

module.exports = FinancialServiceTrainingAI; 