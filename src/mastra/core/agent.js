/**
 * Mastra AI Framework - Agent Component
 */

/**
 * The primary entity executing tasks, managing information, and interfacing with users.
 */
class Agent {
  /**
   * Initialize an agent
   * @param {string} name - Name of the agent
   * @param {Object} state - Initial state of the agent
   * @param {Object} memory - Initial memory of the agent
   * @param {Array} tools - Tools available to the agent
   */
  constructor(name, state = {}, memory = {}, tools = []) {
    this.name = name;
    this.state = state;
    this.memory = memory;
    this.tools = tools;
  }

  /**
   * Execute the agent with the given input
   * @param {Object} inputData - Input data for the agent
   * @returns {Object} The result of the agent execution
   */
  execute(inputData) {
    const result = { agent_name: this.name, input: inputData };
    
    const processedInput = this._processInput(inputData);
    result.processed_input = processedInput;
    
    const toolResults = this._executeTools(processedInput);
    result.tool_results = toolResults;
    
    const output = this._generateOutput(processedInput, toolResults);
    result.output = output;
    
    this._updateState(processedInput, toolResults, output);
    this._updateMemory(processedInput, toolResults, output);
    
    return result;
  }

  /**
   * Process the input data
   * @param {Object} inputData - Input data to process
   * @returns {Object} The processed input data
   * @private
   */
  _processInput(inputData) {
    return inputData;
  }

  /**
   * Execute tools based on the processed input
   * @param {Object} processedInput - Processed input data
   * @returns {Array} The results of tool executions
   * @private
   */
  _executeTools(processedInput) {
    const results = [];
    
    for (const tool of this.tools) {
      const toolName = tool.name;
      const toolFunc = tool.function;
      
      if (typeof toolFunc === "function") {
        try {
          const toolResult = toolFunc(processedInput);
          results.push({
            tool_name: toolName,
            result: toolResult
          });
        } catch (e) {
          results.push({
            tool_name: toolName,
            error: e.message
          });
        }
      }
    }
    
    return results;
  }

  /**
   * Generate output based on processed input and tool results
   * @param {Object} processedInput - Processed input data
   * @param {Array} toolResults - Results of tool executions
   * @returns {Object} The generated output
   * @private
   */
  _generateOutput(processedInput, toolResults) {
    return {
      message: "Generated output",
      data: {
        input: processedInput,
        tool_results: toolResults
      }
    };
  }

  /**
   * Update the agent state
   * @param {Object} processedInput - Processed input data
   * @param {Array} toolResults - Results of tool executions
   * @param {Object} output - Generated output
   * @private
   */
  _updateState(processedInput, toolResults, output) {
    this.state = {
      ...this.state,
      last_input: processedInput,
      last_tool_results: toolResults,
      last_output: output,
      last_updated: new Date().toISOString()
    };
  }

  /**
   * Update the agent memory
   * @param {Object} processedInput - Processed input data
   * @param {Array} toolResults - Results of tool executions
   * @param {Object} output - Generated output
   * @private
   */
  _updateMemory(processedInput, toolResults, output) {
    if (!this.memory.conversation_history) {
      this.memory.conversation_history = [];
    }
    
    this.memory.conversation_history.push({
      input: processedInput,
      output: output,
      timestamp: new Date().toISOString()
    });
    
    if (!this.memory.context) {
      this.memory.context = {};
    }
    
    this.memory.context.last_topic = processedInput.topic || "unknown";
  }
}

module.exports = Agent;
