require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const paymentRoutes = require('./routes/paymentRoutes');
const healthRoutes = require('./routes/healthRoutes');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/payments', paymentRoutes);
app.use('/health', healthRoutes);

// Error Handling Middleware
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});