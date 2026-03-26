require('dotenv').config(); // Load environment variables once at the top
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Validate critical environment variables before starting
if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
  console.error('❌ ERROR: MONGODB_URI or JWT_SECRET is not defined in .env');
  process.exit(1);
}

const app = express();

// Configure CORS: Allow your frontend URL in production
app.use(cors());

app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Successfully'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/ai', require('./routes/ai'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});