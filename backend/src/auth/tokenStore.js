// Simple in-memory token store. Replace with persistent/JWT in production.
const tokens = new Map(); // token -> userId

function save(token, userId) {
  tokens.set(token, userId);
}

function get(token) {
  return tokens.get(token);
}

function remove(token) {
  tokens.delete(token);
}

function clear() {
  tokens.clear();
}

module.exports = { save, get, remove, clear };
