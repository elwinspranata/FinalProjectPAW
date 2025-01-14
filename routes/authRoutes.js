const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../Database/db');

// Halaman Login Admin
router.get('/loginAdmin', (req, res) => {
  res.render('pages/loginAdmin', { title: 'Login Admin' });
});

// Proses Login Admin
router.post('/loginAdmin', (req, res) => {
  const { username, password } = req.body;
  const query = "SELECT * FROM users WHERE username = ?";
  
  db.query(query, [username], (err, result) => {
    if (err) {
      console.error('Error saat login:', err);
      return res.status(500).send('Terjadi kesalahan pada server.');
    }
    if (result.length === 0) {
      return res.redirect('/auth/loginAdmin?error=true&message=Admin tidak ditemukan');
    }
    
    bcrypt.compare(password, result[0].password, (err, isMatch) => {
      if (err) return res.status(500).send('Terjadi kesalahan server.');
      if (!isMatch) {
        return res.redirect('/auth/loginAdmin?error=true&message=Password salah');
      }
      req.session.userId = result[0].id;
      req.session.username = result[0].username;
      res.redirect('/index');
    });
  });
});

// Registrasi Admin
router.post('/registerusers', (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  const query = "INSERT INTO users (username, password) VALUES (?, ?)";
  db.query(query, [username, hashedPassword], (err, result) => {
    if (err) {
      console.error('Error saat registrasi:', err);
      return res.status(500).send('Gagal mendaftarkan admin.');
    }
    res.redirect('/loginAdmin');
  });
});

module.exports = router;
