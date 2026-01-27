const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { findByUsername, findById } = require('../models/users.model');
const tokenStore = require('../auth/tokenStore');

const createToken = () => crypto.randomBytes(24).toString('hex');

exports.login = async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: 'Username dan password wajib diisi' });
  }

  try {
    const user = await findByUsername(username);
    if (!user) return res.status(401).json({ message: 'Kredensial salah' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: 'Kredensial salah' });

    const token = createToken();
    tokenStore.save(token, user.id);

    res.json({
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.me = async (req, res) => {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Tidak ada token' });
  }
  const token = auth.slice(7);
  const userId = tokenStore.get(token);
  if (!userId) return res.status(401).json({ message: 'Token tidak valid' });
  try {
    const user = await findById(userId);
    if (!user) return res.status(401).json({ message: 'User tidak ditemukan' });
    res.json({ id: user.id, name: user.name, username: user.username, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.logout = (req, res) => {
  const auth = req.headers['authorization'];
  if (auth && auth.startsWith('Bearer ')) {
    const token = auth.slice(7);
    tokenStore.remove(token);
  }
  res.json({ message: 'Logged out' });
};

// Utility to clear tokens (for tests/dev)
exports._clearTokens = () => tokenStore.clear();