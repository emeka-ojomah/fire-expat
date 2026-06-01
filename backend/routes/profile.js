const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabaseClient');
const authMiddleware = require('../middleware/authMiddleware');


router.get('/', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      return res.status(400).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('GET /profile error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


router.put('/', authMiddleware, async (req, res) => {
  const {
    full_name,
    base_currency,
    monthly_expenses,
    current_savings,
    expected_return,
    target_retirement_age,
  } = req.body;

  if (!full_name || !base_currency) {
    return res.status(400).json({ error: 'Full name and base currency are required' });
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: req.user.id,
          email: req.user.email,
          full_name,
          base_currency,
          monthly_expenses: parseFloat(monthly_expenses) || 0,
          current_savings: parseFloat(current_savings) || 0,
          expected_return: parseFloat(expected_return) || 7.0,
          target_retirement_age: parseInt(target_retirement_age) || 60,
        },
        { onConflict: 'id' }
      )
      .select()
      .single();

    if (error) {
      console.error('Upsert error:', error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile saved successfully',
      profile: data,
    });
  } catch (err) {
    console.error('PUT /profile error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
