/**
 * Mastra AI Framework - Memory Component
 */
const fs = require('fs');

/**
 * Agent's internal storage for states, conversations, and contextual data.
 */
class Memory {
  /**
   * Initialize a memory
   * @param {string} memoryId - Unique identifier for the memory
   * @param {Array} conversationHistory - Initial conversation history
   * @param {Object} context - Initial context
   * @param {string} recallMethod - Method used for recalling information
   */
  constructor(memoryId, conversationHistory = [], context = {}, recallMethod = "last") {
    this.id = memoryId;
    this.conversationHistory = conversationHistory;
    this.context = context;
    this.recallMethod = recallMethod;
  }

  /**
   * Add a conversation to the history
   * @param {Object} inputData - Input data of the conversation
   * @param {Object} outputData - Output data of the conversation
   */
  addConversation(inputData, outputData) {
    this.conversationHistory.push({
      input: inputData,
      output: outputData,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Update the context
   * @param {string} key - The context key
   * @param {*} value - The context value
   */
  updateContext(key, value) {
    this.context[key] = value;
  }

  /**
   * Recall information from memory
   * @param {Object} query - Query for recalling information
   * @returns {Object} The recalled information
   */
  recall(query = null) {
    if (this.recallMethod === "last") {
      return this._recallLast(query);
    } else if (this.recallMethod === "semantic") {
      return this._recallSemantic(query);
    } else {
      throw new Error(`Unknown recall method: ${this.recallMethod}`);
    }
  }

  /**
   * Recall the last conversation
   * @param {Object} query - Query for recalling information
   * @returns {Object} The last conversation
   * @private
   */
  _recallLast(query = null) {
    if (this.conversationHistory.length === 0) {
      return {};
    }
    
    return this.conversationHistory[this.conversationHistory.length - 1];
  }

  /**
   * Recall information semantically
   * @param {Object} query - Query for recalling information
   * @returns {Object} The semantically recalled information
   * @private
   */
  _recallSemantic(query = null) {
    if (!query || this.conversationHistory.length === 0) {
      return {};
    }
    
    return this.conversationHistory[this.conversationHistory.length - 1];
  }

  /**
   * Save the memory to a file
   * @param {string} filePath - Path to the file
   */
  save(filePath) {
    const data = {
      id: this.id,
      conversation_history: this.conversationHistory,
      context: this.context,
      recall_method: this.recallMethod
    };
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

  /**
   * Load a memory from a file
   * @param {string} filePath - Path to the file
   * @returns {Memory} The loaded memory
   * @static
   */
  static load(filePath) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    return new Memory(
      data.id,
      data.conversation_history,
      data.context,
      data.recall_method
    );
  }
}

module.exports = Memory;
