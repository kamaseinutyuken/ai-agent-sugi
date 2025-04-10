# Mastra AI Excel Agent - Streamlit App

複数のLLM（GPT-4 Turbo、Gemini 2.0、Claude 3、Mixtral）を連携させ、自動的にExcelファイルへの入力を行うVBAコード生成AIエージェント。

## セットアップ

1. 必要なパッケージをインストール:
   ```bash
   pip install -r requirements.txt
   ```

2. `.env.example`を`.env`にコピーし、OpenRouter APIキーを設定:
   ```bash
   cp .env.example .env
   # .envファイルを編集してAPIキーを設定
   ```

3. アプリケーションを起動:
   ```bash
   streamlit run app.py
   ```

## 機能

- チャットインターフェース
- Excelファイル(.xlsm)のアップロードと解析
- 基本情報入力フォーム
- 複数LLMによる情報収集と分析
- VBAコード生成と出力

## LLM連携機能

- **GPT-4 Turbo**: チャット内容の論理的構造化
- **Gemini 2.0**: Excelデータ構造の分析
- **Claude 3**: 表現の曖昧さを明確化
- **Mixtral**: 細かいニュアンスや例外処理の補完

## 使用方法

1. 基本情報（工事名、施工場所、工期、作業者数）を入力
2. Excelファイルをアップロード
3. AIエージェントとチャットで追加情報を提供
4. 生成されたVBAコードを確認・ダウンロード
