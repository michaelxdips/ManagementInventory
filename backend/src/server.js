const path = require("path");
// Load .env from repo root (one level above backend)
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const app = require("./app");
const { seedDefaults } = require('./seed/bootstrap');

// App HTTP port (not MySQL). Default 3000; override via .env PORT if needed.
const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await seedDefaults();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to seed defaults', err);
    process.exit(1);
  }
})();
