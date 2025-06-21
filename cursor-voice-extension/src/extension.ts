import * as vscode from 'vscode';
import { ConversationalAI } from './conversationalAI';
import { TimingController } from './timingController';

let conversationAI: ConversationalAI | undefined;
let timingController: TimingController | undefined;

export function activate(context: vscode.ExtensionContext) {
    console.log('Cursor Conversational AI extension is now active!');

    // Initialize controllers
    timingController = new TimingController();
    
    // Register commands
    const startConversation = vscode.commands.registerCommand('cursor-ai.startConversation', async () => {
        await startConversationalSession();
    });

    const pauseConversation = vscode.commands.registerCommand('cursor-ai.pauseConversation', () => {
        if (conversationAI) {
            conversationAI.pause();
            vscode.window.showInformationMessage('Conversation paused');
        }
    });

    const resumeConversation = vscode.commands.registerCommand('cursor-ai.resumeConversation', () => {
        if (conversationAI) {
            conversationAI.resume();
            vscode.window.showInformationMessage('Conversation resumed');
        }
    });

    // Register disposables
    context.subscriptions.push(startConversation, pauseConversation, resumeConversation);
}

async function startConversationalSession() {
    try {
        const config = vscode.workspace.getConfiguration('cursorAI');
        const apiKey = config.get<string>('openaiApiKey');
        
        if (!apiKey) {
            const result = await vscode.window.showInputBox({
                prompt: 'Enter your OpenAI API Key',
                password: true
            });
            
            if (!result) return;
            
            await config.update('openaiApiKey', result, vscode.ConfigurationTarget.Global);
        }

        // Initialize conversational AI
        conversationAI = new ConversationalAI({
            apiKey: apiKey || '',
            timingController: timingController!,
            onConversationStart: () => {
                vscode.window.showInformationMessage('🎙️ Conversational AI started - Press Ctrl+Shift+V to talk');
            },
            onConversationEnd: () => {
                vscode.window.showInformationMessage('Conversation ended');
            },
            onError: (error: string) => {
                vscode.window.showErrorMessage(`Conversation error: ${error}`);
            }
        });

        await conversationAI.start();
        
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to start conversation: ${error}`);
    }
}

export function deactivate() {
    if (conversationAI) {
        conversationAI.stop();
    }
} 