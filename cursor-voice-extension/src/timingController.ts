export interface TimingConfig {
    thinkingPauseMs: number;      // Pause before responding (simulates thinking)
    breathPauseMs: number;        // Natural breathing pauses
    sentencePauseMs: number;      // Pause between sentences
    paragraphPauseMs: number;     // Pause between paragraphs
    emphasisPauseMs: number;      // Pause for emphasis
}

export class TimingController {
    private config: TimingConfig;
    private isActive: boolean = true;

    constructor() {
        this.config = this.getTimingConfig();
    }

    private getTimingConfig(): TimingConfig {
        const pace = this.getConversationPace();
        
        switch (pace) {
            case 'slow':
                return {
                    thinkingPauseMs: 2000,
                    breathPauseMs: 800,
                    sentencePauseMs: 1200,
                    paragraphPauseMs: 2000,
                    emphasisPauseMs: 1500
                };
            case 'fast':
                return {
                    thinkingPauseMs: 500,
                    breathPauseMs: 200,
                    sentencePauseMs: 300,
                    paragraphPauseMs: 600,
                    emphasisPauseMs: 400
                };
            default: // normal
                return {
                    thinkingPauseMs: 1000,
                    breathPauseMs: 400,
                    sentencePauseMs: 600,
                    paragraphPauseMs: 1000,
                    emphasisPauseMs: 800
                };
        }
    }

    private getConversationPace(): string {
        // In a real implementation, get from VS Code configuration
        return 'normal';
    }

    // Add natural pauses to text based on content analysis
    public addNaturalPauses(text: string): Array<{text: string, pauseAfterMs: number}> {
        const chunks: Array<{text: string, pauseAfterMs: number}> = [];
        const sentences = this.splitIntoSentences(text);

        for (let i = 0; i < sentences.length; i++) {
            const sentence = sentences[i].trim();
            if (!sentence) continue;

            // Analyze sentence for natural pause points
            const words = sentence.split(' ');
            let currentChunk = '';
            
            for (let j = 0; j < words.length; j++) {
                const word = words[j];
                currentChunk += (currentChunk ? ' ' : '') + word;

                // Add breathing pauses at natural points
                if (this.isBreathingPoint(word, j, words.length)) {
                    chunks.push({
                        text: currentChunk,
                        pauseAfterMs: this.config.breathPauseMs
                    });
                    currentChunk = '';
                }
            }

            // Add remaining text
            if (currentChunk) {
                let pauseMs = this.config.sentencePauseMs;
                
                // Longer pause for questions or exclamations
                if (sentence.endsWith('?') || sentence.endsWith('!')) {
                    pauseMs = this.config.emphasisPauseMs;
                }
                
                // Longer pause at paragraph breaks
                if (i < sentences.length - 1 && this.isParagraphBreak(sentences[i + 1])) {
                    pauseMs = this.config.paragraphPauseMs;
                }

                chunks.push({
                    text: currentChunk,
                    pauseAfterMs: pauseMs
                });
            }
        }

        return chunks;
    }

    private splitIntoSentences(text: string): string[] {
        return text.split(/(?<=[.!?])\s+/);
    }

    private isBreathingPoint(word: string, index: number, totalWords: number): boolean {
        // Add breathing pauses after commas, "and", "but", etc.
        const breathingWords = ['and', 'but', 'or', 'so', 'because', 'however', 'therefore'];
        const endsWithComma = word.endsWith(',');
        const isBreathingWord = breathingWords.includes(word.toLowerCase().replace(/[,.!?]/, ''));
        
        // Also add pauses every 6-8 words for natural flow
        const isLongClause = index > 0 && index % 7 === 0;
        
        return endsWithComma || isBreathingWord || isLongClause;
    }

    private isParagraphBreak(nextSentence: string): boolean {
        // Simple heuristic: if next sentence starts with certain words, it's likely a new paragraph
        const paragraphStarters = ['So', 'Now', 'Next', 'Then', 'However', 'Additionally', 'Furthermore'];
        return paragraphStarters.some(starter => nextSentence.startsWith(starter));
    }

    // Simulate thinking pause before responding
    public async addThinkingPause(): Promise<void> {
        if (!this.isActive) return;
        await this.sleep(this.config.thinkingPauseMs);
    }

    // Create a pause in the conversation
    public async pause(durationMs: number): Promise<void> {
        if (!this.isActive) return;
        await this.sleep(durationMs);
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public setActive(active: boolean): void {
        this.isActive = active;
    }

    public updateConfig(newConfig: Partial<TimingConfig>): void {
        this.config = { ...this.config, ...newConfig };
    }
} 