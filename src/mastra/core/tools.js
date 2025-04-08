/**
 * Mastra AI Framework - Tools Component
 */

/**
 * Reusable functions/services Agents invoke to accomplish specific tasks.
 */
class Tool {
  /**
   * Initialize a tool
   * @param {string} name - Name of the tool
   * @param {Array} inputs - Input specifications for the tool
   * @param {Array} outputs - Output specifications for the tool
   * @param {Function} executorFunction - Function that executes the tool
   */
  constructor(name, inputs = [], outputs = [], executorFunction = null) {
    this.name = name;
    this.inputs = inputs;
    this.outputs = outputs;
    this.executorFunction = executorFunction;
  }

  /**
   * Execute the tool with the given input
   * @param {Object} inputData - Input data for the tool
   * @returns {Object} The result of the tool execution
   */
  execute(inputData) {
    this._validateInput(inputData);
    
    if (!this.executorFunction) {
      throw new Error(`Tool '${this.name}' has no executor function`);
    }
    
    try {
      const result = this.executorFunction(inputData);
      
      this._validateOutput(result);
      
      return result;
    } catch (e) {
      return { error: e.message };
    }
  }

  /**
   * Validate the input data against the input specifications
   * @param {Object} inputData - Input data to validate
   * @private
   */
  _validateInput(inputData) {
    for (const inputSpec of this.inputs) {
      const name = inputSpec.name;
      const required = inputSpec.required || false;
      
      if (required && !(name in inputData)) {
        throw new Error(`Required input '${name}' is missing`);
      }
    }
  }

  /**
   * Validate the output data against the output specifications
   * @param {Object} outputData - Output data to validate
   * @private
   */
  _validateOutput(outputData) {
    for (const outputSpec of this.outputs) {
      const name = outputSpec.name;
      const required = outputSpec.required || false;
      
      if (required && !(name in outputData)) {
        throw new Error(`Required output '${name}' is missing`);
      }
    }
  }
}

module.exports = Tool;
