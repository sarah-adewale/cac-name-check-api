const path = require('path')
const express = require('express')
const app = express()
const dotenv = require('dotenv')

dotenv.config()

app.set('views', path.join(__dirname, 'views'));

//Static Folder
app.use(express.static("api"));

//body parsing
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Add this new route handler
app.post('/', async (req, res) => {
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

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        console.error('Error in API proxy:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(process.env.PORT, () => {
    console.log('Server is running, you better catch it!')
}) 