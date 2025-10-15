const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initDatabase } = require('./src/database');
const symptomRoutes = require('./src/routes/symptoms');

const app = express();
const PORT = process.env.PORT || 7810;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

initDatabase();

app.use('/api', symptomRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🏥 Healthcare Symptom Checker running on port ${PORT}`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
});