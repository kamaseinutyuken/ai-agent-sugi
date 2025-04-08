# Mastra AI Voice Recognition

This module provides voice recognition capabilities for the Mastra AI framework, with a focus on Google Cloud Speech-to-Text integration.

## Features

- Browser-based voice recognition using the Web Speech API
- Google Cloud Speech-to-Text integration for high-quality speech recognition
- AI-based transcription enhancement to improve recognition quality
- Support for both streaming and file-based speech recognition
- Multi-language support with a focus on Japanese (ja-JP)

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

// Start listening for speech
const controller = voice.startListening(
  { language: 'ja-JP' },
  (result) => {
    console.log('Transcription:', result.text);
    
    // If the transcription was enhanced by AI
    if (result.enhanced) {
      console.log('Enhanced:', result.enhanced);
    }
  },
  (error) => {
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

### Converting Audio Files to Text

```javascript
const fs = require('fs');
const { Voice } = require('mastra-ai');

// Create a voice system with Google Cloud Speech-to-Text
const voice = Voice.createVoice({
  provider: 'google-cloud',
  apiKey: 'YOUR_GOOGLE_CLOUD_API_KEY',
  language: 'ja-JP'
});

// Read an audio file
const audio = fs.readFileSync('audio.wav');

// Convert the audio to text
voice.speechToText(audio, { language: 'ja-JP' })
  .then((result) => {
    console.log('Transcription:', result.text);
    console.log('Confidence:', result.confidence);
    console.log('Metadata:', result.metadata);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
```

### Enhancing Transcriptions with AI

```javascript
const { Voice } = require('mastra-ai');

// Create a voice system with an AI provider for enhancement
const voice = Voice.createVoice({
  aiProvider: {
    call: async (params) => {
      // This would be your AI provider's API call
      // For example, OpenAI's GPT API
      return {
        text: 'Enhanced transcription'
      };
    }
  }
});

// Enhance a transcription
voice.enhanceTranscription('This is a transcription to enhance')
  .then((result) => {
    console.log('Original:', result.original);
    console.log('Enhanced:', result.enhanced);
    console.log('Confidence:', result.confidence);
    console.log('Changes:', result.changes);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
```

## Google Cloud Speech-to-Text Setup

To use Google Cloud Speech-to-Text, you need to:

1. Create a Google Cloud account if you don't have one
2. Create a new project in the Google Cloud Console
3. Enable the Speech-to-Text API for your project
4. Create an API key or service account credentials
5. Install the Google Cloud Speech-to-Text client library:

```bash
npm install @google-cloud/speech
```

6. Configure the Mastra AI Voice component with your API key:

```javascript
const voice = Voice.createVoice({
  provider: 'google-cloud',
  apiKey: 'YOUR_GOOGLE_CLOUD_API_KEY',
  language: 'ja-JP'
});
```

## Browser Support

The browser-based voice recognition uses the Web Speech API, which is supported in most modern browsers. However, it may not be available in all browsers or may require user permission to access the microphone.

To check if browser-based voice recognition is available:

```javascript
const voice = Voice.createVoice();
const providers = voice.getAvailableProviders();

if (providers.browser) {
  console.log('Browser-based voice recognition is available');
} else {
  console.log('Browser-based voice recognition is not available');
}
```

## Node.js Support

In Node.js environments, only the Google Cloud Speech-to-Text provider is available for speech recognition. The browser-based voice recognition is not available in Node.js.

To check if Google Cloud Speech-to-Text is available:

```javascript
const voice = Voice.createVoice({
  provider: 'google-cloud',
  apiKey: 'YOUR_GOOGLE_CLOUD_API_KEY'
});

const providers = voice.getAvailableProviders();

if (providers['google-cloud']) {
  console.log('Google Cloud Speech-to-Text is available');
} else {
  console.log('Google Cloud Speech-to-Text is not available');
}
```
