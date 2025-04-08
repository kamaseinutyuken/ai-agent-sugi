/**
 * Mastra AI Framework - Example Usage with Express
 */
const express = require('express');
const { MastraAI } = require('./src/mastra');
const { Workflow, Agent, Tool, Memory } = require('./src/mastra/core');
const { createRAG } = require('./src/mastra/rag');
const { createEvaluations } = require('./src/mastra/evaluations');
const { createVoice } = require('./src/mastra/voice');
const { 
  createAISDKIntegration,
  createDatabaseIntegration,
  createVectorDBIntegration
} = require('./src/mastra/integrations');

const app = express();
const port = 3000;

const mastra = new MastraAI();

const workflow = new Workflow('task-automation', [
  {
    id: 'define-task',
    type: 'agent',
    agent_name: 'task-definer',
    conditions: []
  },
  {
    id: 'select-tools',
    type: 'agent',
    agent_name: 'tool-selector',
    conditions: [
      {
        type: 'equals',
        left: { type: 'context', path: 'last_step_result.status' },
        right: 'success'
      }
    ]
  }
]);

const agent = new Agent('task-definer', {}, {}, [
  {
    name: 'define-task-tool',
    function: (input) => {
      return {
        task_definition: 'Defined task based on input',
        status: 'success'
      };
    }
  }
]);

const tool = new Tool('api-caller', [
  { name: 'url', required: true },
  { name: 'method', required: true }
], [
  { name: 'response', required: true }
], (input) => {
  return {
    response: {
      status: 200,
      data: { message: 'API response' }
    }
  };
});

const memory = new Memory('user-memory');

mastra.registerWorkflow(workflow);
mastra.registerAgent(agent);
mastra.registerTool(tool);
mastra.registerMemory(memory);

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Mastra AI Framework Example');
});

app.post('/api/process', (req, res) => {
  const userInput = req.body.input || "フレームワークを一般化する";
  const response = mastra.processInput(userInput);
  res.json({ response });
});

app.listen(port, () => {
  console.log(`Mastra AI Framework Example running at http://localhost:${port}`);
});
