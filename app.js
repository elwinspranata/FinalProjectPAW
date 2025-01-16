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
const authRoutes = require("./routes/authRoutes");

// Middleware dan Auth
const { isAuthenticated } = require("./Middleware/Middleware");

// ===========================
// Inisialisasi Aplikasi
// ===========================
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

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

// Middleware untuk redirect user jika sudah login
const redirectToHomeIfAuthenticated = (req, res, next) => {
  if (req.session.userId && req.session.role === 'admin') {
    return res.redirect('/admin/login');
  }
  next();
};

// ===========================
// Route Utama
// ===========================

app.get('/loginAdmin', redirectToHomeIfAuthenticated, (req, res) => {
  try {
    res.render('pages/loginAdmin', { title: 'Login - Tiket Kereta Api' });
  } catch (err) {
    console.error(`Error rendering loginAdmin page: ${err.message}`);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/loginAdmin', redirectToHomeIfAuthenticated, (req, res) => {
  res.render('pages/indexAdmin', { title: 'Login - Tiket Kereta Api' });
});


// Halaman Login
app.get('/', redirectToHomeIfAuthenticated, (req, res) => {
  res.render('pages/index', { title: 'Login - Tiket Kereta Api' });
});

// Halaman Login admin
app.get('/loginAdmin', (req, res) => {
  console.log('Rendering halaman login admin');
  res.render('pages/indexAdmin', { title: 'Login - Tiket Kereta Api' });
});

// Halaman Login Admin
app.get('/loginAdmin', redirectToHomeIfAuthenticated, (req, res) => {
  res.render('pages/indexAdmin', { title: 'Login - Tiket Kereta Api' });
});

// Proses Login
app.post("/login", (req, res) => {
  const { username, password } = req.body; // Ambil data dari body request
  // Validasi input
  if (!username || !password) {
    return res.redirect(
      "/?error=true&message=Username%20and%20password%20are%20required"
    );
  }
  // Query untuk mencari user berdasarkan username
  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, result) => {
      if (err) {
        console.error("Error fetching user:", err);
        return res.redirect(
          "/?error=true&message=Internal%20server%20error"
        );
      }
      // Jika user tidak ditemukan
      if (result.length === 0) {
        return res.redirect("/?error=true&message=User%20not%20found");
      }

      // Pastikan password ada dalam hasil query dan key benar
      const storedPassword = result[0]?.password || result[0]?.pasword;
      const role = result[0]?.role || 'user'; // Tambahkan role untuk membedakan admin dan user

      if (!storedPassword) {
        console.error("Error: Password is undefined in the database result.");
        return res.redirect("/?error=true&message=Invalid%20user%20data");
      }

      // Bandingkan password yang diberikan dengan password yang disimpan
      bcrypt.compare(password, storedPassword, (err, isMatch) => {
        if (err) {
          console.error("Error checking password:", err);
          return res.redirect(
            "/?error=true&message=Internal%20server%20error"
          );
        }
        // Jika password tidak cocok
        if (!isMatch) {
          return res.redirect("/?error=true&message=Incorrect%20password");
        }
        // Password cocok, buat session untuk user
        req.session.userId = result[0].id; // Simpan userId di session
        req.session.username = result[0].username; // Simpan username di session
        req.session.role = role; // Simpan role di session

        if (role === 'admin') {
          res.redirect("/admin/dashboard"); // Redirect ke halaman admin jika role adalah admin
        } else {
          res.redirect("/home"); // Redirect ke halaman utama jika role adalah user biasa
        }
      });
    }
  );
});

