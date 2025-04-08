/**
 * Mastra AI Framework
 */
const MastraAI = require('./main');
const Core = require('./core');
const { createVoice } = require('./voice');
const { formatOutput } = require('./utils/formatter');
const { createRAG } = require('./rag');
const { createEvaluations } = require('./evaluations');
const Integrations = require('./integrations');

module.exports = {
  MastraAI,
  Core,
  Voice: {
    createVoice
  },
  Utils: {
    formatOutput
  },
  RAG: {
    createRAG
  },
  Evaluations: {
    createEvaluations
  },
  Integrations
};
