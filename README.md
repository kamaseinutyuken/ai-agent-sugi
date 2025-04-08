# Mastra AI Framework

Mastra AIフレームワークは、構造化されたワークフロー、ツール、評価を備えたインテリジェントなエージェントシステムを構築するための包括的なシステムです。このフレームワークはユーザー入力を処理し、情報を分析・構造化し、特定の区切り文字で書式設定された出力を生成します。

## 特徴

- **Workflow**: エージェントの行動を導く構造化されたステップとロジック
- **Agent**: タスクを実行し、情報を管理し、ユーザーとインターフェースする主要なエンティティ
- **Tools**: エージェントが特定のタスクを実行するために呼び出す再利用可能な関数/サービス
- **Memory**: 状態、会話、コンテキストデータのためのエージェントの内部ストレージ
- **Integrations**: 外部リソースに接続し、Mastraの機能を拡張
- **RAG**: 外部知識ベースを活用して情報に基づいた応答を生成
- **Evaluations**: 複数の次元でエージェントのパフォーマンスを評価
- **Voice**: 音声入力と出力の機能を有効化

## インストール

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/mastra-ai.git
cd mastra-ai

# 依存関係をインストール
npm install
```

または、以下を使用して新しいMastraプロジェクトを作成できます：

```bash
npm create mastra@latest
```

## 使用方法

### 基本的な例

```javascript
const { MastraAI } = require('./src/mastra');
const { Workflow, Agent, Tool, Memory } = require('./src/mastra/core');

// Mastra AIフレームワークを初期化
const mastra = new MastraAI();

// ワークフローを作成
const workflow = new Workflow('task-automation', [
  {
    id: 'define-task',
    type: 'agent',
    agent_name: 'task-definer',
    conditions: []
  }
]);

// エージェントを作成
const agent = new Agent('task-definer', {}, {}, [
  {
    name: 'define-task-tool',
    function: (input) => {
      return {
        task_definition: 'Defined task based on input',
        status: 'success'
      };
    }
  }
]);

// コンポーネントを登録
mastra.registerWorkflow(workflow);
mastra.registerAgent(agent);

// ユーザー入力を処理
const userInput = "フレームワークを一般化する";
const response = mastra.processInput(userInput);

console.log(response);
```

### Express API の例

```javascript
const express = require('express');
const { MastraAI } = require('./src/mastra');

const app = express();
const port = 3000;
const mastra = new MastraAI();

// Expressミドルウェアを設定
app.use(express.json());

// ユーザー入力を処理するAPIエンドポイント
app.post('/api/process', (req, res) => {
  const userInput = req.body.input || "フレームワークを一般化する";
  const response = mastra.processInput(userInput);
  res.json({ response });
});

// サーバーを起動
app.listen(port, () => {
  console.log(`Mastra AI Framework Example running at http://localhost:${port}`);
});
```

## 出力フォーマット

フレームワークは特定のフォーマットで区切り文字付きの出力を生成します：

```
◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢
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
...

🧩 [エージェントの実行スタック]
①
Task: ユーザー入力タスクのワークフロー化
Assigned Agent: LLM (GPT-4.5)
Description: 入力タスクの構造化と手順の明確化
Expected Outcome: 実行可能なWorkflowの生成
...

🛠️ [必要なプロンプトとツールの例]
Prompt例：
あなたはMastraエージェントです。次のタスクをワークフロー化し、自動で実行してください：
タスク：「（ここにユーザーのタスク入力）」
使用ツールは次の中から適切に選択します：（ツール名リスト）

必要ツール例：
AI SDK (OpenAI GPT-4.5 API)
Vector_DB (Pinecone)
...

🔄 [フィードバックループ例]
【実行結果の評価】
- 完全性：達成率95%（未達部分の理由明示）
- 関連性：ユーザー要求に完全に一致（スコア98%）
- 忠実性：データ精度99%
- テキスト品質：ユーザー理解しやすい（評価◎）

【改善ポイント】
- 未達5％部分の要因分析（ツールの改善、Workflow調整）
◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢
```

## API ドキュメント

### コアコンポーネント

#### Workflow

```javascript
const workflow = new Workflow(workflowId, steps, conditions, parameters);
```

- `workflowId`: ワークフローの一意の識別子
- `steps`: ワークフローのステップのリスト
- `conditions`: ワークフローの条件のリスト
- `parameters`: ワークフローのパラメータ

#### Agent

```javascript
const agent = new Agent(name, state, memory, tools);
```

- `name`: エージェントの名前
- `state`: エージェントの初期状態
- `memory`: エージェントの初期メモリ
- `tools`: エージェントが利用できるツール

#### Tool

```javascript
const tool = new Tool(name, inputs, outputs, executorFunction);
```

- `name`: ツールの名前
- `inputs`: ツールの入力仕様
- `outputs`: ツールの出力仕様
- `executorFunction`: ツールを実行する関数

#### Memory

```javascript
const memory = new Memory(memoryId, conversationHistory, context, recallMethod);
```

- `memoryId`: メモリの一意の識別子
- `conversationHistory`: 初期会話履歴
- `context`: 初期コンテキスト
- `recallMethod`: 情報を思い出すために使用される方法

### 追加コンポーネント

#### RAG (Retrieval-Augmented Generation)

```javascript
const rag = createRAG(config);
```

- `config`: RAGシステムの設定

#### Evaluations

```javascript
const evaluations = createEvaluations(config);
```

- `config`: 評価システムの設定

#### Voice

```javascript
const voice = createVoice({
  provider: 'google-cloud',
  apiKey: 'YOUR_GOOGLE_CLOUD_API_KEY',
  language: 'ja-JP',
  aiProvider: customAIProvider
});
```

- `provider`: 音声認識プロバイダー（'browser', 'google-cloud'）
- `apiKey`: Google Cloud Speech-to-Text APIキー
- `language`: 音声認識の言語（デフォルト: 'ja-JP'）
- `aiProvider`: 音声認識結果を強化するためのAIプロバイダー
- `continuous`: 連続認識モード（ブラウザ音声認識用）
- `interimResults`: 中間結果を返すかどうか（ブラウザ音声認識用）

##### 音声認識の使用例

```javascript
// ブラウザでの音声認識
const voice = createVoice({ language: 'ja-JP' });

const controller = voice.startListening(
  { language: 'ja-JP' },
  (result) => {
    console.log('中間結果:', result.interimTranscript);
    console.log('最終結果:', result.finalTranscript);
    
    if (result.enhanced) {
      console.log('AI強化結果:', result.enhanced);
    }
  },
  (error) => {
    console.error('エラー:', error);
  }
);

// 10秒後に停止
setTimeout(() => {
  controller.stop();
}, 10000);
```

##### Google Cloud Speech-to-Text の使用例

```javascript
const voice = createVoice({
  provider: 'google-cloud',
  apiKey: 'YOUR_GOOGLE_CLOUD_API_KEY',
  language: 'ja-JP'
});

// 音声ファイルをテキストに変換
const fs = require('fs');
const audioFile = fs.readFileSync('audio.wav');

voice.speechToText(audioFile, { language: 'ja-JP' })
  .then(result => {
    console.log('認識結果:', result.text);
    console.log('信頼度:', result.confidence);
  })
  .catch(error => {
    console.error('エラー:', error);
  });
```

#### Integrations

```javascript
const aiSDK = createAISDKIntegration(config);
const mcp = createMCPIntegration(config);
const externalAPI = createExternalAPIIntegration(config);
const database = createDatabaseIntegration(config);
const vectorDB = createVectorDBIntegration(config);
```

- `config`: 統合の設定

## ライセンス

ISC
