import { TimingController } from './timingController';
import * as vscode from 'vscode';

export interface ConversationalAIConfig {
    apiKey: string;
    timingController: TimingController;
    onConversationStart?: () => void;
    onConversationEnd?: () => void;
    onError?: (error: string) => void;
    onAIResponse?: (response: string) => void;
}

export class ConversationalAI {
    private config: ConversationalAIConfig;
    private isListening: boolean = false;
    private isPaused: boolean = false;
    private webviewPanel: vscode.WebviewPanel | undefined;
    private audioContext: AudioContext | undefined;
    private mediaRecorder: MediaRecorder | undefined;
    private recognition: any; // SpeechRecognition
    
    constructor(config: ConversationalAIConfig) {
        this.config = config;
        this.setupSpeechRecognition();
    }

    private setupSpeechRecognition() {
        // Setup Web Speech API for voice input
        if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
            this.recognition = new (window as any).webkitSpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';
            
            this.recognition.onresult = (event: any) => {
                const last = event.results.length - 1;
                const text = event.results[last][0].transcript;
                
                if (event.results[last].isFinal) {
                    this.processUserInput(text);
                }
            };
            
            this.recognition.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                if (this.config.onError) {
                    this.config.onError(`Speech recognition error: ${event.error}`);
                }
            };
        }
    }

    public async start(): Promise<void> {
        try {
            this.isListening = true;
            
            if (this.config.onConversationStart) {
                this.config.onConversationStart();
            }
            
        } catch (error) {
            if (this.config.onError) {
                this.config.onError(`Failed to start conversation: ${error}`);
            }
        }
    }

    public async processUserInput(userText: string): Promise<void> {
        if (this.isPaused) return;

        try {
            // Add natural thinking pause
            await this.config.timingController.addThinkingPause();
            
            // Get AI response
            const aiResponse = await this.getAIResponse(userText);
            
            // Process response with natural timing
            await this.speakWithNaturalTiming(aiResponse);
            
        } catch (error) {
            if (this.config.onError) {
                this.config.onError(`Error processing input: ${error}`);
            }
        }
    }

    private async getAIResponse(userInput: string): Promise<string> {
        const prompt = `You are a helpful coding assistant. Be conversational and natural.
        User: ${userInput}
        Provide a helpful, conversational response.`;

        return await this.callOpenAIAPI(prompt);
    }

    private async callOpenAIAPI(prompt: string): Promise<string> {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'gpt-4',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a conversational coding assistant. Speak naturally with appropriate pauses.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 1000,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
            
        } catch (error) {
            throw new Error(`Failed to get AI response: ${error}`);
        }
    }

    private async speakWithNaturalTiming(text: string): Promise<void> {
        const chunks = this.config.timingController.addNaturalPauses(text);
        
        for (const chunk of chunks) {
            if (this.isPaused) break;
            
            // In a real implementation, this would use speech synthesis
            console.log(`Speaking: ${chunk.text}`);
            
            if (chunk.pauseAfterMs > 0) {
                await this.config.timingController.pause(chunk.pauseAfterMs);
            }
        }
        
        if (this.config.onAIResponse) {
            this.config.onAIResponse(text);
        }
    }

    public pause(): void {
        this.isPaused = true;
        this.config.timingController.setActive(false);
    }

    public resume(): void {
        this.isPaused = false;
        this.config.timingController.setActive(true);
    }

    public stop(): void {
        this.isListening = false;
        this.isPaused = true;
        
        if (this.config.onConversationEnd) {
            this.config.onConversationEnd();
        }
    }

    private getWebviewContent(): string {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Conversational AI</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                    margin: 0;
                    padding: 20px;
                    background-color: var(--vscode-editor-background);
                    color: var(--vscode-editor-foreground);
                }
                
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                }
                
                .status {
                    text-align: center;
                    margin-bottom: 20px;
                    padding: 10px;
                    border-radius: 5px;
                    background-color: var(--vscode-badge-background);
                }
                
                .controls {
                    display: flex;
                    justify-content: center;
                    gap: 10px;
                    margin-bottom: 20px;
                }
                
                button {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 5px;
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    cursor: pointer;
                }
                
                button:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
                
                .conversation {
                    background-color: var(--vscode-editor-background);
                    border: 1px solid var(--vscode-panel-border);
                    border-radius: 5px;
                    padding: 15px;
                    max-height: 400px;
                    overflow-y: auto;
                }
                
                .message {
                    margin-bottom: 10px;
                    padding: 8px 12px;
                    border-radius: 5px;
                }
                
                .user-message {
                    background-color: var(--vscode-inputOption-activeBackground);
                    margin-left: 20px;
                }
                
                .ai-message {
                    background-color: var(--vscode-badge-background);
                    margin-right: 20px;
                }
                
                .thinking {
                    font-style: italic;
                    opacity: 0.7;
                }
                
                .mic-button {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background-color: var(--vscode-button-background);
                    border: 2px solid var(--vscode-button-foreground);
                    color: var(--vscode-button-foreground);
                    font-size: 24px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .mic-button.active {
                    background-color: #ff4444;
                    border-color: #ff4444;
                    color: white;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="status" id="status">
                    Ready to chat! Click the microphone to start speaking.
                </div>
                
                <div class="controls">
                    <button class="mic-button" id="micButton" onclick="toggleListening()">🎤</button>
                </div>
                
                <div class="conversation" id="conversation">
                    <div class="ai-message">
                        Hello! I'm your conversational AI assistant. I can help you with coding questions, 
                        explain your code, or just chat about programming. What would you like to talk about?
                    </div>
                </div>
            </div>

            <script>
                const vscode = acquireVsCodeApi();
                let isListening = false;
                
                function toggleListening() {
                    const micButton = document.getElementById('micButton');
                    const status = document.getElementById('status');
                    
                    if (isListening) {
                        isListening = false;
                        micButton.classList.remove('active');
                        micButton.textContent = '🎤';
                        status.textContent = 'Stopped listening';
                        vscode.postMessage({ command: 'stopListening' });
                    } else {
                        isListening = true;
                        micButton.classList.add('active');
                        micButton.textContent = '🛑';
                        status.textContent = 'Listening... Speak now!';
                        vscode.postMessage({ command: 'startListening' });
                    }
                }
                
                function addMessage(text, isUser = false) {
                    const conversation = document.getElementById('conversation');
                    const messageDiv = document.createElement('div');
                    messageDiv.className = \`message \${isUser ? 'user-message' : 'ai-message'}\`;
                    messageDiv.textContent = text;
                    conversation.appendChild(messageDiv);
                    conversation.scrollTop = conversation.scrollHeight;
                }
                
                function showThinking() {
                    const conversation = document.getElementById('conversation');
                    const thinkingDiv = document.createElement('div');
                    thinkingDiv.className = 'message ai-message thinking';
                    thinkingDiv.textContent = 'Thinking...';
                    thinkingDiv.id = 'thinking';
                    conversation.appendChild(thinkingDiv);
                    conversation.scrollTop = conversation.scrollHeight;
                }
                
                function removeThinking() {
                    const thinking = document.getElementById('thinking');
                    if (thinking) {
                        thinking.remove();
                    }
                }
                
                // Handle messages from extension
                window.addEventListener('message', event => {
                    const message = event.data;
                    
                    switch (message.command) {
                        case 'displayText':
                            removeThinking();
                            addMessage(message.text, false);
                            break;
                        case 'showThinking':
                            showThinking();
                            break;
                        case 'userSaid':
                            addMessage(message.text, true);
                            break;
                    }
                });
            </script>
        </body>
        </html>`;
    }
} 