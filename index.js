const express = require('express');
require('dotenv').config();
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');

// LLM Client.
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Variables.
const API_KEY = process.env.API_KEY;
const PORT = process.env.PORT || 3000;
const SESSION_KEY = process.env.SESSION_KEY;

// Create new API Client
const client = new GoogleGenerativeAI(API_KEY);
const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });

const app = express();

// Configure view engine.
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs'); //ejs to render html templates

// Middlewares
// Configure session middleware
app.use(session({
    secret: SESSION_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); //serve static files from the public folder.


// Home route. 
app.get('/', (req, res) => {
    // Initialize new conversation history whether or not it exists.(reload effect)
    if (!req.session.conversation || req.session.conversation) {
        req.session.conversation = [];
    }
    
    res.render('index', { conversation: req.session.conversation }); //render the page content with conversation history.
})

// Query route.
app.post('/generate-text', async (req, res) => {
    const prompt = req.body.prompt;

    if (!prompt) {
        return res.status(400).send('BAD_REQUEST: Please input a valid prompt');
    }

    try {
        const response = await model.generateContent(prompt);

        // Google generative AI could return responses where certain parts of the response object are callable funtions.
        // And not plain text, Hence these functions should be called and awaited.

        const generatedText = await response.response.text();

        req.session.conversation.push({
            user: prompt,
            ai: generatedText
        });

        res.render('index', { conversation: req.session.conversation}); //re-render the page content with response data.

        // return res.status(200).json({ reply: response });

    } catch (e) {
        console.error(e.message);

        return res.status(500).json({errorStatus: 'Internal Server Error'});
    }
})

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

