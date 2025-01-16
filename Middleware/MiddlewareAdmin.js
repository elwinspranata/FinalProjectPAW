module.exports.isAuthenticated = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    // Jika tidak ada session userId, arahkan ke halaman login sesuai role
    if (req.originalUrl.includes('/admin')) {
      return res.redirect('/loginAdmin'); // Redirect ke halaman login admin
    } else {
      return res.redirect('/'); // Redirect ke halaman login user
    }
  }

  // Pastikan role ada jika halaman admin
  if (req.originalUrl.includes('/admin') && req.session.role !== 'admin') {
    return res.status(403).send('Anda tidak memiliki akses ke halaman ini.');
  }

  next(); // Jika sudah login dan role sesuai, lanjutkan ke route berikutnya
};
