/**
 * Mastra AI Framework - Voice Component
 */
const { createBrowserVoiceRecognition } = require('./browser');
const { createTranscriptionEnhancer } = require('./enhancer');
const { createGoogleCloudSpeechToText } = require('./google-cloud');

/**
 * Create a voice system
 * @param {Object} config - Configuration for the voice system
 * @returns {Object} The voice system
 */
function createVoice(config = {}) {
  const provider = config.provider || "default";
  const apiKey = config.apiKey || "";
  const language = config.language || "ja-JP";
  
  let browserVoiceRecognition = null;
  if (typeof window !== 'undefined') {
    browserVoiceRecognition = createBrowserVoiceRecognition({
      language,
      continuous: config.continuous || false,
      interimResults: config.interimResults || true
    });
  }
  
  let googleCloudSpeechToText = null;
  if (provider === 'google-cloud') {
    googleCloudSpeechToText = createGoogleCloudSpeechToText({
      apiKey,
      language
    });
  }
  
  const transcriptionEnhancer = createTranscriptionEnhancer({
    aiProvider: config.aiProvider || null
  });
  
  return {
    /**
     * Convert speech to text
     * @param {Buffer|string} audio - Audio data or path to audio file
     * @param {Object} options - Options for speech-to-text conversion
     * @returns {Promise<Object>} The speech-to-text result
     */
    speechToText: async (audio, options = {}) => {
      console.log(`Converting speech to text using ${provider} provider`);
      
      if (audio) {
        if (provider === 'google-cloud' && googleCloudSpeechToText) {
          return googleCloudSpeechToText.recognize(audio, options);
        }
        
        return {
          text: "Transcribed text would appear here",
          confidence: 0.95,
          metadata: {
            duration_seconds: 5.2,
            language: options.language || language,
            provider
          }
        };
      }
      
      throw new Error('Audio data is required for speech-to-text conversion');
    },
    
    /**
     * Convert text to speech
     * @param {string} text - Text to convert to speech
     * @param {Object} options - Options for text-to-speech conversion
     * @returns {Promise<Object>} The text-to-speech result
     */
    textToSpeech: async (text, options = {}) => {
      console.log(`Converting text to speech using ${provider} provider`);
      
      return {
        audio: Buffer.from("Audio data would be here"),
        format: options.format || "mp3",
        metadata: {
          duration_seconds: 3.5,
          voice: options.voice || "default",
          provider
        }
      };
    },
    
    /**
     * Start listening for speech from the microphone
     * @param {Object} options - Options for speech recognition
     * @param {Function} onResult - Callback for speech recognition results
     * @param {Function} onError - Callback for speech recognition errors
     * @returns {Object|null} The recognition controller or null if not supported
     */
    startListening: (options = {}, onResult, onError) => {
      if (provider === 'google-cloud' && googleCloudSpeechToText && typeof window === 'undefined') {
        return googleCloudSpeechToText.startStreaming(
          options,
          async (result) => {
            if (result.text && result.isFinal && config.aiProvider) {
              try {
                const enhanced = await transcriptionEnhancer.enhance(
                  result.text,
                  { language: options.language || language }
                );
                
                result.enhanced = enhanced.enhanced;
                
                if (onResult) {
                  onResult(result);
                }
              } catch (error) {
                console.error('Error enhancing transcription:', error);
                
                if (onResult) {
                  onResult(result);
                }
              }
            } else {
              if (onResult) {
                onResult(result);
              }
            }
          },
          onError
        );
      }
      
      if (browserVoiceRecognition) {
        return browserVoiceRecognition.startListening(
          options,
          async (result) => {
            if (result.finalTranscript && config.aiProvider) {
              try {
                const enhanced = await transcriptionEnhancer.enhance(
                  result.finalTranscript,
                  { language: options.language || language }
                );
                
                result.enhanced = enhanced.enhanced;
                
                if (onResult) {
                  onResult(result);
                }
              } catch (error) {
                console.error('Error enhancing transcription:', error);
                
                if (onResult) {
                  onResult(result);
                }
              }
            } else {
              if (onResult) {
                onResult(result);
              }
            }
          },
          onError
        );
      }
      
      const error = new Error('No speech recognition method is available in this environment');
      if (onError) {
        onError(error);
      }
      return null;
    },
    
    /**
     * Enhance a transcription with AI
     * @param {string} transcription - The transcription to enhance
     * @param {Object} options - Options for enhancement
     * @returns {Promise<Object>} The enhanced transcription
     */
    enhanceTranscription: async (transcription, options = {}) => {
      return transcriptionEnhancer.enhance(
        transcription,
        { language: options.language || language }
      );
    },
    
    /**
     * Get the available providers
     * @returns {Object} The available providers
     */
    getAvailableProviders: () => {
      const providers = {
        default: true
      };
      
      if (browserVoiceRecognition) {
        providers.browser = true;
      }
      
      if (googleCloudSpeechToText) {
        providers['google-cloud'] = true;
      }
      
      return providers;
    }
  };
}

module.exports = {
  createVoice
};
