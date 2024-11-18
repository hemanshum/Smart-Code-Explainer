const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Endpoint to handle code analysis
app.post('/analyze', async (req, res) => {
    try {
        const { code, analysisType } = req.body;
        
        // Prepare the prompt based on analysis type
        let prompt = '';
        switch(analysisType) {
            case 'explain':
                prompt = `You are a helpful coding assistant. Please explain this code in brief, including its purpose, functionality, and any important patterns or concepts used:\n\n${code}`;
                break;
            case 'bugs':
                prompt = `You are a helpful coding assistant. Please analyze this code for potential bugs, edge cases, and security issues. Provide specific examples and suggestions for improvement:\n\n${code}`;
                break;
            case 'improve':
                prompt = `You are a helpful coding assistant. Please suggest improvements for this code in terms of performance, readability, and best practices. Provide specific examples and explanations:\n\n${code}`;
                break;
            default:
                prompt = `You are a helpful coding assistant. Please explain this code:\n\n${code}`;
        }

        // Call Ollama API
        const response = await axios.post('http://localhost:11434/api/generate', {
            model: 'llama3.2',
            prompt: prompt,
            stream: false
        });

        // Extract the response text
        const result = response.data.response;

        res.json({ result });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ 
            error: 'An error occurred while analyzing the code',
            details: error.message 
        });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log('Make sure Ollama is running with llama2 model installed');
});