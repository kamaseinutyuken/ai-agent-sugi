/**
 * Mastra AI Framework - Voice Recognition Example (Node.js)
 * 
 * This example demonstrates how to use the Mastra AI Voice component
 * with Google Cloud Speech-to-Text in a Node.js environment.
 * 
 * To run this example:
 * 1. Set your Google Cloud API key in the GOOGLE_CLOUD_API_KEY environment variable
 * 2. Install the required dependencies: npm install @google-cloud/speech
 * 3. Run the example: node examples/voice-recognition-node.js
 */

const fs = require('fs');
const path = require('path');
const { Voice } = require('../src/mastra');

const apiKey = process.env.GOOGLE_CLOUD_API_KEY;

if (!apiKey) {
  console.error('Error: GOOGLE_CLOUD_API_KEY environment variable is not set');
  console.error('Please set your Google Cloud API key in the GOOGLE_CLOUD_API_KEY environment variable');
  process.exit(1);
}

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

const audioFile = path.join(__dirname, 'audio-sample.wav');
if (!fs.existsSync(audioFile)) {
  console.log('Audio sample file not found. Creating a sample audio file...');
  
  if (!fs.existsSync(path.dirname(audioFile))) {
    fs.mkdirSync(path.dirname(audioFile), { recursive: true });
  }
  
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

console.log(`Processing audio file: ${audioFile}`);
const audio = fs.readFileSync(audioFile);

voice.speechToText(audio, { language: 'ja-JP' })
  .then(async (result) => {
    console.log('Speech-to-Text Result:');
    console.log('Transcription:', result.text);
    console.log('Confidence:', result.confidence);
    console.log('Metadata:', result.metadata);
    
    console.log('\nEnhancing transcription with AI...');
    const enhanced = await voice.enhanceTranscription(result.text);
    
    console.log('Enhanced Transcription:');
    console.log('Original:', enhanced.original);
    console.log('Enhanced:', enhanced.enhanced);
    console.log('Confidence:', enhanced.confidence);
    
    if (enhanced.changes && enhanced.changes.length > 0) {
      console.log('Changes:');
      enhanced.changes.forEach((change, index) => {
        console.log(`  ${index + 1}. ${change.type}: "${change.original}" -> "${change.enhanced}"`);
      });
    }
  })
  .catch((error) => {
    console.error('Error:', error);
  });

console.log('\nSimulating streaming recognition...');
console.log('(In a real application, this would use a microphone input stream)');

const mockAudioStream = {
  on: (event, callback) => {
    if (event === 'data') {
      setTimeout(() => {
        callback(Buffer.from('Mock audio data'));
      }, 1000);
    }
  },
  
  start: () => {
    console.log('Started mock audio stream');
  },
  
  stop: () => {
    console.log('Stopped mock audio stream');
  }
};

const streamingController = voice.startListening(
  { language: 'ja-JP' },
  (result) => {
    console.log('Streaming Recognition Result:');
    
    if (result.text) {
      console.log('Transcription:', result.text);
    }
    
    if (result.enhanced) {
      console.log('Enhanced:', result.enhanced);
    }
    
    if (result.isFinal) {
      console.log('Final: Yes');
    } else {
      console.log('Final: No');
    }
    
    if (result.confidence) {
      console.log('Confidence:', result.confidence);
    }
  },
  (error) => {
    console.error('Streaming Error:', error);
  }
);

if (streamingController) {
  setTimeout(() => {
    console.log('Sending mock audio data to streaming recognition...');
    streamingController.write(Buffer.from('Mock audio data'));
  }, 2000);
  
  setTimeout(() => {
    console.log('Stopping streaming recognition...');
    streamingController.stop();
    
    console.log('\nExample completed.');
  }, 5000);
} else {
  console.log('Streaming recognition not available in this environment.');
  console.log('\nExample completed.');
}
