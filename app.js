const express = require('express');
const path = require('path');
const bodyParser = require('body-parser'); // Middleware untuk menangani form data

const app = express();
const users = []; // Array untuk menyimpan data pengguna sementara

// Middleware untuk file statis dan body parsing
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

// Set EJS sebagai template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Route ke halaman login (landing page)
app.get('/', (req, res) => {
    res.render('pages/index', { title: 'Login' });
});

// Route untuk proses login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(user => user.username === username && user.password === password);

    if (user) {
        res.redirect('/home');
    } else {
        res.send('<h1>Login gagal! Username atau password salah. <a href="/">Kembali</a></h1>');
    }
});

// Route ke halaman registrasi
app.get('/register', (req, res) => {
    res.render('pages/register', { title: 'Registrasi' });
});

// Route untuk proses registrasi
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const userExists = users.find(user => user.username === username);

    if (userExists) {
        res.send('<h1>Registrasi gagal! Username sudah digunakan. <a href="/register">Kembali</a></h1>');
    } else {
        users.push({ username, password });
        res.redirect('/');
    }
});

// Route ke halaman utama setelah login
app.get('/home', (req, res) => {
    res.render('pages/home', { title: 'Home' });
});

// Route ke halaman pemesanan tiket
app.get('/booking', (req, res) => {
    res.render('pages/booking', { title: 'Pemesanan Tiket' });
});

// Route untuk hasil pencarian tiket
app.post('/search', (req, res) => {
    const { departure, destination, date, adults, babies } = req.body;
    res.render('pages/search', {
        title: 'Hasil Pencarian Tiket',
        departure,
        destination,
        date,
        adults,
        babies,
    });
});

// Jalankan server
const PORT = 1234;
app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));


