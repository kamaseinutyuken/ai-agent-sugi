# Google Cloud Speech-to-Text Integration Guide

This guide explains how to set up and use the Google Cloud Speech-to-Text integration with the Mastra AI framework.

## Prerequisites

1. A Google Cloud account
2. Google Cloud Speech-to-Text API enabled
3. Google Cloud API key or service account credentials

## Setup

### 1. Create a Google Cloud Account

If you don't have a Google Cloud account, you can create one at [cloud.google.com](https://cloud.google.com/).

### 2. Enable the Speech-to-Text API

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select or create a project
3. Navigate to "APIs & Services" > "Library"
4. Search for "Speech-to-Text API"
5. Click on the API and click "Enable"

### 3. Create API Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the API key for use with Mastra AI

### 4. Install Required Dependencies

```bash
npm install @google-cloud/speech
```

## Usage

### Basic Usage

```javascript
const { Voice } = require('mastra-ai');

// Create a voice system with Google Cloud Speech-to-Text
const voice = Voice.createVoice({
  provider: 'google-cloud',
  apiKey: 'YOUR_GOOGLE_CLOUD_API_KEY',
  language: 'ja-JP'
});

// Convert an audio file to text
const fs = require('fs');
const audioFile = fs.readFileSync('audio.wav');

voice.speechToText(audioFile, { language: 'ja-JP' })
  .then(result => {
    console.log('Transcription:', result.text);
    console.log('Confidence:', result.confidence);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

### Streaming Recognition

```javascript
const { Voice } = require('mastra-ai');

// Create a voice system with Google Cloud Speech-to-Text
const voice = Voice.createVoice({
  provider: 'google-cloud',
  apiKey: 'YOUR_GOOGLE_CLOUD_API_KEY',
  language: 'ja-JP'
});

// Create a microphone stream (using a library like node-microphone)
const Microphone = require('node-microphone');
const mic = new Microphone();
const stream = mic.startRecording();

// Start streaming recognition
const controller = voice.startListening(
  { language: 'ja-JP' },
  result => {
    console.log('Transcription:', result.text);
    
    if (result.isFinal) {
      console.log('Final: Yes');
    } else {
      console.log('Final: No');
    }
    
    if (result.confidence) {
      console.log('Confidence:', result.confidence);
    }
  },
  error => {
    console.error('Error:', error);
  }
);

// Pipe the microphone stream to the controller
stream.on('data', data => {
  controller.write(data);
});

// Stop after 10 seconds
setTimeout(() => {
  controller.stop();
  mic.stopRecording();
}, 10000);
```

### AI-Enhanced Transcription

```javascript
const { Voice } = require('mastra-ai');
const { OpenAI } = require('openai');

// Create an OpenAI client
const openai = new OpenAI({
  apiKey: 'YOUR_OPENAI_API_KEY'
});

// Create a voice system with Google Cloud Speech-to-Text and OpenAI for enhancement
const voice = Voice.createVoice({
  provider: 'google-cloud',
  apiKey: 'YOUR_GOOGLE_CLOUD_API_KEY',
  language: 'ja-JP',
  aiProvider: {
    call: async (params) => {
      // Use OpenAI to enhance the transcription
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant that improves speech-to-text transcriptions. Fix grammar, remove filler words, and add punctuation while preserving the original meaning.'
          },
          {
            role: 'user',
            content: params.prompt
          }
        ],
        max_tokens: 200
      });
      
      return {
        text: response.choices[0].message.content
      };
    }
  }
});

// Convert an audio file to text and enhance it
const fs = require('fs');
const audioFile = fs.readFileSync('audio.wav');

voice.speechToText(audioFile, { language: 'ja-JP' })
  .then(async result => {
    console.log('Original Transcription:', result.text);
    
    // Enhance the transcription
    const enhanced = await voice.enhanceTranscription(result.text);
    
    console.log('Enhanced Transcription:', enhanced.enhanced);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

## Browser Usage

In browser environments, the Google Cloud Speech-to-Text API is not directly accessible due to CORS restrictions. Instead, you should:

1. Create a server-side API endpoint that proxies requests to Google Cloud
2. Use the browser's Web Speech API for client-side recognition
3. Send the results to your server for further processing if needed

Example browser usage:

```javascript
// Import the Mastra AI library
const { Voice } = require('mastra-ai');

// Create a voice system with browser-based recognition
const voice = Voice.createVoice({
  provider: 'browser',
  language: 'ja-JP',
  continuous: true,
  interimResults: true
});

// Start listening for speech
const controller = voice.startListening(
  { language: 'ja-JP' },
  result => {
    console.log('Interim:', result.interimTranscript);
    console.log('Final:', result.finalTranscript);
    
    if (result.confidence) {
      console.log('Confidence:', result.confidence);
    }
  },
  error => {
    console.error('Error:', error);
  }
);

// Stop listening after 10 seconds
setTimeout(() => {
  if (controller) {
    controller.stop();
  }
}, 10000);
```

## Advanced Configuration

### Language Support

Google Cloud Speech-to-Text supports many languages. Here are some common language codes:

- Japanese: `ja-JP`
- English (US): `en-US`
- English (UK): `en-GB`
- Chinese (Simplified): `zh-CN`
- Korean: `ko-KR`

### Recognition Config

You can customize the recognition configuration:

```javascript
voice.speechToText(audioFile, {
  language: 'ja-JP',
  sampleRateHertz: 16000,
  encoding: 'LINEAR16',
  model: 'default',
  useEnhanced: true
});
```

### Error Handling

Always implement proper error handling:

```javascript
try {
  const result = await voice.speechToText(audioFile);
  console.log('Transcription:', result.text);
} catch (error) {
  if (error.code === 'ENOENT') {
    console.error('Audio file not found');
  } else if (error.code === 'INVALID_ARGUMENT') {
    console.error('Invalid audio format');
  } else {
    console.error('Error:', error);
  }
}
```

## Troubleshooting

### API Key Issues

If you encounter authentication errors:

1. Verify that your API key is correct
2. Check that the Speech-to-Text API is enabled for your project
3. Ensure your API key has the necessary permissions

### Audio Format Issues

Google Cloud Speech-to-Text supports various audio formats:

- LINEAR16: Uncompressed 16-bit signed little-endian samples
- FLAC: Free Lossless Audio Codec
- MP3: MPEG Audio Layer III
- OGG_OPUS: Opus encoded audio frames in an Ogg container

If you encounter format issues, convert your audio to a supported format using a library like FFmpeg.

### Rate Limiting

Google Cloud Speech-to-Text has usage limits. If you exceed these limits, you may encounter rate limiting errors. Consider implementing retry logic with exponential backoff.

## Resources

- [Google Cloud Speech-to-Text Documentation](https://cloud.google.com/speech-to-text/docs)
- [Google Cloud Speech-to-Text Node.js Client](https://github.com/googleapis/nodejs-speech)
- [Google Cloud Speech-to-Text API Reference](https://cloud.google.com/speech-to-text/docs/reference/rest)
