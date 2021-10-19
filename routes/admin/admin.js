var express = require("express");
var router = express.Router();
var User = require("../../model/User.js");
const mkdirp = require('mkdirp');
var checkLogin = require("../../my_modules/checklogin.js");

var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;

router.get("/", checkLogin, function (req, res, next) {
  if(req.user) {
    if(req.user.account_type === "modifier") res.redirect("/admin/user");
    else res.redirect("/");
  }
});

router.get("/login", function (req, res, next) {
  res.render("admin/login");
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/admin",
    failureRedirect: "/admin/login",
    failureFlash: true,
  })
);

passport.use(
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
    },

    function (username, password, done) {
      User.findOne({ username: username }, function (err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, { message: "Incorrect username." });
        }
        if (!user.validPassword(password)) {
          return done(null, false, { message: "Incorrect password." });
        }
        return done(null, user);
      });
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  User.findOne({ username: user.username }, function (err, user) {
    done(err, user);
  });
});

router.get("/register", function (req, res, next) {
  res.render("admin/register");
});

router.post("/register", function (req, res, next) {
  req.checkBody("username", "Tên đăng nhập không được để trống").notEmpty();
  req.checkBody("password", "Mật khẩu không được để trống").notEmpty();
  var errors = req.validationErrors();
  if (errors) {
    req.flash("error_msg", "Vui lòng nhập đầy đủ thông tin!");
    res.redirect("/admin/register");
  } else {
    User.find({username: req.body.username}, function(err, data){
      if(data.length > 0){
        req.flash('error_msg', 'Tài khoản đã tồn tại!');
        res.redirect('/admin/register');
      } else {
        let user = new User({
          username: req.body.username,
          password: req.body.password,
          account_type: "normal",
          listFile: []
        });
        user.save().then(() => {
          let dir1 = './public/upload/'+ req.body.username;
          let dir2 = dir1 + '/input';
          let dir3 = dir1 + '/output';
          let dir4 = dir1 + '/segment';
          mkdirp(dir1);
          mkdirp(dir2);
          mkdirp(dir3);
          mkdirp(dir4);
          req.flash("success_msg","Đăng ký tài khoản thành công! Vui lòng đăng nhập!");
          res.redirect("/admin/login");
        });
      }
    });
  }
});

router.post('/getUser', function (req, res) {
  if (req.user) res.json({ status: 1, user: req.user });
  else res.json({ status: 0 })
});

router.get('/logout',checkLogin, function (req, res) {
    req.logout();
    res.redirect('/');
});

module.exports = router;
