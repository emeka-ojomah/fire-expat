const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabaseClient');
const authMiddleware = require('../middleware/authMiddleware');

const VALID_CLASSES = ['stocks', 'real_estate', 'cash', 'bonds', 'other'];

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('asset_allocations')
      .select('*')
      .eq('user_id', req.user.id);

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json(data || []);
  } catch (err) {
    console.error('GET /allocations error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Replaces the full set of allocation rows for this user in one call —
// the frontend always sends all five asset classes together.
router.put('/', authMiddleware, async (req, res) => {
  const { allocations } = req.body;

  if (!Array.isArray(allocations) || allocations.length === 0) {
    return res.status(400).json({ error: 'allocations must be a non-empty array' });
  }
  for (const a of allocations) {
    if (!VALID_CLASSES.includes(a.asset_class)) {
      return res.status(400).json({ error: `Invalid asset_class: ${a.asset_class}` });
    }
  }

  try {
    const rows = allocations.map((a) => ({
      user_id: req.user.id,
      asset_class: a.asset_class,
      amount: parseFloat(a.amount) || 0,
      currency: a.currency || 'USD',
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from('asset_allocations')
      .upsert(rows, { onConflict: 'user_id,asset_class' })
      .select();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ success: true, allocations: data });
  } catch (err) {
    console.error('PUT /allocations error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
