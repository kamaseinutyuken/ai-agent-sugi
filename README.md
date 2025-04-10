# AI Agent Sugi - Mastra AI Excel Agent

複数のLLM（GPT-4 Turbo、Gemini 2.0、Claude 3、Mixtral）を連携させ、自動的にExcelファイルへの入力を行うVBAコード生成AIエージェント。

## システム概要

ユーザーがチャットで情報を提供またはExcelファイルをアップロードすると、システムは以下の処理を実行します：

### UI機能

- チャット送信可能なUI（React）
- Excelファイル(.xlsm)のアップロード機能
- 確定事項入力フォーム
  - 工事名（セルI9）
  - 施工場所（セルI11）
  - 工期（セルI13）
  - 作業者数（セルQ15）

### LLM連携機能（OpenRouter API）

以下のLLMを使用し、それぞれの役割を設定：

- GPT-4 Turbo：チャット内容の論理的構造化
- Gemini 2.0：Excelデータ構造の分析
- Claude 3：表現の曖昧さを明確化
- Mixtral：細かいニュアンスや例外処理の補完

### インタラクティブ質問プロセス

- 初回：工事名、施工場所、工期、作業員数など確定情報を聞く
- 2回目以降：LLMが不足と判断した情報を追加で質問
- 最終確認：入力項目を整理してユーザーに最終確認をする

### ナレッジベース自動構築

Excelファイルの以下のセル範囲を自動解析してナレッジ化：

- 安全施工計画書シート
  - D, AS, BK列：行34-43, 54-73, 81-100, 108-127
- リスクアセスメントシート
  - C, O, Y, AI, AS, CC, AV, CF, BE, CL列：多数の行（詳細は仕様書参照）

### VBAコード生成

生成された最終情報をもとに、準備作業→本作業→後始末作業の順に、Excelファイルに入力するためのVBAコードを作成。

## プロジェクト構造

```
ai-agent-sugi/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   │   ├── excel_model.py
│   │   │   └── llm_model.py
│   │   ├── routers/
│   │   │   ├── chat.py
│   │   │   ├── excel.py
│   │   │   └── vba.py
│   │   ├── services/
│   │   │   ├── excel_service.py
│   │   │   ├── llm_service.py
│   │   │   └── vba_service.py
│   │   ├── utils/
│   │   │   ├── excel_utils.py
│   │   │   └── openrouter_utils.py
│   │   └── main.py
│   └── tests/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── chat/
│   │   │   ├── excel/
│   │   │   ├── form/
│   │   │   └── ui/
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── excel.ts
│   │   │   └── llm.ts
│   │   ├── utils/
│   │   │   ├── excel.ts
│   │   │   └── types.ts
│   │   └── assets/
│   └── public/
└── README.md
```

## セットアップ

### バックエンド

```bash
cd backend
poetry install
poetry run fastapi dev app/main.py
```

### フロントエンド

```bash
cd frontend
npm install
npm run dev
```

## 環境変数

### バックエンド (.env)

```
OPENROUTER_API_KEY=your_api_key_here
BACKEND_URL=http://localhost:8000
```

### フロントエンド (.env)

```
VITE_BACKEND_URL=http://localhost:8000
```

## ライセンス
MIT
