require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

// ── MIDDLEWARE CONFIGURATIONS ─────────────────────────
app.use(express.json());
// Secure your CORS profile by targeting your production front-end origins explicitly
app.use(cors({ origin: 'http://127.0.0.1:5500' })); 

// ── VIRTUAL IN-MEMORY DATABASE MOCKS ──────────────────
// Replace these arrays with an actual database driver connection (e.g., MongoDB, PostgreSQL, or SQLite)
let users = [];
let appointments = [];

// ── SECURITY ROLE PROTECTION MIDDLEWARE ───────────────
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token missing or invalid.' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Session expired or invalid token structure.' });
    req.user = user;
    next();
  });
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access Denied: Insufficient authorization permissions.' });
    }
    next();
  };
};

// ── RESTFUL API ENDPOINTS ─────────────────────────────

// 1. Identity Registration Route
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phone, password, role, staffCode } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing mandatory registration credentials.' });
    }

    const userExists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (userExists) return res.status(409).json({ error: 'Email matching profile already registered.' });

    // Validate staff access keys securely server-side
    if (role === 'staff' && staffCode !== process.env.STAFF_ACCESS_CODE) {
      return res.status(401).json({ error: 'Invalid backend system deployment authorization code.' });
    }

    // Securely slow-hash the password to prevent brute-force database attacks
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = { id: Date.now(), name, email, phone, password: hashedPassword, role: role || 'customer' };
    users.push(newUser);

    res.status(201).json({ message: 'User infrastructure context mapped successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Internal system error processing user data.' });
  }
});

// 2. Authentication Login Session Generation Route
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) return res.status(400).json({ error: 'Invalid verification token credentials matching.' });

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(400).json({ error: 'Invalid verification token credentials matching.' });

  // Generate a cryptographically signed JWT Token passing identity context safe parameters
  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({ token, user: { name: user.name, email: user.email, role: user.role } });
});

// 3. Secured Customer Order Creation Route
app.post('/api/appointments', authenticateToken, authorizeRoles('customer'), (req, res) => {
  const { service, weight } = req.body;
  if (!service) return res.status(400).json({ error: 'Invalid structural payload request.' });

  const newAppointment = {
    id: Date.now(),
    txn: 'TXN-' + Math.floor(1000 + Math.random() * 9000),
    userId: req.user.id,
    name: req.user.name,
    service,
    weight: weight || 0,
    status: 'Pending'
  };

  appointments.unshift(newAppointment);
  res.status(201).json(newAppointment);
});

// 4. Secured Staff/Admin Active Queue Pipeline Operations Router
app.get('/api/operations/queue', authenticateToken, authorizeRoles('staff', 'admin'), (req, res) => {
  res.json(appointments);
});

// 5. Secured Operations Progression Engine Endpoint
app.patch('/api/operations/queue/:txn/progress', authenticateToken, authorizeRoles('staff', 'admin'), (req, res) => {
  const { txn } = req.params;
  const order = appointments.find(a => a.txn === txn);

  if (!order) return res.status(404).json({ error: 'Resource transactional item reference not found.' });

  let statusTransitions = { 'Pending': 'Processing', 'Processing': 'Ready', 'Ready': 'Picked Up' };
  order.status = statusTransitions[order.status] || order.status;

  res.json(order);
});

// ── BOOTSTRAP LISTENER ENGINE ─────────────────────────
app.listen(PORT, () => console.log(`[SYSTEM RUNNING]: Node Core Engine executing structural operations on port ${PORT}`));