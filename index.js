const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes/routes');
require('dotenv').config();
const cors = require('cors');

const mongoString = process.env.DATABASE_URL;
mongoose.connect(mongoString);
const database = mongoose.connection;

database.on('error', (error) => {
    console.log(error);
})

database.once('connected', () => {
    console.log('Database Connected');
})

const app = express();

// enabling CORS for all requests
app.use(cors());
app.use(express.json());
app.use('/api', routes)

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server Started at ${3000}`)
})