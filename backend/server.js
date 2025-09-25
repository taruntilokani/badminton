// Backend API entry point
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URL || 'mongodb://db:27017/badminton', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Routes

app.get('/', (req, res) => res.send('Badminton Racket Repair Service API'));
app.use('/api/orders', require('./routes/order'));
app.use('/api/users', require('./routes/user'));
app.use('/api/vendors', require('./routes/vendor'));
app.use('/api/riders', require('./routes/rider'));
app.use('/api/admin', require('./routes/admin'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
>>>>>>> REPLACE
