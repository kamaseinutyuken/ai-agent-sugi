from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain_community.chat_models import ChatOpenAI
from langchain.schema import SystemMessage, HumanMessage, AIMessage
import os
from typing import List, Dict, Any, Optional

class LLMAgentTeam:
    """
    A team of LLM agents that work together to process user input and generate responses.
    Uses multiple LLMs (GPT-4 Turbo, Gemini 2.0, Claude 3, Mixtral) via OpenRouter API.
    """
    
    def __init__(self):
        self.gpt4_turbo = ChatOpenAI(
            model="openrouter/openai/gpt-4-turbo",
            openai_api_key=os.getenv("OPENROUTER_API_KEY"),
            openai_api_base="https://openrouter.ai/api/v1",
            temperature=0.7
        )
        
        self.gemini = ChatOpenAI(
            model="openrouter/google/gemini-1.5-pro",
            openai_api_key=os.getenv("OPENROUTER_API_KEY"),
            openai_api_base="https://openrouter.ai/api/v1",
            temperature=0.7
        )
        
        self.claude = ChatOpenAI(
            model="openrouter/anthropic/claude-3-opus",
            openai_api_key=os.getenv("OPENROUTER_API_KEY"),
            openai_api_base="https://openrouter.ai/api/v1",
            temperature=0.7
        )
        
        self.mixtral = ChatOpenAI(
            model="openrouter/mistralai/mixtral-8x7b-instruct",
            openai_api_key=os.getenv("OPENROUTER_API_KEY"),
            openai_api_base="https://openrouter.ai/api/v1",
            temperature=0.7
        )
        
        self.system_prompts = {
            "gpt4_turbo": """あなたはチャット内容を論理的に構造化するエキスパートです。
            ユーザーの入力から工事に関する重要な情報を抽出し、整理してください。
            特に安全施工計画書とリスクアセスメントに関連する情報に注目してください。""",
            
            "gemini": """あなたはExcelデータ構造を分析するエキスパートです。
            Excelファイルから抽出されたデータを理解し、どのセルにどのような情報が入るべきかを判断してください。
            特に安全施工計画書シートとリスクアセスメントシートの構造に詳しいです。""",
            
            "claude": """あなたは表現の曖昧さを明確化するエキスパートです。
            ユーザーの入力に曖昧な表現や不明確な点があれば、それを特定し、明確な質問を生成してください。
            特に工事の安全性に関わる重要な情報については、詳細を確認することが重要です。""",
            
            "mixtral": """あなたは細かいニュアンスや例外処理を補完するエキスパートです。
            他のAIが見落としがちな細部や特殊なケースを検出し、それに対応する情報を提供してください。
            特に工事現場特有の状況や条件に注意を払ってください。"""
        }
        
        self.collected_info = {}
        self.missing_info = []
    
    def generate_initial_question(self, fixed_info: Dict[str, str], excel_data: Optional[Dict[str, Any]]) -> str:
        """
        Generate the initial question based on the fixed information and Excel data.
        
        Args:
            fixed_info: Dictionary containing the fixed information (project name, location, period, workers)
            excel_data: Dictionary containing the extracted Excel data
            
        Returns:
            str: The initial question to ask the user
        """
        prompt_template = PromptTemplate(
            input_variables=["fixed_info", "excel_data"],
            template="""
            以下の基本情報が提供されています：
            
            工事名: {fixed_info[project_name]}
            施工場所: {fixed_info[location]}
            工期: {fixed_info[period]}
            作業者数: {fixed_info[workers]}
            
            Excelファイルからは安全施工計画書とリスクアセスメントのデータが抽出されています。
            
            工事の詳細について、安全施工計画書とリスクアセスメントに必要な情報を収集するための
            最初の質問を生成してください。特に以下の点について情報が必要です：
            
            1. 工事の種類と内容
            2. 使用する主な機材や工具
            3. 想定されるリスクや危険要因
            4. 安全対策や予防措置
            
            ユーザーに対する最初の質問を日本語で作成してください。
            """
        )
        
        chain = LLMChain(llm=self.claude, prompt=prompt_template)
        
        excel_data_str = str(excel_data) if excel_data else "データなし"
        
        initial_question = chain.run(fixed_info=fixed_info, excel_data=excel_data_str)
        
        return initial_question
    
    def process_message(self, user_message: str, message_history: List[Dict[str, str]]) -> str:
        """
        Process a user message using the LLM agent team.
        
        Args:
            user_message: The user's message
            message_history: The history of messages in the conversation
            
        Returns:
            str: The response from the LLM agent team
        """
        langchain_messages = []
        
        for message in message_history:
            if message["role"] == "user":
                langchain_messages.append(HumanMessage(content=message["content"]))
            elif message["role"] == "assistant":
                langchain_messages.append(AIMessage(content=message["content"]))
        
        langchain_messages.insert(0, SystemMessage(content=self.system_prompts["gpt4_turbo"]))
        
        gpt4_response = self.gpt4_turbo.invoke(langchain_messages)
        structured_info = gpt4_response.content
        
        gemini_messages = [
            SystemMessage(content=self.system_prompts["gemini"]),
            HumanMessage(content=f"ユーザーメッセージ: {user_message}\n\nGPT-4による構造化情報: {structured_info}")
        ]
        gemini_response = self.gemini.invoke(gemini_messages)
        excel_analysis = gemini_response.content
        
        claude_messages = [
            SystemMessage(content=self.system_prompts["claude"]),
            HumanMessage(content=f"ユーザーメッセージ: {user_message}\n\nGPT-4による構造化情報: {structured_info}\n\nGeminiによるExcel分析: {excel_analysis}")
        ]
        claude_response = self.claude.invoke(claude_messages)
        clarification = claude_response.content
        
        mixtral_messages = [
            SystemMessage(content=self.system_prompts["mixtral"]),
            HumanMessage(content=f"ユーザーメッセージ: {user_message}\n\nGPT-4による構造化情報: {structured_info}\n\nGeminiによるExcel分析: {excel_analysis}\n\nClaudeによる明確化: {clarification}")
        ]
        mixtral_response = self.mixtral.invoke(mixtral_messages)
        nuanced_response = mixtral_response.content
        
        final_prompt_template = PromptTemplate(
            input_variables=["structured_info", "excel_analysis", "clarification", "nuanced_response", "message_history"],
            template="""
            以下の情報を統合して、ユーザーへの最適な応答を生成してください：
            
            GPT-4による構造化情報:
            {structured_info}
            
            GeminiによるExcel分析:
            {excel_analysis}
            
            Claudeによる明確化:
            {clarification}
            
            Mixtralによる細部の補完:
            {nuanced_response}
            
            これまでの会話履歴:
            {message_history}
            
            以上の情報を統合し、次のいずれかを行ってください：
            1. まだ必要な情報がある場合は、具体的な質問を生成する
            2. 十分な情報が得られた場合は、その旨を伝え、収集した情報の要約を提示する
            
            応答は日本語で、親切でプロフェッショナルな口調で作成してください。
            """
        )
        
        final_chain = LLMChain(llm=self.gpt4_turbo, prompt=final_prompt_template)
        
        final_response = final_chain.run(
            structured_info=structured_info,
            excel_analysis=excel_analysis,
            clarification=clarification,
            nuanced_response=nuanced_response,
            message_history=str(message_history)
        )
        
        self._update_collected_info(user_message, final_response)
        
        return final_response
    
    def _update_collected_info(self, user_message: str, ai_response: str) -> None:
        """
        Update the collected information based on the user message and AI response.
        
        Args:
            user_message: The user's message
            ai_response: The AI's response
        """
        extraction_prompt = PromptTemplate(
            input_variables=["user_message", "ai_response"],
            template="""
            以下のユーザーメッセージとAI応答から、工事に関する重要な情報を抽出してください：
            
            ユーザーメッセージ:
            {user_message}
            
            AI応答:
            {ai_response}
            
            抽出した情報をJSON形式で出力してください。例：
            {{
                "工事種類": "ビル解体工事",
                "使用機材": ["油圧ショベル", "ブレーカー"],
                "リスク要因": ["粉塵", "騒音", "振動"],
                "安全対策": ["散水による粉塵抑制", "防音シートの設置"]
            }}
            
            情報が不明確または不足している場合は、該当するキーに空の値を設定してください。
            """
        )
        
        extraction_chain = LLMChain(llm=self.gpt4_turbo, prompt=extraction_prompt)
        extracted_info = extraction_chain.run(user_message=user_message, ai_response=ai_response)
        
        self.collected_info["latest_extraction"] = extracted_info
        
        if "さらに情報が必要です" in ai_response or "詳細を教えていただけますか" in ai_response:
            questions = [line for line in ai_response.split('\n') if '?' in line or 'か？' in line or 'ください' in line]
            self.missing_info = questions
    
    def has_sufficient_information(self) -> bool:
        """
        Check if we have sufficient information to generate VBA code.
        
        Returns:
            bool: True if we have sufficient information, False otherwise
        """
        return len(self.missing_info) == 0
