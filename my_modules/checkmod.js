module.exports = function checkMod(req, res, next) {
  if (req.user && (req.user.account_type === "modifier")) {
      next();
  } else {
      res.redirect('/admin/login');
  }
};