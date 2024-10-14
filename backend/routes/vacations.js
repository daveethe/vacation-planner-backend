const express = require('express');
const Vacation = require('../models/Vacation');
const bcrypt = require('bcrypt');
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();

router.post('/verifyPassword', async (req, res) => {
    console.log('Password ricevuta:', req.body.password);
    const hash = process.env.PASSWORD_HASH;
    console.log('Hash recuperato:', hash);

    try {
        const match = await bcrypt.compare(req.body.password, hash);
        if (match) {
            console.log('Password corretta');
            return res.json({ success: true });
        } else {
            console.log('Password errata');
            return res.json({ success: false });
        }
    } catch (error) {
        console.error('Errore durante la verifica della password:', error);
        return res.status(500).json({ success: false, message: 'Errore interno del server' });
    }
});

// Recupera i dettagli di una singola vacanza
router.get('/:id', async (req, res) => {
    try {
        const vacation = await Vacation.findById(req.params.id);
        if (!vacation) {
            return res.status(404).json({ error: 'Vacation not found' });
        }

        // Ordina l'itinerario per data e ora
        vacation.itinerary = vacation.itinerary.sort((a, b) => {
            // Combina la data e l'ora in un singolo oggetto Date
            const dateA = new Date(`${a.date.toISOString().split('T')[0]}T${a.time || '00:00'}`);
            const dateB = new Date(`${b.date.toISOString().split('T')[0]}T${b.time || '00:00'}`);
            
            return dateA - dateB; // Ordine crescente
        });

        // Log per verificare l'ordine degli itinerari
        console.log('Itinerary after sorting:', vacation.itinerary);

        res.json(vacation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Recupera tutte le vacanze
router.get('/', async (req, res) => {
    try {
        const vacations = await Vacation.find();
        console.log('Vacations recuperate:', vacations);  // Log per verificare il recupero dei dati
        res.json(vacations);
    } catch (err) {
        console.error('Errore nel recupero delle vacanze:', err);
        res.status(500).json({ message: err.message });
    }
});


// Crea una nuova vacanza
router.post('/', async (req, res) => {
    try {
        const vacation = new Vacation(req.body);
        await vacation.save();
        res.status(201).json(vacation);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Aggiorna una vacanza esistente
router.put('/:id', async (req, res) => {
    try {
        const updatedVacation = await Vacation.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                startDate: req.body.startDate,
                endDate: req.body.endDate,
            },
            { new: true }
        );

        if (!updatedVacation) {
            return res.status(404).json({ error: 'Vacation not found' });
        }

        res.json(updatedVacation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Cancella una vacanza
router.delete('/:id', async (req, res) => {
    try {
        const vacation = await Vacation.findByIdAndDelete(req.params.id);
        if (!vacation) {
            return res.status(404).json({ error: 'Vacation not found' });
        }
        res.json({ message: 'Vacation deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Aggiungi un volo a una vacanza
router.post('/:vacationId/flights', async (req, res) => {
    try {
        const vacation = await Vacation.findById(req.params.vacationId);
        if (!vacation) {
            return res.status(404).json({ error: 'Vacation not found' });
        }
        const flightData = {
            airline: req.body.airline,
            flightNumber: req.body.flightNumber,
            departureAirport: req.body.departureAirport,
            arrivalAirport: req.body.arrivalAirport,
            departureTime: req.body.departureTime,
            arrivalTime: req.body.arrivalTime
        };

        vacation.flights.push(flightData); // Usa flightData invece di req.body
        await vacation.save();
        res.status(201).json(vacation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Aggiorna un volo esistente
router.put('/:vacationId/flights/:flightId', async (req, res) => {
    try {
        const vacation = await Vacation.findById(req.params.vacationId);
        if (!vacation) {
            return res.status(404).json({ error: 'Vacation not found' });
        }

        const flight = vacation.flights.id(req.params.flightId);
        if (!flight) {
            return res.status(404).json({ error: 'Flight not found' });
        }

        // Aggiorna tutti i campi necessari del volo
        flight.airline = req.body.airline;
        flight.flightNumber = req.body.flightNumber;
        flight.departureAirport = req.body.departureAirport; // Aggiunto
        flight.arrivalAirport = req.body.arrivalAirport; // Aggiunto
        flight.departureTime = req.body.departureTime;
        flight.arrivalTime = req.body.arrivalTime;

        await vacation.save();
        res.status(200).json(vacation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Elimina un volo esistente
router.delete('/:vacationId/flights/:flightId', async (req, res) => {
    try {
        const vacation = await Vacation.findById(req.params.vacationId);
        if (!vacation) {
            return res.status(404).json({ error: 'Vacation not found' });
        }

        const flight = vacation.flights.id(req.params.flightId);
        if (!flight) {
            return res.status(404).json({ error: 'Flight not found' });
        }

        vacation.flights.pull(req.params.flightId);  // Usa .pull() per rimuovere il subdocumento

        await vacation.save();  // Salva le modifiche nel database
        res.status(200).json(vacation);
    } catch (err) {
        console.error(err);  // Log dell'errore per debug
        res.status(500).json({ error: 'Errore durante l\'eliminazione del volo' });
    }
});

// Aggiungi un hotel a una vacanza
router.post('/:vacationId/hotels', async (req, res) => {
    try {
        const vacation = await Vacation.findById(req.params.vacationId);
        if (!vacation) {
            return res.status(404).json({ error: 'Vacation not found' });
        }
        vacation.hotels.push(req.body);
        await vacation.save();
        res.status(201).json(vacation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Aggiorna un hotel esistente
router.put('/:vacationId/hotels/:hotelId', async (req, res) => {
    try {
        const vacation = await Vacation.findById(req.params.vacationId);
        if (!vacation) {
            return res.status(404).json({ error: 'Vacation not found' });
        }

        const hotel = vacation.hotels.id(req.params.hotelId);
        if (!hotel) {
            return res.status(404).json({ error: 'Hotel not found' });
        }

        hotel.name = req.body.name;
        hotel.address = req.body.address;
        hotel.checkInDate = req.body.checkInDate;
        hotel.checkOutDate = req.body.checkOutDate;

        await vacation.save();
        res.status(200).json(vacation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Elimina un hotel esistente
router.delete('/:vacationId/hotels/:hotelId', async (req, res) => {
    try {
        const vacation = await Vacation.findById(req.params.vacationId);
        if (!vacation) {
            return res.status(404).json({ error: 'Vacation not found' });
        }

        // Utilizza il metodo pull per rimuovere l'hotel dall'array
        const hotel = vacation.hotels.id(req.params.hotelId);
        if (!hotel) {
            return res.status(404).json({ error: 'Hotel not found' });
        }

        vacation.hotels.pull(req.params.hotelId);  // Usa .pull() per rimuovere il subdocumento

        await vacation.save();  // Salva le modifiche nel database
        res.status(200).json(vacation);
    } catch (err) {
        console.error(err);  // Log dell'errore per debug
        res.status(500).json({ error: 'Errore durante l\'eliminazione dell\'hotel' });
    }
});

// Aggiungi un itinerario a una vacanza
router.post('/:vacationId/itinerary', async (req, res) => {
    try {
        const vacation = await Vacation.findById(req.params.vacationId);
        if (!vacation) {
            return res.status(404).json({ error: 'Vacation not found' });
        }

        const itineraryItem = {
            date: req.body.date,
            time: req.body.time,
            activities: req.body.activities,
            coordinates: req.body.coordinates // Aggiungi le coordinate
        };

        vacation.itinerary.push(itineraryItem);
        await vacation.save();
        res.status(201).json(vacation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Aggiungi un marker manuale all'itinerario di una vacanza
router.post('/:vacationId/markers', async (req, res) => {
    try {
        console.log("Dati ricevuti dal client:", req.body);  // Log dei dati ricevuti

        const { date, time, description, coordinates } = req.body;

        // Validazione dei dati
        if (!date || !time || !description || !coordinates || typeof coordinates.lat !== 'number' || typeof coordinates.lng !== 'number') {
            return res.status(400).json({ error: 'Dati mancanti o invalidi' });
        }

        const vacation = await Vacation.findById(req.params.vacationId);
        if (!vacation) {
            return res.status(404).json({ error: 'Vacation not found' });
        }

        // Trova o crea la giornata di itinerario specifica per la data
        let itineraryDay = vacation.itinerary.find(day => day.date.toISOString().split('T')[0] === new Date(date).toISOString().split('T')[0]);

        if (!itineraryDay) {
            // Se non esiste un itinerario per quella data, creane uno nuovo
            itineraryDay = {
                date: new Date(date),
                activities: []
            };
            vacation.itinerary.push(itineraryDay);
        }

        // Aggiungi la nuova attività con le coordinate
        itineraryDay.activities.push({
            description,
            time,
            coordinates: {
                lat: coordinates.lat,
                lng: coordinates.lng
            }
        });

        // Salva le modifiche nel database
        await vacation.save();
        console.log("Itinerario aggiornato:", vacation.itinerary);  // Log dell'itinerario aggiornato
        res.status(201).json(vacation);  // Invia i dati aggiornati al client
    } catch (err) {
        console.error('Errore durante il salvataggio dell\'itinerario:', err.message);
        res.status(500).json({ error: err.message });
    }
});


// Collega il marker all'itinerario esistente
router.put('/:vacationId/markers/:markerId', async (req, res) => {
    try {
        const vacation = await Vacation.findById(req.params.vacationId);
        if (!vacation) {
            return res.status(404).json({ error: 'Vacation not found' });
        }

        const marker = vacation.itinerary.id(req.params.markerId);
        if (!marker) {
            return res.status(404).json({ error: 'Marker not found' });
        }

        marker.date = req.body.date;
        marker.time = req.body.time;
        marker.description = req.body.description;
        marker.coordinates = req.body.coordinates;

        await vacation.save();
        res.status(200).json(vacation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



// Aggiorna un itinerario esistente
router.put('/:vacationId/itinerary/:itineraryId', async (req, res) => {
    try {
        const vacation = await Vacation.findById(req.params.vacationId);
        if (!vacation) {
            return res.status(404).json({ error: 'Vacation not found' });
        }

        const itinerary = vacation.itinerary.id(req.params.itineraryId);
        if (!itinerary) {
            return res.status(404).json({ error: 'Itinerary not found' });
        }

        // Aggiorna la data, l'orario e le attività
        itinerary.date = req.body.date;
        itinerary.time = req.body.time;  // Aggiungi questa linea per aggiornare l'orario
        itinerary.activities = req.body.activities;

        await vacation.save();
        res.status(200).json(vacation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Elimina un itinerario esistente
router.delete('/:vacationId/itinerary/:itineraryId', async (req, res) => {
    try {
        const vacation = await Vacation.findById(req.params.vacationId);
        if (!vacation) {
            return res.status(404).json({ error: 'Vacation not found' });
        }

        const itinerary = vacation.itinerary.id(req.params.itineraryId);
        if (!itinerary) {
            return res.status(404).json({ error: 'Itinerary not found' });
        }

        vacation.itinerary.pull(req.params.itineraryId);  // Usa .pull() per rimuovere il subdocumento

        await vacation.save();  // Salva le modifiche nel database
        res.status(200).json(vacation);
    } catch (err) {
        console.error(err);  // Log dell'errore per debug
        res.status(500).json({ error: 'Errore durante l\'eliminazione dell\'itinerario' });
    }
});


// Aggiorna un marker esistente
router.put('/:vacationId/markers/:markerId', async (req, res) => {
    try {
        const vacation = await Vacation.findById(req.params.vacationId);
        if (!vacation) {
            return res.status(404).json({ error: 'Vacation not found' });
        }

        const marker = vacation.markers.id(req.params.markerId);
        if (!marker) {
            return res.status(404).json({ error: 'Marker not found' });
        }

        marker.date = req.body.date;
        marker.time = req.body.time;
        marker.description = req.body.description;
        marker.coordinates = req.body.coordinates;

        await vacation.save();
        res.status(200).json(vacation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Elimina un marker esistente
router.delete('/:vacationId/markers/:markerId', async (req, res) => {
    try {
        const vacation = await Vacation.findById(req.params.vacationId);
        if (!vacation) {
            return res.status(404).json({ error: 'Vacation not found' });
        }

        const marker = vacation.markers.id(req.params.markerId);
        if (!marker) {
            return res.status(404).json({ error: 'Marker not found' });
        }

        vacation.markers.pull(req.params.markerId);

        await vacation.save();
        res.status(200).json(vacation);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error deleting marker' });
    }
});


// Aggiungi una nuova spesa a una vacanza
router.post('/:vacationId/expenses', async (req, res) => {
    try {
        const vacation = await Vacation.findById(req.params.vacationId);
        if (!vacation) {
            return res.status(404).json({ error: 'Vacation not found' });
        }

        const expense = {
            amount: req.body.amount,
            category: req.body.category,
            description: req.body.description,
        };

        // Aggiungi la spesa alla vacanza
        vacation.expenses.push(expense);
        await vacation.save();

        // Trova l'ultima spesa aggiunta (quella appena salvata)
        const newExpense = vacation.expenses[vacation.expenses.length - 1];

        res.status(201).json(newExpense);  // Restituisci l'intera spesa con l'ID
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Recupera tutte le spese di una vacanza
router.get('/:vacationId/expenses', async (req, res) => {
    try {
        const vacation = await Vacation.findById(req.params.vacationId);
        if (!vacation) {
            return res.status(404).json({ error: 'Vacation not found' });
        }

        res.json(vacation.expenses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Elimina una spesa specifica di una vacanza
router.delete('/:vacationId/expenses/:expenseId', async (req, res) => {
    try {
        const vacation = await Vacation.findById(req.params.vacationId);
        if (!vacation) {
            return res.status(404).json({ error: 'Vacation not found' });
        }

        // Rimuovi la spesa dall'array
        const expenseIndex = vacation.expenses.findIndex(exp => exp._id.toString() === req.params.expenseId);
        if (expenseIndex === -1) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        vacation.expenses.splice(expenseIndex, 1);  // Rimuovi la spesa dall'array
        await vacation.save();  // Salva le modifiche

        res.status(204).send();  // Risposta vuota ma con successo
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;
