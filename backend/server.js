const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Importa il file delle rotte delle vacanze
const vacationRoutes = require('./routes/vacations');

dotenv.config(); // Carica le variabili d'ambiente dal file .env

const app = express();

// Configura il middleware CORS
app.use(cors({
    origin: 'https://daveethe.github.io', // Sostituisci con il tuo dominio o frontend specifico
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true // Permette di inviare cookie insieme alla richiesta
}));

app.use(express.json()); // Middleware per il parsing del JSON

// Configura le rotte
app.use('/api/vacations', vacationRoutes);

// Connessione a MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');

        // Usa la variabile d'ambiente PORT assegnata da Render
        const PORT = process.env.PORT || 3000;  // Utilizza 3000 come default solo in locale
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => console.error('Error connecting to MongoDB:', err));
