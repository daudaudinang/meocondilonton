module.exports = function checkLogin(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/admin/login');
    }
};