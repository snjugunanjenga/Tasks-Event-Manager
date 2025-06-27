const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../config/swagger');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors()); // Enable CORS for frontend
app.use(express.json()); // Parse JSON bodies

// Connect to MongoDB
connectDB();

// API routes
app.use('/api/users', require('../routes/authRoutes'));
app.use('/api/tasks', require('../routes/taskRoutes'));
app.use('/api/events', require('../routes/eventRoutes'));

// Swagger Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));