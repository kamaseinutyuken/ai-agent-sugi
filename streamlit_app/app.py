import streamlit as st
import pandas as pd
import os
from pathlib import Path
import tempfile

from agents.llm_agent import LLMAgentTeam
from utils.excel_processor import ExcelProcessor
from services.vba_generator import VBAGenerator

st.set_page_config(
    page_title="Mastra AI Excel Agent",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

if "messages" not in st.session_state:
    st.session_state.messages = []

if "excel_data" not in st.session_state:
    st.session_state.excel_data = None

if "fixed_info" not in st.session_state:
    st.session_state.fixed_info = {
        "project_name": "",  # 工事名（セルI9）
        "location": "",      # 施工場所（セルI11）
        "period": "",        # 工期（セルI13）
        "workers": ""        # 作業者数（セルQ15）
    }

if "vba_code" not in st.session_state:
    st.session_state.vba_code = ""

if "current_step" not in st.session_state:
    st.session_state.current_step = 1  # 1: Initial info, 2: Excel upload, 3: Additional questions, 4: Final confirmation

st.title("Mastra AI Excel Agent")
st.markdown("""
このアプリケーションは、複数のLLM（GPT-4 Turbo、Gemini 2.0、Claude 3、Mixtral）を連携させ、
自動的にExcelファイルへの入力を行うVBAコード生成AIエージェントです。
""")

with st.sidebar:
    st.header("ステップ")
    st.markdown(f"""
    1. {'✅' if st.session_state.current_step > 1 else '🔄'} 基本情報の入力
    2. {'✅' if st.session_state.current_step > 2 else '⬜'} Excelファイルのアップロード
    3. {'✅' if st.session_state.current_step > 3 else '⬜'} 追加情報の質問
    4. {'✅' if st.session_state.current_step > 4 else '⬜'} 最終確認とVBAコード生成
    """)
    
    st.header("使用AI")
    st.markdown("""
    - **GPT-4 Turbo**: チャット内容の論理的構造化
    - **Gemini 2.0**: Excelデータ構造の分析
    - **Claude 3**: 表現の曖昧さを明確化
    - **Mixtral**: 細かいニュアンスや例外処理の補完
    """)

if st.session_state.current_step == 1:
    st.header("基本情報の入力")
    st.markdown("以下の項目を入力してください。これらはExcelファイルの固定セルに入力されます。")
    
    col1, col2 = st.columns(2)
    
    with col1:
        project_name = st.text_input("工事名 (セルI9)", value=st.session_state.fixed_info["project_name"])
        location = st.text_input("施工場所 (セルI11)", value=st.session_state.fixed_info["location"])
    
    with col2:
        period = st.text_input("工期 (セルI13)", value=st.session_state.fixed_info["period"])
        workers = st.text_input("作業者数 (セルQ15)", value=st.session_state.fixed_info["workers"])
    
    if st.button("次へ", key="next_step1"):
        if not project_name or not location or not period or not workers:
            st.error("すべての項目を入力してください。")
        else:
            st.session_state.fixed_info = {
                "project_name": project_name,
                "location": location,
                "period": period,
                "workers": workers
            }
            st.session_state.current_step = 2
            st.rerun()

elif st.session_state.current_step == 2:
    st.header("Excelファイルのアップロード")
    st.markdown("安全施工計画書とリスクアセスメントを含むExcelファイル(.xlsm)をアップロードしてください。")
    
    uploaded_file = st.file_uploader("Excelファイルをアップロード", type=["xlsm"])
    
    if uploaded_file is not None:
        with tempfile.NamedTemporaryFile(delete=False, suffix='.xlsm') as tmp_file:
            tmp_file.write(uploaded_file.getvalue())
            tmp_path = tmp_file.name
        
        try:
            excel_processor = ExcelProcessor(tmp_path)
            st.session_state.excel_data = excel_processor.extract_data()
            
            st.success("Excelファイルが正常に処理されました。")
            
            st.subheader("抽出データのプレビュー")
            
            tab1, tab2 = st.tabs(["安全施工計画書", "リスクアセスメント"])
            
            with tab1:
                if "safety_plan" in st.session_state.excel_data:
                    st.dataframe(pd.DataFrame(st.session_state.excel_data["safety_plan"]))
                else:
                    st.warning("安全施工計画書のデータが見つかりませんでした。")
            
            with tab2:
                if "risk_assessment" in st.session_state.excel_data:
                    st.dataframe(pd.DataFrame(st.session_state.excel_data["risk_assessment"]))
                else:
                    st.warning("リスクアセスメントのデータが見つかりませんでした。")
            
            if st.button("次へ", key="next_step2"):
                st.session_state.current_step = 3
                st.rerun()
                
        except Exception as e:
            st.error(f"Excelファイルの処理中にエラーが発生しました: {str(e)}")
            os.unlink(tmp_path)

elif st.session_state.current_step == 3:
    st.header("追加情報の質問")
    st.markdown("AIエージェントが不足している情報を質問します。チャットで回答してください。")
    
    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])
    
    if len(st.session_state.messages) == 0:
        agent_team = LLMAgentTeam()
        
        initial_question = agent_team.generate_initial_question(
            st.session_state.fixed_info,
            st.session_state.excel_data
        )
        
        st.session_state.messages.append({"role": "assistant", "content": initial_question})
        st.rerun()
    
    if prompt := st.chat_input("メッセージを入力してください"):
        st.session_state.messages.append({"role": "user", "content": prompt})
        
        with st.chat_message("user"):
            st.markdown(prompt)
        
        agent_team = LLMAgentTeam()
        response = agent_team.process_message(prompt, st.session_state.messages)
        
        st.session_state.messages.append({"role": "assistant", "content": response})
        
        with st.chat_message("assistant"):
            st.markdown(response)
        
        if agent_team.has_sufficient_information():
            st.success("必要な情報が揃いました。最終確認に進みます。")
            if st.button("次へ", key="next_step3"):
                st.session_state.current_step = 4
                st.rerun()

elif st.session_state.current_step == 4:
    st.header("最終確認とVBAコード生成")
    
    st.subheader("収集した情報")
    
    st.markdown("### 基本情報")
    col1, col2 = st.columns(2)
    with col1:
        st.markdown(f"**工事名**: {st.session_state.fixed_info['project_name']}")
        st.markdown(f"**施工場所**: {st.session_state.fixed_info['location']}")
    with col2:
        st.markdown(f"**工期**: {st.session_state.fixed_info['period']}")
        st.markdown(f"**作業者数**: {st.session_state.fixed_info['workers']}")
    
    if not st.session_state.vba_code:
        vba_generator = VBAGenerator()
        st.session_state.vba_code = vba_generator.generate_vba_code(
            st.session_state.fixed_info,
            st.session_state.excel_data,
            st.session_state.messages
        )
    
    st.subheader("生成されたVBAコード")
    st.code(st.session_state.vba_code, language="vb")
    
    st.download_button(
        label="VBAコードをダウンロード",
        data=st.session_state.vba_code,
        file_name="excel_input_macro.vba",
        mime="text/plain"
    )
    
    if st.button("最初からやり直す"):
        st.session_state.messages = []
        st.session_state.excel_data = None
        st.session_state.fixed_info = {
            "project_name": "",
            "location": "",
            "period": "",
            "workers": ""
        }
        st.session_state.vba_code = ""
        st.session_state.current_step = 1
        st.rerun()

st.markdown("---")
st.markdown("© 2025 Mastra AI Excel Agent")