//prosesloginadmin
app.post("/loginadmin", (req, res) => {
  const { username, password } = req.body; // Ambil data dari body request
  // Validasi input
  if (!username || !password) {
    return res.redirect(
      "/?error=true&message=Username%20and%20password%20are%20required"
    );
  }
  // Query untuk mencari user berdasarkan username
  db.query(
    "SELECT * FROM admin WHERE username = ?",
    [username],
    (err, result) => {
      if (err) {
        console.error("Error fetching user:", err);
        return res.redirect(
          "/?error=true&message=Internal%20server%20error"
        );
      }
      // Jika user tidak ditemukan
      if (result.length === 0) {
        return res.redirect("/?error=true&message=User%20not%20found");
      }

      // Pastikan password ada dalam hasil query dan key benar
      const storedPassword = result[0]?.password || result[0]?.pasword;
      const role = result[0]?.role || 'user'; // Tambahkan role untuk membedakan admin dan user

      if (!storedPassword) {
        console.error("Error: Password is undefined in the database result.");
        return res.redirect("/?error=true&message=Invalid%20user%20data");
      }

      // Bandingkan password yang diberikan dengan password yang disimpan
      bcrypt.compare(password, storedPassword, (err, isMatch) => {
        if (err) {
          console.error("Error checking password:", err);
          return res.redirect(
            "/?error=true&message=Internal%20server%20error"
          );
        }
        // Jika password tidak cocok
        if (!isMatch) {
          return res.redirect("/?error=true&message=Incorrect%20password");
        }
        // Password cocok, buat session untuk user
        req.session.userId = result[0].id; // Simpan userId di session
        req.session.username = result[0].username; // Simpan username di session
        req.session.role = role; // Simpan role di session

        if (role === 'admin') {
          res.redirect("/homeAdmin"); // Redirect ke halaman admin jika role adalah admin
        } else {
          res.redirect("/homeAdmin"); // Redirect ke halaman utama jika role adalah user biasa
        }
      });
    }
  );
});

// Halaman Admin Dashboard
app.get('/admin/dashboard', (req, res) => {
  if (req.session.role !== 'admin') {
    return res.status(403).send('Anda tidak memiliki akses ke halaman ini.');
  }
  res.render('pages/admin-dashboard', { title: 'Admin Dashboard', username: req.session.username });
});

// Halaman Registrasi
app.get('/register', redirectToHomeIfAuthenticated, (req, res) => {
  res.render('pages/register', { title: 'Daftar Penumpang' });
});

// Halaman Registrasiadmin
app.get('/registeradmin', redirectToHomeIfAuthenticated, (req, res) => {
  res.render('pages/registeradmin', { title: 'Daftar Penumpang' });
});

// Proses Registrasi
app.post('/register', (req, res) => {
  const { username, password } = req.body; // Tidak ada 'role'

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

    const insertQuery = "INSERT INTO users (username, pasword) VALUES (?, ?)"; // Hanya masukkan username dan password
    db.query(insertQuery, [username, hashedPassword], (err) => {
      if (err) {
        console.error('Error SQL saat insert data user:', err.message);
        return res.status(500).send(`Terjadi kesalahan server: ${err.message}`);
      }
      res.redirect('/');
    });
  });
});

// Proses Registrasi Admin Tanpa Role
app.post('/registeradmin', (req, res) => {
  const { username, password } = req.body;

  const checkQuery = "SELECT * FROM admin WHERE username = ?";
  db.query(checkQuery, [username], (err, result) => {
    if (err) {
      console.error('Error saat mengecek username:', err.message);
      return res.status(500).send(`Terjadi kesalahan server: ${err.message}`);
    }
    if (result.length > 0) {
      return res.send('<h1>Registrasi gagal! Username sudah digunakan. <a href="/register">Kembali</a></h1>');
    }

    const hashedPassword = bcrypt.hashSync(password, 10); // Hash password

    const insertQuery = "INSERT INTO admin (username, pasword) VALUES (?, ?)";
    db.query(insertQuery, [username, hashedPassword], (err) => {
      if (err) {
        console.error('Error SQL saat insert data user:', err.message);
        return res.status(500).send(`Terjadi kesalahan server: ${err.message}`);
      }
      res.redirect('/loginAdmin');
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
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Logout gagal');
    }
    res.redirect('/'); // Redirect ke halaman login setelah logout
  });
});

// ===========================
// Routes Lainnya
// ===========================
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