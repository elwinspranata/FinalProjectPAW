const express = require('express');
const router = express.Router();
const db = require('../Database/db');
const { isAuthenticated } = require('../Middleware/Middleware');

// Halaman Profil Penumpang
router.get('/profile', isAuthenticated, (req, res) => {
  const query = "SELECT * FROM penumpang WHERE id = ?";
  db.query(query, [req.session.userId], (err, result) => {
    if (err) {
      console.error('Error saat mengambil data penumpang:', err);
      return res.status(500).send('Terjadi kesalahan server.');
    }
    res.render('pages/profile', { title: 'Profil Penumpang', user: result[0] });
  });
});

// Halaman Pemesanan Tiket
router.get('/booking', isAuthenticated, (req, res) => {
  res.render('pages/booking', { title: 'Pemesanan Tiket' });
});

// Proses Pemesanan Tiket
router.post('/booking', isAuthenticated, (req, res) => {
  const { nama_penumpang, nomor_identitas, rute, tanggal, kelas, kursi } = req.body;
  const query = "INSERT INTO pemesanan (id_penumpang, nama_penumpang, nomor_identitas, rute, tanggal, kelas, kursi) VALUES (?, ?, ?, ?, ?, ?, ?)";
  
  db.query(query, [req.session.userId, nama_penumpang, nomor_identitas, rute, tanggal, kelas, kursi], (err, result) => {
    if (err) {
      console.error('Error saat melakukan pemesanan:', err);
      return res.status(500).send('Gagal melakukan pemesanan tiket.');
    }
    res.redirect('/customer/profile');
  });
});

module.exports = router;
