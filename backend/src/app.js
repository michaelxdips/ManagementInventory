const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({
  origin: ["http://localhost:5173"],
  credentials: true,
}));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

module.exports = app;

const barangMasukRoutes = require("./routes/barangMasuk.routes");

app.use("/api/barang-masuk", barangMasukRoutes);

const atkItemRoutes = require("./routes/atkItem.routes");

app.use("/api/atk-items", atkItemRoutes);

const barangKeluarRoutes = require("./routes/barangKeluar.routes");

app.use("/api/barang-keluar", barangKeluarRoutes);

const unitsRoutes = require("./routes/units.routes");
app.use("/api/units", unitsRoutes);

const requestsRoutes = require("./routes/requests.routes");
app.use("/api/requests", requestsRoutes);

const approvalRoutes = require("./routes/approval.routes");
app.use("/api/approval", approvalRoutes);

const historyRoutes = require("./routes/history.routes");
const authRoutes = require("./routes/auth.routes");
const barangKosongRoutes = require("./routes/barangKosong.routes");
app.use("/api/history", historyRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/barang-kosong", barangKosongRoutes);
