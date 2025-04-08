/**
 * Mastra AI Framework - Express Voice Recognition Server Example
 * 
 * This example demonstrates how to create a simple Express server that
 * provides an API endpoint for speech-to-text conversion using Google Cloud Speech-to-Text.
 * 
 * To run this example:
 * 1. Set your Google Cloud API key in the GOOGLE_CLOUD_API_KEY environment variable
 * 2. Install the required dependencies: npm install express multer @google-cloud/speech
 * 3. Run the example: node examples/express-voice-server.js
 * 4. Send a POST request to http://localhost:3000/api/speech-to-text with an audio file
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Voice } = require('../src/mastra');
const { MastraAI } = require('../src/mastra');

const app = express();
const port = 3000;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

const apiKey = process.env.GOOGLE_CLOUD_API_KEY;

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

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());

app.post('/api/speech-to-text', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No audio file was uploaded'
      });
    }
    
    const language = req.body.language || 'ja-JP';
    
    const audioFilePath = req.file.path;
    
    const audio = fs.readFileSync(audioFilePath);
    
    const result = await voice.speechToText(audio, { language });
    
    let enhancedResult = null;
    if (req.body.enhance === 'true') {
      enhancedResult = await voice.enhanceTranscription(result.text, { language });
    }
    
    const mastraResult = mastra.processInput({
      text: enhancedResult ? enhancedResult.enhanced : result.text,
      type: 'voice',
      metadata: {
        confidence: result.confidence || 0.9,
        language,
        enhanced: !!enhancedResult
      }
    });
    
    fs.unlinkSync(audioFilePath);
    
    res.json({
      success: true,
      result: {
        text: result.text,
        confidence: result.confidence,
        metadata: result.metadata,
        enhanced: enhancedResult ? enhancedResult.enhanced : null,
        mastra: mastraResult
      }
    });
  } catch (error) {
    console.error('Error processing audio:', error);
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/process-text', (req, res) => {
  try {
    const text = req.body.text;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'No text was provided'
      });
    }
    
    const result = mastra.processInput({
      text,
      type: 'text',
      metadata: {
        language: req.body.language || 'ja-JP'
      }
    });
    
    res.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Error processing text:', error);
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (apiKey) {
  app.listen(port, () => {
    console.log(`Mastra AI Voice Recognition Server running at http://localhost:${port}`);
    console.log('API endpoints:');
    console.log('  POST /api/speech-to-text - Convert audio to text');
    console.log('  POST /api/process-text - Process text with Mastra AI');
  });
} else {
  console.error('Error: GOOGLE_CLOUD_API_KEY environment variable is not set');
  console.error('Please set your Google Cloud API key in the GOOGLE_CLOUD_API_KEY environment variable');
  process.exit(1);
}
