"""
Mastra AI Framework - Agent Component
"""
from typing import Dict, Any, List, Optional, Callable

class Agent:
    """
    The primary entity executing tasks, managing information, and interfacing with users.
    
    Attributes:
        name (str): Name of the agent
        state (Dict): Current state of the agent
        memory (Dict): Memory of the agent
        tools (List): Tools available to the agent
    """
    
    def __init__(self, name: str, state: Dict[str, Any] = None, 
                 memory: Dict[str, Any] = None, tools: List[Dict[str, Any]] = None):
        """
        Initialize an agent
        
        Args:
            name: Name of the agent
            state: Initial state of the agent
            memory: Initial memory of the agent
            tools: Tools available to the agent
        """
        self.name = name
        self.state = state or {}
        self.memory = memory or {}
        self.tools = tools or []
    
    def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the agent with the given input
        
        Args:
            input_data: Input data for the agent
            
        Returns:
            The result of the agent execution
        """
        result = {"agent_name": self.name, "input": input_data}
        
        processed_input = self._process_input(input_data)
        result["processed_input"] = processed_input
        
        tool_results = self._execute_tools(processed_input)
        result["tool_results"] = tool_results
        
        output = self._generate_output(processed_input, tool_results)
        result["output"] = output
        
        self._update_state(processed_input, tool_results, output)
        self._update_memory(processed_input, tool_results, output)
        
        return result
    
    def _process_input(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process the input data
        
        Args:
            input_data: Input data to process
            
        Returns:
            The processed input data
        """
        return input_data
    
    def _execute_tools(self, processed_input: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Execute tools based on the processed input
        
        Args:
            processed_input: Processed input data
            
        Returns:
            The results of tool executions
        """
        results = []
        
        for tool in self.tools:
            tool_name = tool.get("name")
            tool_func = tool.get("function")
            
            if callable(tool_func):
                try:
                    tool_result = tool_func(processed_input)
                    results.append({
                        "tool_name": tool_name,
                        "result": tool_result
                    })
                except Exception as e:
                    results.append({
                        "tool_name": tool_name,
                        "error": str(e)
                    })
        
        return results
    
    def _generate_output(self, processed_input: Dict[str, Any], 
                         tool_results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Generate output based on processed input and tool results
        
        Args:
            processed_input: Processed input data
            tool_results: Results of tool executions
            
        Returns:
            The generated output
        """
        return {
            "message": "Generated output",
            "data": {
                "input": processed_input,
                "tool_results": tool_results
            }
        }
    
    def _update_state(self, processed_input: Dict[str, Any], 
                      tool_results: List[Dict[str, Any]], 
                      output: Dict[str, Any]) -> None:
        """
        Update the agent state
        
        Args:
            processed_input: Processed input data
            tool_results: Results of tool executions
            output: Generated output
        """
        self.state.update({
            "last_input": processed_input,
            "last_tool_results": tool_results,
            "last_output": output,
            "last_updated": "2025-04-08T06:58:01Z"  # In a real implementation, this would be the current time
        })
    
    def _update_memory(self, processed_input: Dict[str, Any], 
                       tool_results: List[Dict[str, Any]], 
                       output: Dict[str, Any]) -> None:
        """
        Update the agent memory
        
        Args:
            processed_input: Processed input data
            tool_results: Results of tool executions
            output: Generated output
        """
        if "conversation_history" not in self.memory:
            self.memory["conversation_history"] = []
        
        self.memory["conversation_history"].append({
            "input": processed_input,
            "output": output,
            "timestamp": "2025-04-08T06:58:01Z"  # In a real implementation, this would be the current time
        })
        
        if "context" not in self.memory:
            self.memory["context"] = {}
        
        self.memory["context"].update({
            "last_topic": processed_input.get("topic", "unknown")
        })
