// Middleware untuk memeriksa apakah admin sudah login
module.exports.isAuthenticated = (req, res, next) => {
    if (!req.session || !req.session.userId) {
      // Jika tidak ada sesi userId, arahkan ke halaman login admin
      return res.redirect('/auth/loginAdmin');
    }
    next(); // Jika sudah login, lanjutkan ke route berikutnya
  };
  