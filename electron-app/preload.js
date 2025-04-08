/**
 * Mastra AI Voice Recognition - Electron Preload Script
 * 
 * This script runs in the renderer process before the web page is loaded.
 * It provides a secure bridge between the renderer process and the main process.
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  startVoiceRecognition: () => ipcRenderer.invoke('start-voice-recognition'),
  stopVoiceRecognition: () => ipcRenderer.invoke('stop-voice-recognition'),
  
  processAudioFile: (filePath) => ipcRenderer.invoke('process-audio-file', filePath),
  processText: (text) => ipcRenderer.invoke('process-text', text),
  
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  saveFileDialog: (defaultPath) => ipcRenderer.invoke('save-file-dialog', defaultPath),
  saveTextToFile: (filePath, text) => ipcRenderer.invoke('save-text-to-file', filePath, text),
  
  onVoiceRecognitionResult: (callback) => {
    ipcRenderer.on('voice-recognition-result', (event, result) => callback(result));
    return () => {
      ipcRenderer.removeAllListeners('voice-recognition-result');
    };
  }
});
