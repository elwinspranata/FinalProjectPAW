// Middleware untuk memeriksa apakah penumpang sudah login
module.exports.isAuthenticated = (req, res, next) => {
    if (!req.session || !req.session.userId) {
      // Jika tidak ada sesi userId, arahkan ke halaman login penumpang
      return res.redirect('/login');
    }
    next(); // Jika sudah login, lanjutkan ke route berikutnya
  };
  