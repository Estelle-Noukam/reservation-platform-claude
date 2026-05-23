const express = require('express');
const session = require('express-session');
const PgSession = require('connect-pg-simple')(session);
const path = require('path');
const pool = require('./config/db');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  store: new PgSession({ pool, tableName: 'session' }),
  secret: 'reservation-secret-changez-en-prod',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 24*60*60*1000, sameSite: 'strict' },
}));

app.use(express.static(path.join(__dirname, '../frontend/public')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/users', require('./routes/users'));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
