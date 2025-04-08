/**
 * Simple server for the Mastra AI Voice Recognition Demo
 */
const express = require('express');
const path = require('path');
const app = express();
const port = 8080;

app.use(express.static('demo'));
app.use('/dist', express.static('dist'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'demo', 'voice-recognition.html'));
});

app.listen(port, () => {
  console.log(`Mastra AI Voice Recognition Demo running at http://localhost:${port}`);
});
