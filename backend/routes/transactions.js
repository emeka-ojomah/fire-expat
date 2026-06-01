const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabaseClient');
const authMiddleware = require('../middleware/authMiddleware');


router.get('/', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('savings_entries')
      .select('*')
      .eq('user_id', req.user.id)
      .order('entry_date', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json(data || []);
  } catch (err) {
    console.error('GET /transactions error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  const { entry_type, amount, currency, base_amount, exchange_rate, category, notes, entry_date } = req.body;

  if (!entry_type || !amount || !currency) {
    return res.status(400).json({ error: 'entry_type, amount, and currency are required' });
  }
  if (!['income', 'expense'].includes(entry_type)) {
    return res.status(400).json({ error: 'entry_type must be income or expense' });
  }

  try {
    const { data, error } = await supabase
      .from('savings_entries')
      .insert({
        user_id: req.user.id,
        entry_type,
        amount: parseFloat(amount),
        currency,
        base_amount: parseFloat(base_amount) || parseFloat(amount),
        exchange_rate: parseFloat(exchange_rate) || 1,
        category: category || null,
        notes: notes || null,
        entry_date: entry_date || new Date().toISOString().slice(0, 10),
      })
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json({ success: true, message: 'Transaction added', transaction: data });
  } catch (err) {
    console.error('POST /transactions error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const { data: existing, error: fetchError } = await supabase
      .from('savings_entries')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ error: 'Transaction not found or access denied' });
    }

    const { error } = await supabase
      .from('savings_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json({ success: true, message: 'Transaction deleted' });
  } catch (err) {
    console.error('DELETE /transactions/:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
