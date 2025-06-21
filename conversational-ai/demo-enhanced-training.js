#!/usr/bin/env node

/**
 * Demo script for Enhanced Financial Training AI
 * Shows natural conversation patterns and cadence analysis
 */

const EnhancedFinancialTrainingAI = require('./enhanced-financial-training-ai');

async function runDemo() {
    console.log('🎬 Enhanced Financial Training AI Demo');
    console.log('════════════════════════════════════════');
    console.log('This demo shows natural conversation patterns including:');
    console.log('• Conversation cadence analysis');
    console.log('• Natural speech patterns (stuttering, pauses, breath control)');
    console.log('• Emotional state adaptation');
    console.log('• Human-like interactions');
    console.log('');
    
    // Create training AI instance
    const trainingAI = new EnhancedFinancialTrainingAI({
        mode: 'customer',
        scenario: 'fraud_detection',
        voiceEnabled: true
    });
    
    console.log('🎭 Demo Scenarios Available:');
    console.log('');
    console.log('1. Frustrated customer with fraud concern');
    console.log('2. Elderly customer needing help');
    console.log('3. Anxious customer with compromised account');
    console.log('');
    console.log('Starting interactive demo...');
    console.log('');
    console.log('💡 Try different approaches and notice how the customer responds:');
    console.log('   - Quick vs. slow responses');
    console.log('   - Technical jargon vs. simple language');
    console.log('   - Empathetic vs. directive tone');
    console.log('   - Patient vs. urgent communication');
    console.log('');
    console.log('🎯 Training Tips:');
    console.log('   • Watch for stuttering when customers are confused');
    console.log('   • Notice breathing patterns when customers are stressed');
    console.log('   • Observe how emotional state changes based on your approach');
    console.log('   • Pay attention to interruption patterns from impatient customers');
    console.log('');
    
    // Start the training session
    await trainingAI.start();
}

if (require.main === module) {
    runDemo().catch(error => {
        console.error('❌ Demo failed:', error);
        process.exit(1);
    });
}

module.exports = { runDemo }; 