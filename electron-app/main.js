/**
 * Mastra AI Voice Recognition - Electron Main Process
 * 
 * This is the main process file for the Electron application.
 * It creates the application window and handles the application lifecycle.
 */

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { Voice, MastraAI } = require('../src/mastra');

let mainWindow;

const GOOGLE_CLOUD_API_KEY = 'AIzaSyCQt0YdI8KrFB2rfq1_Z8Jdvl9WejRQeEY';

const mastra = new MastraAI();

const voice = Voice.createVoice({
  provider: 'google-cloud',
  apiKey: GOOGLE_CLOUD_API_KEY,
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

/**
 * Create the main application window
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets', 'icon.png')
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * Initialize the application when Electron is ready
 */
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

/**
 * Quit the application when all windows are closed (except on macOS)
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * Handle IPC messages from the renderer process
 */

ipcMain.handle('start-voice-recognition', async (event) => {
  try {
    console.log('Starting voice recognition...');
    
    return { success: true, message: 'Voice recognition started' };
  } catch (error) {
    console.error('Error starting voice recognition:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('stop-voice-recognition', async (event) => {
  try {
    console.log('Stopping voice recognition...');
    
    return { success: true, message: 'Voice recognition stopped' };
  } catch (error) {
    console.error('Error stopping voice recognition:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('process-audio-file', async (event, filePath) => {
  try {
    console.log(`Processing audio file: ${filePath}`);
    
    const audio = fs.readFileSync(filePath);
    
    const result = await voice.speechToText(audio, { language: 'ja-JP' });
    
    let enhancedResult = null;
    if (result.text) {
      enhancedResult = await voice.enhanceTranscription(result.text, { language: 'ja-JP' });
    }
    
    const mastraResult = mastra.processInput({
      text: enhancedResult ? enhancedResult.enhanced : result.text,
      type: 'voice',
      metadata: {
        confidence: result.confidence || 0.9,
        language: 'ja-JP',
        enhanced: !!enhancedResult
      }
    });
    
    return {
      success: true,
      result: {
        text: result.text,
        confidence: result.confidence,
        metadata: result.metadata,
        enhanced: enhancedResult ? enhancedResult.enhanced : null,
        mastra: mastraResult
      }
    };
  } catch (error) {
    console.error('Error processing audio file:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('process-text', async (event, text) => {
  try {
    console.log(`Processing text: ${text}`);
    
    const result = mastra.processInput({
      text,
      type: 'text',
      metadata: {
        language: 'ja-JP'
      }
    });
    
    return {
      success: true,
      result
    };
  } catch (error) {
    console.error('Error processing text:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Audio Files', extensions: ['wav', 'mp3', 'ogg', 'flac'] }
    ]
  });
  
  if (result.canceled) {
    return { canceled: true };
  }
  
  return { canceled: false, filePath: result.filePaths[0] };
});

ipcMain.handle('save-file-dialog', async (event, defaultPath) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath,
    filters: [
      { name: 'Text Files', extensions: ['txt'] },
      { name: 'JSON Files', extensions: ['json'] }
    ]
  });
  
  if (result.canceled) {
    return { canceled: true };
  }
  
  return { canceled: false, filePath: result.filePath };
});

ipcMain.handle('save-text-to-file', async (event, filePath, text) => {
  try {
    fs.writeFileSync(filePath, text);
    return { success: true };
  } catch (error) {
    console.error('Error saving text to file:', error);
    return { success: false, error: error.message };
  }
});
