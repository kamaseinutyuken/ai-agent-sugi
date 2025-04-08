"""
Mastra AI Framework - Workflow Component
"""
from typing import Dict, Any, List, Optional, Callable

class Workflow:
    """
    A structured series of steps and logic guiding an Agent's actions.
    
    Attributes:
        id (str): Unique identifier for the workflow
        steps (List): List of steps in the workflow
        conditions (List): List of conditions for the workflow
        parameters (Dict): Parameters for the workflow
    """
    
    def __init__(self, workflow_id: str, steps: List[Dict[str, Any]] = None, 
                 conditions: List[Dict[str, Any]] = None, parameters: Dict[str, Any] = None):
        """
        Initialize a workflow
        
        Args:
            workflow_id: Unique identifier for the workflow
            steps: List of steps in the workflow
            conditions: List of conditions for the workflow
            parameters: Parameters for the workflow
        """
        self.id = workflow_id
        self.steps = steps or []
        self.conditions = conditions or []
        self.parameters = parameters or {}
    
    def add_step(self, step: Dict[str, Any]) -> None:
        """
        Add a step to the workflow
        
        Args:
            step: The step to add
        """
        self.steps.append(step)
    
    def add_condition(self, condition: Dict[str, Any]) -> None:
        """
        Add a condition to the workflow
        
        Args:
            condition: The condition to add
        """
        self.conditions.append(condition)
    
    def set_parameter(self, key: str, value: Any) -> None:
        """
        Set a parameter for the workflow
        
        Args:
            key: The parameter key
            value: The parameter value
        """
        self.parameters[key] = value
    
    def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the workflow
        
        Args:
            context: The context for execution
            
        Returns:
            The result of the workflow execution
        """
        result = {"workflow_id": self.id, "steps_executed": []}
        
        for step in self.steps:
            if self._check_conditions(step, context):
                step_result = self._execute_step(step, context)
                result["steps_executed"].append({
                    "step_id": step.get("id"),
                    "result": step_result
                })
                
                context.update({"last_step_result": step_result})
        
        return result
    
    def _check_conditions(self, step: Dict[str, Any], context: Dict[str, Any]) -> bool:
        """
        Check if conditions are met for a step
        
        Args:
            step: The step to check conditions for
            context: The context for condition checking
            
        Returns:
            True if conditions are met, False otherwise
        """
        step_conditions = step.get("conditions", [])
        
        if not step_conditions:
            return True
        
        for condition in step_conditions:
            condition_type = condition.get("type")
            condition_value = condition.get("value")
            
            if condition_type == "equals":
                left = self._resolve_value(condition.get("left"), context)
                right = self._resolve_value(condition.get("right"), context)
                if left != right:
                    return False
            elif condition_type == "not_equals":
                left = self._resolve_value(condition.get("left"), context)
                right = self._resolve_value(condition.get("right"), context)
                if left == right:
                    return False
            elif condition_type == "contains":
                container = self._resolve_value(condition.get("container"), context)
                item = self._resolve_value(condition.get("item"), context)
                if item not in container:
                    return False
            elif condition_type == "custom":
                func = condition.get("function")
                if callable(func) and not func(context):
                    return False
        
        return True
    
    def _execute_step(self, step: Dict[str, Any], context: Dict[str, Any]) -> Any:
        """
        Execute a step
        
        Args:
            step: The step to execute
            context: The context for execution
            
        Returns:
            The result of the step execution
        """
        step_type = step.get("type")
        
        if step_type == "tool":
            tool_name = step.get("tool_name")
            tool_params = step.get("tool_params", {})
            
            return {"tool_name": tool_name, "result": "Tool execution result"}
        elif step_type == "agent":
            agent_name = step.get("agent_name")
            agent_input = step.get("agent_input", {})
            
            return {"agent_name": agent_name, "result": "Agent execution result"}
        elif step_type == "custom":
            func = step.get("function")
            if callable(func):
                return func(context)
        
        return None
    
    def _resolve_value(self, value_spec: Any, context: Dict[str, Any]) -> Any:
        """
        Resolve a value from a value specification
        
        Args:
            value_spec: The value specification
            context: The context for resolution
            
        Returns:
            The resolved value
        """
        if isinstance(value_spec, dict) and "type" in value_spec:
            if value_spec["type"] == "context":
                path = value_spec.get("path", "")
                return self._get_from_context(context, path)
            elif value_spec["type"] == "parameter":
                param_name = value_spec.get("name", "")
                return self.parameters.get(param_name)
        
        return value_spec
    
    def _get_from_context(self, context: Dict[str, Any], path: str) -> Any:
        """
        Get a value from context using a path
        
        Args:
            context: The context to get the value from
            path: The path to the value
            
        Returns:
            The value at the path
        """
        if not path:
            return context
        
        parts = path.split(".")
        current = context
        
        for part in parts:
            if isinstance(current, dict) and part in current:
                current = current[part]
            else:
                return None
        
        return current
