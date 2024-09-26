const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Importa il file delle rotte delle vacanze
const vacationRoutes = require('./routes/vacations');

dotenv.config();

const app = express();

// Configura il middleware CORS
app.use(cors({
    origin: '*', // Sostituisci con il tuo dominio o frontend specifico
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true // Permette di inviare cookie insieme alla richiesta
}));

app.use(express.json());

// Configura le rotte
app.use('/api/vacations', vacationRoutes);

// Connessione a MongoDB
mongoose.connect(process.env.MONGO_URI, {
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Error connecting to MongoDB:', err));

// Avvio del server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
