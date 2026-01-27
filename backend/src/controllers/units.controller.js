const bcrypt = require('bcryptjs');
const { listUnits, createUnit, findByUsername } = require('../models/units.model');
const { findByUsername: findUserByUsername, createUser } = require('../models/users.model');

exports.index = async (_req, res) => {
  try {
    const rows = await listUnits();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil data unit' });
  }
};

exports.store = async (req, res) => {
  const { unitName, username, password } = req.body || {};
  if (!unitName || !username || !password) {
    return res.status(400).json({ message: 'Data tidak lengkap' });
  }
  try {
    const [unitExists, userExists] = await Promise.all([
      findByUsername(username),
      findUserByUsername(username),
    ]);
    if (unitExists || userExists) return res.status(409).json({ message: 'Username sudah dipakai' });

    const unitId = await createUnit({ name: unitName, username });
    const password_hash = await bcrypt.hash(password, 10);
    await createUser({ name: unitName, username, password_hash, role: 'user', unit_id: unitId });

    res.status(201).json({ id: unitId, name: unitName, username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal menambah unit' });
  }
};
