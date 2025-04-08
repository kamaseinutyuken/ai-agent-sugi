/**
 * Mastra AI Framework - Output Formatter
 */

/**
 * Format the response for output
 * @param {Object} response - The response to format
 * @returns {string} The formatted response
 */
function formatOutput(response) {
  let formatted = "◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢\n";
  
  if (response.greeting) {
    formatted += response.greeting + "\n";
  }
  
  if (response.abstracted_intent) {
    formatted += "🎯 [抽象化した意図]\n";
    
    if (response.abstracted_intent.original_intent) {
      formatted += "Original Intent:\n ";
      formatted += response.abstracted_intent.original_intent + "\n\n";
    }
    
    if (response.abstracted_intent.want_or_need_intent) {
      formatted += "Want or Need Intent:\n ";
      formatted += response.abstracted_intent.want_or_need_intent + "\n\n";
    }
  }
  
  if (response.goals && response.goals.length > 0) {
    formatted += "🚩 [達成したい目標]\n";
    response.goals.forEach((goal, index) => {
      if (index === 0) {
        formatted += `✅ ${goal}\n`;
      } else {
        formatted += ` ✅ ${goal}\n`;
      }
    });
    formatted += "\n";
  }
  
  if (response.tasks && response.tasks.length > 0) {
    formatted += "📌 [タスク分解]\n";
    response.tasks.forEach(task => {
      const taskId = task.id || "";
      const description = task.description || "";
      const details = task.details || "";
      
      formatted += `[Task ${taskId}]\n`;
      formatted += ` ${description}\n`;
      if (details) {
        formatted += ` ${details}\n`;
      }
    });
    formatted += "\n";
  }
  
  if (response.agent_execution_stack && response.agent_execution_stack.length > 0) {
    formatted += "🧩 [エージェントの実行スタック]\n";
    response.agent_execution_stack.forEach(agent => {
      const agentId = agent.id || "";
      const task = agent.task || "";
      const assignedAgent = agent.assigned_agent || "";
      const description = agent.description || "";
      const expectedOutcome = agent.expected_outcome || "";
      
      if (agentId === 1) {
        formatted += "①\n";
      } else {
        const symbols = "①②③④⑤⑥⑦⑧⑨⑩";
        formatted += `${symbols[agentId - 1]}\n`;
      }
      formatted += `Task: ${task}\n`;
      formatted += `Assigned Agent: ${assignedAgent}\n`;
      formatted += `Description: ${description}\n`;
      formatted += `Expected Outcome: ${expectedOutcome}\n`;
    });
    formatted += "\n";
  }
  
  if (response.prompt_and_tools) {
    formatted += "🛠️ [必要なプロンプトとツールの例]\n";
    
    if (response.prompt_and_tools.prompt_example) {
      formatted += "Prompt例：\n";
      formatted += response.prompt_and_tools.prompt_example + "\n\n";
    }
    
    if (response.prompt_and_tools.tools_example && response.prompt_and_tools.tools_example.length > 0) {
      formatted += "必要ツール例：\n";
      response.prompt_and_tools.tools_example.forEach(tool => {
        formatted += `${tool}\n`;
      });
    }
    formatted += "\n";
  }
  
  if (response.feedback_loop) {
    formatted += "🔄 [フィードバックループ例]\n";
    
    if (response.feedback_loop.evaluation) {
      formatted += "【実行結果の評価】\n";
      Object.entries(response.feedback_loop.evaluation).forEach(([key, value]) => {
        formatted += `- ${key}：${value}\n`;
      });
      formatted += "\n";
    }
    
    if (response.feedback_loop.improvement_points && response.feedback_loop.improvement_points.length > 0) {
      formatted += "【改善ポイント】\n";
      response.feedback_loop.improvement_points.forEach(point => {
        formatted += `- ${point}\n`;
      });
    }
  }
  
  formatted += "\n◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢";
  
  return formatted;
}

module.exports = {
  formatOutput
};
