const path = require('path')
const express = require('express')
const app = express()
const dotenv = require('dotenv')
const cors = require('cors')

dotenv.config()

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(origin => origin.trim());
// Configure CORS
const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X_API_KEY'], // Allowed headers
    credentials: true // Allow cookies if needed
  }

  // Apply CORS middleware before other routes
  app.use(cors(corsOptions))

app.set('views', path.join(__dirname, 'views'));

//Static Folder
app.use(express.static("api"));

//body parsing
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Add this new route handler
app.post('/api/check-business', async (req, res) => {
    try {
        const { businessName, lineOfBusiness } = req.body;
        
        // Validate input
        if (!businessName || !lineOfBusiness) {
            return res.status(400).json({ error: 'Business name and type are required' });
        }

        // Your API key and URL are now securely stored server-side
        const apiKey = process.env.BN_COMPLIANCE_API_KEY;
        const apiUrl = process.env.BN_COMPLIANCE_API_URL;

        if (!apiUrl || !apiKey) {
            return res.status(500).json({ error: 'API configuration incomplete' });
        }

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': apiKey,
                'Accept': 'application/json',
                'X_API_KEY': apiKey
            },
            body: JSON.stringify({
                proposedName: businessName,
                lineOfBusiness: lineOfBusiness
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        console.error('Error in API proxy:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Internal server error', 
            message: error.message 
         });
    }
});

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})