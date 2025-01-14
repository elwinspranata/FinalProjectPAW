// Import package mysql2 untuk koneksi ke MySQL
const mysql = require("mysql2");

// Menggunakan dotenv untuk memuat konfigurasi dari file .env
require("dotenv").config();

// Membuat koneksi ke database MySQL dengan konfigurasi dari file .env
const connection = mysql.createConnection({
  host: process.env.DB_HOST || "localhost", // Default ke 'localhost' jika tidak ada di .env
  user: process.env.DB_USER || "root", // Default ke 'root' jika tidak ada di .env
  password: process.env.DB_PASSWORD || "", // Default kosong jika tidak ada password
  database: process.env.DB_NAME || "jadwal_kereta", // Ganti dengan nama database yang sesuai
});

// Membuat koneksi ke MySQL dan menangani error jika koneksi gagal
connection.connect((err) => {
  if (err) {
    console.error(`❌ Error connecting to the database: ${err.message}`); // Pesan error lebih spesifik
    process.exit(1); // Keluar dari proses Node.js jika koneksi gagal
  }
  console.log("✅ Successfully connected to the MySQL database.");
});

// Event handler jika koneksi terputus
connection.on("error", (err) => {
  console.error(`⚠️ MySQL connection error: ${err.message}`);
  if (err.code === "PROTOCOL_CONNECTION_LOST") {
    console.log("🔄 Reconnecting to MySQL...");
    connection.connect(); // Mencoba koneksi ulang otomatis jika terputus
  }
});

// Mengekspor koneksi untuk digunakan di file lain
module.exports = connection;
