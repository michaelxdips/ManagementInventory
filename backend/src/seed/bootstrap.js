const bcrypt = require('bcryptjs');
const { findByUsername: findUserByUsername, createUser } = require('../models/users.model');
const { findByUsername: findUnitByUsername, createUnit } = require('../models/units.model');

const defaultUnits = [
  { name: 'Business Service', username: 'BS' },
  { name: 'Share Service & General Support', username: 'SSGS' },
  { name: 'Government Service', username: 'GS' },
  { name: 'Performance, Risk & QOS', username: 'PRQ' },
];

const defaultUsers = [
  { name: 'Super Admin', username: 'superadmin', password: 'admin123', role: 'superadmin' },
  { name: 'Admin', username: 'admin', password: 'admin123', role: 'admin' },
  { name: 'User', username: 'user', password: 'user123', role: 'user' },
  { name: 'Viewer', username: 'viewer', password: 'viewer123', role: 'viewer' },
];

async function seedDefaults() {
  // seed units
  for (const u of defaultUnits) {
    const exists = await findUnitByUsername(u.username);
    if (!exists) {
      await createUnit({ name: u.name, username: u.username });
    }
  }

  // seed users
  for (const u of defaultUsers) {
    const exists = await findUserByUsername(u.username);
    if (!exists) {
      const password_hash = await bcrypt.hash(u.password, 10);
      await createUser({ name: u.name, username: u.username, password_hash, role: u.role, unit_id: null });
    }
  }
}

module.exports = { seedDefaults };