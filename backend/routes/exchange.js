const express = require('express');
const router = express.Router();
const axios = require('axios');
const authMiddleware = require('../middleware/authMiddleware');


router.get('/rate/:from/:to', authMiddleware, async (req, res) => {
  const { from, to } = req.params;


  if (from.toUpperCase() === to.toUpperCase()) {
    return res.status(200).json({ from, to, rate: 1 });
  }

  try {
    const apiKey = process.env.EXCHANGE_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Exchange API key not configured' });
    }

    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${from.toUpperCase()}/${to.toUpperCase()}`;
    const response = await axios.get(url);

    if (response.data.result !== 'success') {
      return res.status(400).json({ error: 'Failed to fetch exchange rate', detail: response.data['error-type'] });
    }

    const rate = response.data.conversion_rate;

    return res.status(200).json({
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      rate,
      last_updated: response.data.time_last_update_utc,
    });
  } catch (err) {
    console.error('Exchange rate error:', err.message);


    return res.status(502).json({ error: 'Exchange rate service unavailable. Please try again.' });
  }
});


router.get('/supported', authMiddleware, async (req, res) => {
  const supported = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'NGN', name: 'Nigerian Naira' },
    { code: 'AED', name: 'UAE Dirham' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'CNY', name: 'Chinese Yuan' },
    { code: 'INR', name: 'Indian Rupee' },
  ];
  return res.status(200).json(supported);
});

module.exports = router;
