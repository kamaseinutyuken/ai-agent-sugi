/**
 * Mastra AI Framework - Browser-based Voice Recognition
 */

/**
 * Create a browser-based voice recognition system
 * @param {Object} config - Configuration for the voice recognition system
 * @returns {Object} The voice recognition system
 */
function createBrowserVoiceRecognition(config = {}) {
  const language = config.language || 'ja-JP';
  const continuous = config.continuous || false;
  const interimResults = config.interimResults || true;
  
  const isSpeechRecognitionSupported = () => {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  };
  
  const createRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = language;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    
    return recognition;
  };
  
  return {
    /**
     * Start listening for speech
     * @param {Object} options - Options for speech recognition
     * @param {Function} onResult - Callback for speech recognition results
     * @param {Function} onError - Callback for speech recognition errors
     * @returns {Object} The recognition controller
     */
    startListening: (options = {}, onResult, onError) => {
      if (!isSpeechRecognitionSupported()) {
        if (onError) {
          onError(new Error('Speech recognition is not supported in this browser'));
        }
        return null;
      }
      
      const recognition = createRecognition();
      let finalTranscript = '';
      
      recognition.onresult = (event) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (onResult) {
          onResult({
            finalTranscript,
            interimTranscript,
            fullTranscript: finalTranscript + interimTranscript,
            confidence: event.results[0][0].confidence
          });
        }
      };
      
      recognition.onerror = (event) => {
        if (onError) {
          onError(new Error(`Speech recognition error: ${event.error}`));
        }
      };
      
      recognition.start();
      
      return {
        stop: () => {
          recognition.stop();
        },
        abort: () => {
          recognition.abort();
        }
      };
    }
  };
}

module.exports = {
  createBrowserVoiceRecognition
};
