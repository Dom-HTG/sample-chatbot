const express = require('express');
require('dotenv').config();

const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = process.env.API_KEY;
const PORT = 4267;

// Create new API Client
const client = new GoogleGenerativeAI(API_KEY);
const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });

const app = express();

app.use(express.json());

app.post('/generate-text', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).send('BAD_REQUEST: Please input a valid prompt');
    }

    try {
        const response = await model.generateContent(prompt);
        return res.status(200).json({ reply: response });

    } catch (e) {
        console.error(e.message);

        return res.status(500).json({errorStatus: 'Internal Server Error', e: e.message});
    }
})

app.listen(PORT, () => console.log(`Listening on port ${PORT}`))

