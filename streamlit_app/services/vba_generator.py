from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain_community.chat_models import ChatOpenAI
import os
from typing import Dict, Any, List

class VBAGenerator:
    """
    Service for generating VBA code based on collected information.
    """
    
    def __init__(self):
        """
        Initialize the VBA generator.
        """
        self.llm = ChatOpenAI(
            model="openrouter/openai/gpt-4-turbo",
            openai_api_key=os.getenv("OPENROUTER_API_KEY"),
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
    
    def generate_sample_vba_code(self, fixed_info: Dict[str, str]) -> str:
        """
        Generate a sample VBA code for demonstration purposes.
        
        Args:
            fixed_info: Dictionary containing the fixed information
            
        Returns:
            str: The sample VBA code
        """
        return f"""
Sub FillExcelData()
    ' エラーハンドリング
    On Error GoTo ErrorHandler
    
    ' 変数宣言
    Dim wsPlanning As Worksheet
    Dim wsRiskAssessment As Worksheet
    
    ' ワークシートの設定
    On Error Resume Next
    Set wsPlanning = ThisWorkbook.Worksheets("安全施工計画書")
    Set wsRiskAssessment = ThisWorkbook.Worksheets("リスクアセスメント")
    On Error GoTo ErrorHandler
    
    ' ワークシートが見つからない場合はエラー
    If wsPlanning Is Nothing Then
        MsgBox "安全施工計画書シートが見つかりません。", vbExclamation
        Exit Sub
    End If
    
    If wsRiskAssessment Is Nothing Then
        MsgBox "リスクアセスメントシートが見つかりません。", vbExclamation
        Exit Sub
    End If
    
    ' 処理開始メッセージ
    Application.StatusBar = "データ入力中..."
    Application.ScreenUpdating = False
    
    ' 確定事項の入力
    wsPlanning.Range("I9").Value = "{fixed_info['project_name']}"
    wsPlanning.Range("I11").Value = "{fixed_info['location']}"
    wsPlanning.Range("I13").Value = "{fixed_info['period']}"
    wsPlanning.Range("Q15").Value = "{fixed_info['workers']}"
    
    ' 安全施工計画書への入力
    ' D列（行34-43）
    wsPlanning.Range("D34").Value = "準備作業"
    wsPlanning.Range("D35").Value = "資材搬入"
    wsPlanning.Range("D36").Value = "現場確認"
    
    ' AS列（行34-43）
    wsPlanning.Range("AS34").Value = "作業責任者"
    wsPlanning.Range("AS35").Value = "作業員全員"
    
    ' BK列（行34-43）
    wsPlanning.Range("BK34").Value = "安全確認"
    wsPlanning.Range("BK35").Value = "資材チェック"
    
    ' リスクアセスメントへの入力
    ' C列
    wsRiskAssessment.Range("C34").Value = "転落"
    wsRiskAssessment.Range("C48").Value = "挟まれ"
    
    ' O列
    wsRiskAssessment.Range("O34").Value = "3"
    wsRiskAssessment.Range("O48").Value = "4"
    
    ' 処理完了
    Application.ScreenUpdating = True
    Application.StatusBar = False
    MsgBox "データの入力が完了しました。", vbInformation
    
    Exit Sub
    
ErrorHandler:
    Application.ScreenUpdating = True
    Application.StatusBar = False
    MsgBox "エラーが発生しました: " & Err.Description, vbCritical
End Sub
"""
