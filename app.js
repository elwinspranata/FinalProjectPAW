// ===========================
// Import Modul dan Konfigurasi
// ===========================
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const session = require("express-session");
const expressLayout = require("express-ejs-layouts");
require("dotenv").config(); // Memuat file .env untuk konfigurasi

// Import Database dan Routes
const db = require("./Database/db");
const customerRoutes = require("./routes/customerRoutes");
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");

// Middleware dan Auth
const { isAuthenticated } = require("./Middleware/Middleware");

// ===========================
// Inisialisasi Aplikasi
// ===========================
const app = express();

// ===========================
// Middleware
// ===========================
app.use(express.static(path.join(__dirname, 'public'))); // File statis (CSS, gambar)
app.use(bodyParser.urlencoded({ extended: true })); // Parsing body dari form
app.use(session({
  secret: process.env.SESSION_SECRET || 'kereta-api-session-secret',
  resave: false,
  saveUninitialized: false
}));

// Set EJS sebagai template engine dan layout
app.use(expressLayout);
app.set('layout', 'layout/main-layout'); // Pastikan file views/layout/main-layout.ejs ada
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ===========================
// Route Utama
// ===========================

// Halaman Login
app.get('/', (req, res) => {
  res.render('pages/index', { title: 'Login - Tiket Kereta Api' });
});

// Proses Login
// Proses Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.send('<h1>Username dan password wajib diisi! <a href="/">Kembali</a></h1>');
  }

  const query = "SELECT * FROM users WHERE username = ?";
  db.query(query, [username], (err, result) => {
    if (err) {
      console.error('Error SQL saat login:', err.message);
      return res.status(500).send(`Terjadi kesalahan server: ${err.message}`);
    }
    if (result.length === 0) {
      return res.send('<h1>Login gagal! Username tidak ditemukan. <a href="/">Kembali</a></h1>');
    }

    bcrypt.compare(password, result[0].password, (err, isMatch) => {
      if (err) {
        console.error('Error pada bcrypt compare:', err.message);
        return res.status(500).send('Terjadi kesalahan server.');
      }
      if (!isMatch) {
        return res.send('<h1>Login gagal! Password salah. <a href="/">Kembali</a></h1>');
      }

      // Simpan session jika login berhasil
      req.session.userId = result[0].id;
      req.session.username = result[0].username;
      console.log(`Login berhasil: ${username}`);
      res.redirect('/index');
    });
  });
});


// Halaman Registrasi
app.get('/register', (req, res) => {
  res.render('pages/register', { title: 'Daftar Penumpang' });
});

// Proses Registrasi
// Proses Registrasi (Perbaikan)
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  const checkQuery = "SELECT * FROM users WHERE username = ?";
  db.query(checkQuery, [username], (err, result) => {
    if (err) {
      console.error('Error saat mengecek username:', err.message);
      return res.status(500).send(`Terjadi kesalahan server: ${err.message}`);
    }
    if (result.length > 0) {
      return res.send('<h1>Registrasi gagal! Username sudah digunakan. <a href="/register">Kembali</a></h1>');
    }

    const hashedPassword = bcrypt.hashSync(password, 10); // Hash password

    // Pastikan nama kolom di tabel sesuai
    const insertQuery = "INSERT INTO users (username, password) VALUES (?, ?)";
    db.query(insertQuery, [username, hashedPassword], (err) => {
      if (err) {
        console.error('Error SQL saat insert data user:', err.message);
        return res.status(500).send(`Terjadi kesalahan server: ${err.message}`);
      }
      res.redirect('/');
    });
  });
});


// ===========================
// Halaman yang Dilindungi Login
// ===========================

// Halaman Beranda
app.get('/home', isAuthenticated, (req, res) => {
  res.render('pages/home', { title: 'Beranda - Tiket KAI', username: req.session.username });
});

// Halaman Pemesanan Tiket
app.get('/booking', isAuthenticated, (req, res) => {
  res.render('pages/booking', { title: 'Pemesanan Tiket' });
});

// Hasil Pencarian Tiket
app.post('/search', (req, res) => {
  const { departure, destination, date, adults, babies } = req.body;
  res.render('pages/search', {
    title: 'Hasil Pencarian',
    departure,
    destination,
    date,
    adults,
    babies
  });
});

// ===========================
// Halaman Informasi
// ===========================
app.get('/proses-mudah', (req, res) => {
  res.render('pages/proses-mudah', { title: 'Proses Mudah' });
});

app.get('/jadwal-lengkap', (req, res) => {
  res.render('pages/jadwal-lengkap', { title: 'Jadwal Lengkap KAI' });
});

app.get('/aman-dan-cepat', (req, res) => {
  res.render('pages/aman-dan-cepat', { title: 'Aman dan Cepat' });
});

// ===========================
// Logout
// ===========================
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Logout gagal');
    }
    res.redirect('/');
  });
});

// ===========================
// Routes Lainnya
// ===========================
app.use("/admin", adminRoutes);
app.use("/auth", authRoutes);
app.use("/customer", customerRoutes);

// ===========================
// Middleware Penanganan Error
// ===========================
app.use((err, req, res, next) => {
  console.error(`Error Middleware: ${err.stack}`);
  res.status(500).send('Terjadi kesalahan server.');
});

// ===========================
// Jalankan Server
// ===========================
const PORT = process.env.PORT || 100;
app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));
