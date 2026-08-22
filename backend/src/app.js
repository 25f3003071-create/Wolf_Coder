const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middleware/error.middleware');

const authRoutes = require('./routes/auth.routes');
const donationsRoutes = require('./routes/donations.routes');
const beneficiariesRoutes = require('./routes/beneficiaries.routes');
const allocationsRoutes = require('./routes/allocations.routes');
const expensesRoutes = require('./routes/expenses.routes');
const evidenceRoutes = require('./routes/evidence.routes');
const fraudRoutes = require('./routes/fraud.routes');
const auditRoutes = require('./routes/audit.routes');
const trackingRoutes = require('./routes/tracking.routes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Attach API Routes
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationsRoutes);
app.use('/api/beneficiaries', beneficiariesRoutes);
app.use('/api/allocations', allocationsRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/fraud', fraudRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/track', trackingRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', service: 'ReliefTrack API Engine', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;
