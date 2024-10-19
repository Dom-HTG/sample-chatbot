const express = require('express');
require('dotenv').config();
const bodyParser = require('body-parser');

const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = process.env.API_KEY;
const PORT = 4267;

// Create new API Client
const client = new GoogleGenerativeAI(API_KEY);
const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });

const app = express();

app.set('view engine', 'ejs'); //ejs to render html templates

//middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public')); //serve static files from the public folder.


app.get('/', (_, res) => {
    res.render('index', { userPrompt: null, aiReply: null });
})

app.post('/generate-text', async (req, res) => {
    const prompt = req.body.prompt;

    if (!prompt) {
        return res.status(400).send('BAD_REQUEST: Please input a valid prompt');
    }

    try {
        const response = await model.generateContent(prompt);
        res.render('index', { userPrompt: prompt, aiReply: response.candidate.content.parts.text});

        return res.status(200).json({ reply: response });

    } catch (e) {
        console.error(e.message);

        return res.status(500).json({errorStatus: 'Internal Server Error', e: e.message});
    }
})

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

