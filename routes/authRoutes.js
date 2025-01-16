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

  if (!username || !password) {
    return res.redirect('/auth/loginAdmin?error=true&message=Username%20dan%20password%20dibutuhkan');
  }

  db.query("SELECT * FROM admin WHERE username = ?", [username], (err, result) => {
    if (err || result.length === 0) {
      return res.redirect('/auth/loginAdmin?error=true&message=Admin%20tidak%20ditemukan');
    }

    const storedPassword = result[0]?.password;
    bcrypt.compare(password, storedPassword, (err, isMatch) => {
      if (err || !isMatch) {
        return res.redirect('/auth/loginAdmin?error=true&message=Password%20salah');
      }

      req.session.userId = result[0].id;
      req.session.username = result[0].username;
      req.session.role = 'admin';
      res.redirect('/homeAdmin');
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
