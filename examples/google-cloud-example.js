/**
 * Mastra AI Framework - Google Cloud Speech-to-Text Example
 * 
 * This example demonstrates how to use the Google Cloud Speech-to-Text integration
 * with the Mastra AI framework.
 * 
 * To run this example:
 * 1. Make sure you have installed the required dependencies:
 *    npm install @google-cloud/speech
 * 2. Run the example:
 *    GOOGLE_CLOUD_API_KEY=YOUR_API_KEY node examples/google-cloud-example.js
 */

const fs = require('fs');
const path = require('path');
const { Voice, MastraAI } = require('../src/mastra');

const apiKey = process.env.GOOGLE_CLOUD_API_KEY || 'AIzaSyCQt0YdI8KrFB2rfq1_Z8Jdvl9WejRQeEY';

const mastra = new MastraAI();

const voice = Voice.createVoice({
  provider: 'google-cloud',
  apiKey,
  language: 'ja-JP',
  aiProvider: {
    call: async (params) => {
      console.log('Enhancing transcription with AI...');
      
      const match = params.prompt.match(/音声認識テキスト: "(.+)"/);
      if (!match) {
        return { text: 'Error: Could not extract transcription from prompt' };
      }
      
      const originalText = match[1];
      
      let enhancedText = originalText
        .replace(/えー/g, '')
        .replace(/あの/g, '')
        .replace(/えっと/g, '')
        .replace(/ですね/g, 'です')
        .trim();
      
      if (!enhancedText.endsWith('。') && !enhancedText.endsWith('.')) {
        enhancedText += '。';
      }
      
      return { text: enhancedText };
    }
  }
});

const audioFile = path.join(__dirname, 'sample-audio.wav');
if (!fs.existsSync(audioFile)) {
  console.log('Creating a sample audio file...');
  
  const buffer = Buffer.alloc(44);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(16000, 24);
  buffer.writeUInt32LE(32000, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(0, 40);
  
  fs.writeFileSync(audioFile, buffer);
  console.log(`Created sample audio file: ${audioFile}`);
}

console.log('Mastra AI Framework - Google Cloud Speech-to-Text Example');
console.log('=======================================================');
console.log('');
console.log(`Using Google Cloud API Key: ${apiKey.substring(0, 10)}...`);
console.log('');

console.log('Testing voice recognition...');
console.log(`Processing audio file: ${audioFile}`);

voice.speechToText(fs.readFileSync(audioFile), { language: 'ja-JP' })
  .then(async (result) => {
    console.log('');
    console.log('Speech-to-Text Result:');
    console.log('-----------------------');
    console.log('Transcription:', result.text || '(No transcription available)');
    console.log('Confidence:', result.confidence || 'N/A');
    
    if (result.metadata) {
      console.log('');
      console.log('Metadata:');
      console.log('---------');
      Object.entries(result.metadata).forEach(([key, value]) => {
        console.log(`${key}: ${value}`);
      });
    }
    
    if (result.text) {
      console.log('');
      console.log('Enhancing transcription with AI...');
      
      try {
        const enhanced = await voice.enhanceTranscription(result.text, { language: 'ja-JP' });
        
        console.log('');
        console.log('Enhanced Transcription:');
        console.log('----------------------');
        console.log('Original:', enhanced.original);
        console.log('Enhanced:', enhanced.enhanced);
        console.log('Confidence:', enhanced.confidence || 'N/A');
        
        if (enhanced.changes && enhanced.changes.length > 0) {
          console.log('');
          console.log('Changes:');
          console.log('--------');
          enhanced.changes.forEach((change, index) => {
            console.log(`${index + 1}. ${change.type}: "${change.original}" -> "${change.enhanced}"`);
          });
        }
        
        console.log('');
        console.log('Processing with Mastra AI...');
        
        const mastraResult = mastra.processInput({
          text: enhanced.enhanced,
          type: 'voice',
          metadata: {
            confidence: enhanced.confidence || 0.9,
            language: 'ja-JP',
            enhanced: true
          }
        });
        
        console.log('');
        console.log('Mastra AI Result:');
        console.log('----------------');
        console.log(mastraResult);
      } catch (error) {
        console.error('Error enhancing transcription:', error);
      }
    }
    
    console.log('');
    console.log('Example completed.');
  })
  .catch((error) => {
    console.error('Error:', error);
  });
