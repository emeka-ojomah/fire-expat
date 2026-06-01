require('dotenv').config();

console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('KEY starts with:', process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 20));

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());


const authRoutes        = require('./routes/auth');
const profileRoutes     = require('./routes/profile');
const transactionRoutes = require('./routes/transactions');
const exchangeRoutes    = require('./routes/exchange');

app.use('/api/auth',         authRoutes);
app.use('/api/profile',      profileRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/exchange',     exchangeRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is alive' });
});


app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});


app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
  console.log(`   Routes: /api/auth | /api/profile | /api/transactions | /api/exchange`);
});
