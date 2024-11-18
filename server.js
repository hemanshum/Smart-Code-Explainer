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
                prompt = `Please explain this code in detail:\n${code}`;
                break;
            case 'bugs':
                prompt = `Please analyze this code for potential bugs and issues:\n${code}`;
                break;
            case 'improve':
                prompt = `Please suggest improvements for this code:\n${code}`;
                break;
            default:
                prompt = `Please explain this code:\n${code}`;
        }

        // Call Ollama API
        const response = await axios.post('http://localhost:11434/api/generate', {
            model: "llama3.2",
            prompt: prompt,
            stream: false
        });

        res.json({ analysis: response.data.response });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to analyze code' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});