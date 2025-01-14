const express = require('express');
const router = express.Router();

// Middleware untuk otentikasi admin
const { isAuthenticated } = require('../Middleware/MiddlewareAdmin');

// Halaman Dashboard Admin
router.get('/dashboard', isAuthenticated, (req, res) => {
  res.render('pages/dashboardAdmin', { title: 'Dashboard Admin' });
});

// Halaman Tambah Admin
router.get('/addAdmin', isAuthenticated, (req, res) => {
  res.render('pages/registerAdmin', { title: 'Tambah Admin' });
});

// Logout Admin
router.post('/logoutAdmin', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Logout gagal');
    }
    res.redirect('/auth/loginAdmin');
  });
});

module.exports = router;
