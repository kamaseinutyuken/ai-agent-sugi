/**
 * Mastra AI Voice Recognition - Renderer Process
 * 
 * This script runs in the renderer process and handles the UI interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
  const startRecordingButton = document.getElementById('startRecording');
  const stopRecordingButton = document.getElementById('stopRecording');
  const openAudioFileButton = document.getElementById('openAudioFile');
  const processTextButton = document.getElementById('processText');
  const clearTextButton = document.getElementById('clearText');
  const saveTextButton = document.getElementById('saveText');
  const textInput = document.getElementById('textInput');
  const recordingIndicator = document.getElementById('recordingIndicator');
  const recordingStatus = document.getElementById('recordingStatus');
  const originalText = document.getElementById('originalText');
  const enhancedText = document.getElementById('enhancedText');
  const mastraResult = document.getElementById('mastraResult');
  const confidenceLevel = document.getElementById('confidenceLevel');
  const confidenceValue = document.getElementById('confidenceValue');
  const enhancementInfo = document.getElementById('enhancementInfo');
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabPanes = document.querySelectorAll('.tab-pane');

  let isRecording = false;
  let currentResult = null;

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.getAttribute('data-tab');
      
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      tabPanes.forEach(pane => pane.classList.remove('active'));
      document.getElementById(tabId).classList.add('active');
    });
  });

  startRecordingButton.addEventListener('click', async () => {
    try {
      const response = await window.api.startVoiceRecognition();
      
      if (response.success) {
        isRecording = true;
        startRecordingButton.disabled = true;
        stopRecordingButton.disabled = false;
        recordingIndicator.classList.add('active');
        recordingStatus.textContent = '録音中...';
        
        simulateRecognitionResults();
      } else {
        alert(`録音開始エラー: ${response.error}`);
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('録音開始中にエラーが発生しました');
    }
  });

  stopRecordingButton.addEventListener('click', async () => {
    try {
      const response = await window.api.stopVoiceRecognition();
      
      if (response.success) {
        isRecording = false;
        startRecordingButton.disabled = false;
        stopRecordingButton.disabled = true;
        recordingIndicator.classList.remove('active');
        recordingStatus.textContent = '録音停止';
      } else {
        alert(`録音停止エラー: ${response.error}`);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      alert('録音停止中にエラーが発生しました');
    }
  });

  openAudioFileButton.addEventListener('click', async () => {
    try {
      const response = await window.api.openFileDialog();
      
      if (!response.canceled && response.filePath) {
        processAudioFile(response.filePath);
      }
    } catch (error) {
      console.error('Error opening audio file:', error);
      alert('音声ファイルを開く際にエラーが発生しました');
    }
  });

  processTextButton.addEventListener('click', async () => {
    const text = textInput.value.trim();
    
    if (!text) {
      alert('処理するテキストを入力してください');
      return;
    }
    
    try {
      const response = await window.api.processText(text);
      
      if (response.success) {
        displayResults({
          text,
          confidence: 1.0,
          enhanced: text,
          mastra: response.result
        });
      } else {
        alert(`テキスト処理エラー: ${response.error}`);
      }
    } catch (error) {
      console.error('Error processing text:', error);
      alert('テキスト処理中にエラーが発生しました');
    }
  });

  clearTextButton.addEventListener('click', () => {
    textInput.value = '';
    originalText.textContent = '音声認識結果がここに表示されます...';
    enhancedText.textContent = 'AI強化テキストがここに表示されます...';
    mastraResult.textContent = 'Mastra AI結果がここに表示されます...';
    confidenceLevel.style.width = '0%';
    confidenceValue.textContent = '0%';
    enhancementInfo.textContent = 'なし';
    currentResult = null;
  });

  saveTextButton.addEventListener('click', async () => {
    if (!currentResult) {
      alert('保存するテキストがありません');
      return;
    }
    
    try {
      const response = await window.api.saveFileDialog('mastra-result.txt');
      
      if (!response.canceled && response.filePath) {
        let content = '';
        
        if (document.getElementById('original').classList.contains('active')) {
          content = currentResult.text;
        } else if (document.getElementById('enhanced').classList.contains('active')) {
          content = currentResult.enhanced || currentResult.text;
        } else if (document.getElementById('mastra').classList.contains('active')) {
          content = typeof currentResult.mastra === 'string' 
            ? currentResult.mastra 
            : JSON.stringify(currentResult.mastra, null, 2);
        }
        
        const saveResponse = await window.api.saveTextToFile(response.filePath, content);
        
        if (saveResponse.success) {
          alert(`ファイルを保存しました: ${response.filePath}`);
        } else {
          alert(`ファイル保存エラー: ${saveResponse.error}`);
        }
      }
    } catch (error) {
      console.error('Error saving file:', error);
      alert('ファイル保存中にエラーが発生しました');
    }
  });

  async function processAudioFile(filePath) {
    try {
      recordingStatus.textContent = '音声ファイル処理中...';
      
      const response = await window.api.processAudioFile(filePath);
      
      if (response.success) {
        displayResults(response.result);
        textInput.value = response.result.enhanced || response.result.text;
      } else {
        alert(`音声ファイル処理エラー: ${response.error}`);
      }
      
      recordingStatus.textContent = '処理完了';
    } catch (error) {
      console.error('Error processing audio file:', error);
      alert('音声ファイル処理中にエラーが発生しました');
      recordingStatus.textContent = 'エラー';
    }
  }

  function displayResults(result) {
    currentResult = result;
    
    originalText.textContent = result.text || '認識テキストなし';
    
    const confidencePercent = Math.round((result.confidence || 0) * 100);
    confidenceLevel.style.width = `${confidencePercent}%`;
    confidenceValue.textContent = `${confidencePercent}%`;
    
    if (result.enhanced) {
      enhancedText.textContent = result.enhanced;
      
      const differences = calculateDifferences(result.text, result.enhanced);
      enhancementInfo.textContent = differences > 0 ? `${differences}箇所の改善` : '変更なし';
    } else {
      enhancedText.textContent = '強化テキストなし';
      enhancementInfo.textContent = 'なし';
    }
    
    if (result.mastra) {
      mastraResult.textContent = typeof result.mastra === 'string' 
        ? result.mastra 
        : JSON.stringify(result.mastra, null, 2);
    } else {
      mastraResult.textContent = 'Mastra AI結果なし';
    }
  }

  function calculateDifferences(original, enhanced) {
    if (!original || !enhanced) return 0;
    
    let count = 0;
    
    const maxLength = Math.max(original.length, enhanced.length);
    for (let i = 0; i < maxLength; i++) {
      if (original[i] !== enhanced[i]) {
        count++;
      }
    }
    
    return count;
  }

  function simulateRecognitionResults() {
    if (!isRecording) return;
    
    setTimeout(() => {
      const demoTexts = [
        'こんにちは、えーと、今日はいい天気ですね',
        'あのー、明日の会議についてですが、えっと、3時からでしたっけ',
        'えー、このプロジェクトの進捗状況を教えてください',
        'マストラAIフレームワークを使って、えっと、音声認識システムを構築したいです'
      ];
      
      const randomText = demoTexts[Math.floor(Math.random() * demoTexts.length)];
      
      const result = {
        text: randomText,
        confidence: 0.7 + Math.random() * 0.3,
        enhanced: randomText
          .replace(/えーと/g, '')
          .replace(/あのー/g, '')
          .replace(/えー/g, '')
          .replace(/えっと/g, '')
          .trim() + '。',
        mastra: `◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢
こんにちは。 Mastraフレームワークを活用したエージェントのタスク自動化プロセスについて、以下のように整理します。
🎯 [抽象化した意図]
Original Intent:
 Mastraエージェントを使用して、ユーザーがインプットしたタスクを自動化する方法を提供する。

Want or Need Intent:
 ユーザーはMastraフレームワークを通じて、インプットされたタスクを明確な手順でエージェントに自動化させたい。

🚩 [達成したい目標]
✅ Mastraエージェントを使ったタスク自動化の流れを明確化する
 ✅ ユーザー入力をワークフロー化し、実行可能な形式で整理する
 ✅ エージェントの割り当てとフィードバックループの明確化
 ✅ 必要なプロンプト・ツールを明示し、自動化可能な形にする

📌 [タスク分解]
[Task 1]
 入力されたユーザーのタスクを明確に定義する
 → Mastraフレームワーク「Workflow」を用いて構造化
（必要要素：ID, ステップ, 条件, パラメータ）
[Task 2]
 自動化対象のタスクに必要なツールの特定
 → Mastraフレームワークの「Tools」「Integrations」から適切なツールを選定
（API、DB、AI_SDKなど）
◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢`
      };
      
      displayResults(result);
      textInput.value = result.enhanced;
      
      if (isRecording) {
        setTimeout(simulateRecognitionResults, 5000);
      }
    }, 2000);
  }
});
