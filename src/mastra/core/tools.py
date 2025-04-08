"""
Mastra AI Framework - Tools Component
"""
from typing import Dict, Any, List, Optional, Callable

class Tool:
    """
    Reusable functions/services Agents invoke to accomplish specific tasks.
    
    Attributes:
        name (str): Name of the tool
        inputs (List): Input specifications for the tool
        outputs (List): Output specifications for the tool
        executor_function (Callable): Function that executes the tool
    """
    
    def __init__(self, name: str, inputs: List[Dict[str, Any]] = None, 
                 outputs: List[Dict[str, Any]] = None, executor_function: Callable = None):
        """
        Initialize a tool
        
        Args:
            name: Name of the tool
            inputs: Input specifications for the tool
            outputs: Output specifications for the tool
            executor_function: Function that executes the tool
        """
        self.name = name
        self.inputs = inputs or []
        self.outputs = outputs or []
        self.executor_function = executor_function
    
    def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the tool with the given input
        
        Args:
            input_data: Input data for the tool
            
        Returns:
            The result of the tool execution
        """
        self._validate_input(input_data)
        
        if self.executor_function is None:
            raise ValueError(f"Tool '{self.name}' has no executor function")
        
        try:
            result = self.executor_function(input_data)
        except Exception as e:
            return {"error": str(e)}
        
        self._validate_output(result)
        
        return result
    
    def _validate_input(self, input_data: Dict[str, Any]) -> None:
        """
        Validate the input data against the input specifications
        
        Args:
            input_data: Input data to validate
            
        Raises:
            ValueError: If the input data is invalid
        """
        for input_spec in self.inputs:
            name = input_spec.get("name")
            required = input_spec.get("required", False)
            
            if required and name not in input_data:
                raise ValueError(f"Required input '{name}' is missing")
    
    def _validate_output(self, output_data: Dict[str, Any]) -> None:
        """
        Validate the output data against the output specifications
        
        Args:
            output_data: Output data to validate
            
        Raises:
            ValueError: If the output data is invalid
        """
        for output_spec in self.outputs:
            name = output_spec.get("name")
            required = output_spec.get("required", False)
            
            if required and name not in output_data:
                raise ValueError(f"Required output '{name}' is missing")
