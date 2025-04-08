"""
Mastra AI Framework - Memory Component
"""
from typing import Dict, Any, List, Optional, Callable
import json

class Memory:
    """
    Agent's internal storage for states, conversations, and contextual data.
    
    Attributes:
        id (str): Unique identifier for the memory
        conversation_history (List): History of conversations
        context (Dict): Contextual data
        recall_method (str): Method used for recalling information
    """
    
    def __init__(self, memory_id: str, conversation_history: List[Dict[str, Any]] = None, 
                 context: Dict[str, Any] = None, recall_method: str = "last"):
        """
        Initialize a memory
        
        Args:
            memory_id: Unique identifier for the memory
            conversation_history: Initial conversation history
            context: Initial context
            recall_method: Method used for recalling information
        """
        self.id = memory_id
        self.conversation_history = conversation_history or []
        self.context = context or {}
        self.recall_method = recall_method
    
    def add_conversation(self, input_data: Dict[str, Any], output_data: Dict[str, Any]) -> None:
        """
        Add a conversation to the history
        
        Args:
            input_data: Input data of the conversation
            output_data: Output data of the conversation
        """
        self.conversation_history.append({
            "input": input_data,
            "output": output_data,
            "timestamp": "2025-04-08T06:59:32Z"  # In a real implementation, this would be the current time
        })
    
    def update_context(self, key: str, value: Any) -> None:
        """
        Update the context
        
        Args:
            key: The context key
            value: The context value
        """
        self.context[key] = value
    
    def recall(self, query: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Recall information from memory
        
        Args:
            query: Query for recalling information
            
        Returns:
            The recalled information
        """
        if self.recall_method == "last":
            return self._recall_last(query)
        elif self.recall_method == "semantic":
            return self._recall_semantic(query)
        else:
            raise ValueError(f"Unknown recall method: {self.recall_method}")
    
    def _recall_last(self, query: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Recall the last conversation
        
        Args:
            query: Query for recalling information
            
        Returns:
            The last conversation
        """
        if not self.conversation_history:
            return {}
        
        return self.conversation_history[-1]
    
    def _recall_semantic(self, query: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Recall information semantically
        
        Args:
            query: Query for recalling information
            
        Returns:
            The semantically recalled information
        """
        
        if not query or not self.conversation_history:
            return {}
        
        return self.conversation_history[-1]
    
    def save(self, file_path: str) -> None:
        """
        Save the memory to a file
        
        Args:
            file_path: Path to the file
        """
        with open(file_path, "w") as f:
            json.dump({
                "id": self.id,
                "conversation_history": self.conversation_history,
                "context": self.context,
                "recall_method": self.recall_method
            }, f, indent=2)
    
    @classmethod
    def load(cls, file_path: str) -> "Memory":
        """
        Load a memory from a file
        
        Args:
            file_path: Path to the file
            
        Returns:
            The loaded memory
        """
        with open(file_path, "r") as f:
            data = json.load(f)
        
        return cls(
            memory_id=data["id"],
            conversation_history=data["conversation_history"],
            context=data["context"],
            recall_method=data["recall_method"]
        )
