from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain_community.chat_models import ChatOpenAI
import os
from typing import Dict, Any, List
from dotenv import load_dotenv

load_dotenv()

class VBAService:
    """
    Service for generating VBA code based on collected information.
    """
    
    def __init__(self):
        """
        Initialize the VBA generator.
        """
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        self.llm = ChatOpenAI(
            model="openrouter/openai/gpt-4-turbo",
            openai_api_key=self.api_key,
            openai_api_base="https://openrouter.ai/api/v1",
            temperature=0.2  # Lower temperature for more deterministic code generation
        )
    
    def generate_vba_code(self, fixed_info: Dict[str, str], excel_data: Dict[str, Any], messages: List[Dict[str, str]]) -> str:
        """
        Generate VBA code based on the collected information.
        
        Args:
            fixed_info: Dictionary containing the fixed information (project name, location, period, workers)
            excel_data: Dictionary containing the extracted Excel data
            messages: List of chat messages
            
        Returns:
            str: The generated VBA code
        """
        prompt_template = PromptTemplate(
            input_variables=["fixed_info", "excel_data", "messages"],
            template="""
            以下の情報に基づいて、Excelファイルに自動入力するためのVBAコードを生成してください。
            
            工事名 (セルI9): {fixed_info[project_name]}
            施工場所 (セルI11): {fixed_info[location]}
            工期 (セルI13): {fixed_info[period]}
            作業者数 (セルQ15): {fixed_info[workers]}
            
            {excel_data}
            
            {messages}
            
            1. 準備作業→本作業→後始末作業の順に、Excelファイルに入力するためのVBAコードを作成
            2. 確定事項（工事名、施工場所、工期、作業者数）を入力
            3. 安全施工計画書シートのD, AS, BK列（行34-43, 54-73, 81-100, 108-127）に入力
            4. リスクアセスメントシートのC, O, Y, AI, AS, CC, AV, CF, BE, CL列の指定された行に入力
            
            VBAのSub procedureとして、以下の形式で出力してください：
            
            ```vb
            Sub FillExcelData()
                ' コードをここに記述
            End Sub
            ```
            
            コードには適切なエラーハンドリングとコメントを含めてください。
            """
        )
        
        chain = LLMChain(llm=self.llm, prompt=prompt_template)
        
        messages_str = "\n".join([f"{msg['role']}: {msg['content']}" for msg in messages])
        
        vba_code = chain.run(
            fixed_info=fixed_info,
            excel_data=str(excel_data),
            messages=messages_str
        )
        
        if "```vb" in vba_code and "```" in vba_code:
            vba_code = vba_code.split("```vb")[1].split("```")[0].strip()
        elif "```" in vba_code:
            vba_code = vba_code.split("```")[1].split("```")[0].strip()
        
        return vba_code
