const mongoose = require('mongoose');

// Definisci lo schema per i voli
const flightSchema = new mongoose.Schema({
    airline: {
        type: String,
        required: true
    },
    flightNumber: {
        type: String,
        required: true
    },
    departureAirport: {   // Aggiungi il campo per l'aeroporto di partenza
        type: String,
        required: true
    },
    arrivalAirport: {     // Aggiungi il campo per l'aeroporto di arrivo
        type: String,
        required: true
    },
    departureTime: {
        type: Date,
        required: true
    },
    arrivalTime: {
        type: Date,
        required: true
    }
});

// Definisci lo schema per gli hotel
const hotelSchema = new mongoose.Schema({
    name: String,
    address: String,
    checkInDate: Date,
    checkOutDate: Date,
    bookingLink: { type: String, required: false }  // Campo facoltativo
});


// Definisci lo schema per l'itinerario
const itinerarySchema = new mongoose.Schema({
    date: Date,
    time: String, // Aggiungi l'orario
    activities: [String],
    coordinates: {
        lat: Number,
        lng: Number
    }
});

// Definisci lo schema per le spese
const expenseSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        required: true,
        enum: ['flight', 'hotel', 'car', 'groceries', 'activities', 'other'], // Le categorie possibili
    },
    description: {
        type: String,
        required: true,
    }
});

// Aggiorna lo schema delle vacanze per includere voli, hotel e itinerario
const VacationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    flights: [flightSchema],  // Array di oggetti volo
    hotels: [hotelSchema],    // Array di oggetti hotel
    itinerary: [itinerarySchema], // Array di oggetti itinerario
    expenses: [expenseSchema], // Aggiungi le spese come array
});

module.exports = mongoose.model('Vacation', VacationSchema);
