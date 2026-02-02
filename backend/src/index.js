import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { specs } from './config/swagger.js';

// Import routes
import authRoutes from './routes/auth.js';
import itemsRoutes from './routes/items.js';
import barangKeluarRoutes from './routes/barangKeluar.js';
import barangMasukRoutes from './routes/barangMasuk.js';
import approvalRoutes from './routes/approval.js';
import historyRoutes from './routes/history.js';
import requestsRoutes from './routes/requests.js';
import unitsRoutes from './routes/units.js';
import barangKosongRoutes from './routes/barangKosong.js';
import usersRoutes from './routes/users.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware - Allow all origins for local network access
app.use(cors({
    origin: true, // Allow any origin (for local network development)
    credentials: true,
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/atk-items', itemsRoutes);
app.use('/api/barang-keluar', barangKeluarRoutes);
app.use('/api/barang-masuk', barangMasukRoutes);
app.use('/api/approval', approvalRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/requests', requestsRoutes);
app.use('/api/units', unitsRoutes);
app.use('/api/barang-kosong', barangKosongRoutes);
app.use('/api/users', usersRoutes);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Endpoint tidak ditemukan' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ message: 'Internal server error' });
});

// Start server - bind to 0.0.0.0 for local network access
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📦 API Base: http://localhost:${PORT}/api`);
    console.log(`🌐 Network access: http://<your-ip>:${PORT}`);
});

export default app;
// Restart trigger 02/02/2026 14:15:18
