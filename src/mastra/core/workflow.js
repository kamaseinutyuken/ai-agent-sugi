/**
 * Mastra AI Framework - Workflow Component
 */

/**
 * A structured series of steps and logic guiding an Agent's actions.
 */
class Workflow {
  /**
   * Initialize a workflow
   * @param {string} workflowId - Unique identifier for the workflow
   * @param {Array} steps - List of steps in the workflow
   * @param {Array} conditions - List of conditions for the workflow
   * @param {Object} parameters - Parameters for the workflow
   */
  constructor(workflowId, steps = [], conditions = [], parameters = {}) {
    this.id = workflowId;
    this.steps = steps;
    this.conditions = conditions;
    this.parameters = parameters;
  }

  /**
   * Add a step to the workflow
   * @param {Object} step - The step to add
   */
  addStep(step) {
    this.steps.push(step);
  }

  /**
   * Add a condition to the workflow
   * @param {Object} condition - The condition to add
   */
  addCondition(condition) {
    this.conditions.push(condition);
  }

  /**
   * Set a parameter for the workflow
   * @param {string} key - The parameter key
   * @param {*} value - The parameter value
   */
  setParameter(key, value) {
    this.parameters[key] = value;
  }

  /**
   * Execute the workflow
   * @param {Object} context - The context for execution
   * @returns {Object} The result of the workflow execution
   */
  execute(context) {
    const result = { workflow_id: this.id, steps_executed: [] };
    
    for (const step of this.steps) {
      if (this._checkConditions(step, context)) {
        const stepResult = this._executeStep(step, context);
        result.steps_executed.push({
          step_id: step.id,
          result: stepResult
        });
        
        context.last_step_result = stepResult;
      }
    }
    
    return result;
  }

  /**
   * Check if conditions are met for a step
   * @param {Object} step - The step to check conditions for
   * @param {Object} context - The context for condition checking
   * @returns {boolean} True if conditions are met, False otherwise
   * @private
   */
  _checkConditions(step, context) {
    const stepConditions = step.conditions || [];
    
    if (stepConditions.length === 0) {
      return true;
    }
    
    for (const condition of stepConditions) {
      const conditionType = condition.type;
      
      if (conditionType === "equals") {
        const left = this._resolveValue(condition.left, context);
        const right = this._resolveValue(condition.right, context);
        if (left !== right) {
          return false;
        }
      } else if (conditionType === "not_equals") {
        const left = this._resolveValue(condition.left, context);
        const right = this._resolveValue(condition.right, context);
        if (left === right) {
          return false;
        }
      } else if (conditionType === "contains") {
        const container = this._resolveValue(condition.container, context);
        const item = this._resolveValue(condition.item, context);
        if (!container.includes(item)) {
          return false;
        }
      } else if (conditionType === "custom") {
        const func = condition.function;
        if (typeof func === "function" && !func(context)) {
          return false;
        }
      }
    }
    
    return true;
  }

  /**
   * Execute a step
   * @param {Object} step - The step to execute
   * @param {Object} context - The context for execution
   * @returns {*} The result of the step execution
   * @private
   */
  _executeStep(step, context) {
    const stepType = step.type;
    
    if (stepType === "tool") {
      const toolName = step.tool_name;
      const toolParams = step.tool_params || {};
      
      return { tool_name: toolName, result: "Tool execution result" };
    } else if (stepType === "agent") {
      const agentName = step.agent_name;
      const agentInput = step.agent_input || {};
      
      return { agent_name: agentName, result: "Agent execution result" };
    } else if (stepType === "custom") {
      const func = step.function;
      if (typeof func === "function") {
        return func(context);
      }
    }
    
    return null;
  }

  /**
   * Resolve a value from a value specification
   * @param {*} valueSpec - The value specification
   * @param {Object} context - The context for resolution
   * @returns {*} The resolved value
   * @private
   */
  _resolveValue(valueSpec, context) {
    if (valueSpec && typeof valueSpec === "object" && valueSpec.type) {
      if (valueSpec.type === "context") {
        const path = valueSpec.path || "";
        return this._getFromContext(context, path);
      } else if (valueSpec.type === "parameter") {
        const paramName = valueSpec.name || "";
        return this.parameters[paramName];
      }
    }
    
    return valueSpec;
  }

  /**
   * Get a value from context using a path
   * @param {Object} context - The context to get the value from
   * @param {string} path - The path to the value
   * @returns {*} The value at the path
   * @private
   */
  _getFromContext(context, path) {
    if (!path) {
      return context;
    }
    
    const parts = path.split(".");
    let current = context;
    
    for (const part of parts) {
      if (current && typeof current === "object" && part in current) {
        current = current[part];
      } else {
        return null;
      }
    }
    
    return current;
  }
}

module.exports = Workflow;
