# Mastra AI Voice Recognition - Windows Application

This is a Windows desktop application for the Mastra AI Voice Recognition system, which uses Google Cloud Speech-to-Text for high-quality speech recognition and AI-powered transcription enhancement.

## Features

- **Voice Recognition**: Capture audio from your microphone and convert it to text
- **File Processing**: Process audio files and convert them to text
- **AI Enhancement**: Improve transcription quality by removing filler words and adding punctuation
- **Mastra AI Integration**: Process transcriptions with the Mastra AI framework
- **Multi-language Support**: Support for multiple languages, with a focus on Japanese (ja-JP)
- **Save Results**: Save transcriptions and Mastra AI results to files

## Installation

### Prerequisites

- Windows 11 or later
- Internet connection for Google Cloud Speech-to-Text API access

### Installation Steps

1. Download the latest installer from the [Releases](https://github.com/kamaseinutyuken/ai-agent-sugi/releases) page
2. Run the installer and follow the on-screen instructions
3. Launch the application from the Start menu or desktop shortcut

## Usage

### Voice Recognition

1. Launch the Mastra AI Voice Recognition application
2. Click the "マイク録音開始" (Start Recording) button
3. Speak into your microphone
4. Click the "録音停止" (Stop Recording) button when finished
5. View the transcription results in the "元のテキスト" (Original Text) tab
6. View the AI-enhanced transcription in the "AI強化テキスト" (AI Enhanced Text) tab
7. View the Mastra AI results in the "Mastra AI 結果" (Mastra AI Results) tab

### Audio File Processing

1. Launch the Mastra AI Voice Recognition application
2. Click the "音声ファイルを開く" (Open Audio File) button
3. Select an audio file from your computer
4. View the transcription results in the tabs

### Text Processing

1. Enter text in the text input area
2. Click the "テキスト処理" (Process Text) button
3. View the Mastra AI results in the "Mastra AI 結果" (Mastra AI Results) tab

### Saving Results

1. Process audio or text using one of the methods above
2. Select the tab containing the results you want to save
3. Click the "保存" (Save) button
4. Choose a location and filename for the saved results
5. Click "Save"

## Building from Source

### Prerequisites

- Node.js 16 or later
- npm or yarn

### Build Steps

1. Clone the repository:
   ```
   git clone https://github.com/kamaseinutyuken/ai-agent-sugi.git
   cd ai-agent-sugi/electron-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the application in development mode:
   ```
   npm run dev
   ```

4. Build the Windows installer:
   ```
   node build-windows.js
   ```

5. The installer will be created in the `dist` directory

## Configuration

The application uses the following configuration:

- Google Cloud Speech-to-Text API key: Set in the main.js file
- Default language: Japanese (ja-JP)
- AI enhancement: Configured in the main.js file

## Troubleshooting

### Microphone Access

If the application cannot access your microphone:

1. Check that your microphone is connected and working
2. Ensure that you have granted microphone access to the application
3. Restart the application

### Google Cloud Speech-to-Text API

If the application cannot connect to the Google Cloud Speech-to-Text API:

1. Check your internet connection
2. Verify that the API key is valid
3. Ensure that the Google Cloud Speech-to-Text API is enabled for your project

## License

This project is licensed under the ISC License.

## Acknowledgements

- [Electron](https://www.electronjs.org/) - Desktop application framework
- [Google Cloud Speech-to-Text](https://cloud.google.com/speech-to-text) - Speech recognition API
- [Mastra AI Framework](https://github.com/kamaseinutyuken/ai-agent-sugi) - AI framework for processing text
