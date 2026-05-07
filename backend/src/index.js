require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/plates', require('./routes/plates'));
app.use('/api/users', require('./routes/users'));

app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'PlateX API running' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal server error' });
});

async function start() {
    await initDB();
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}

start().catch(console.error);