var express = require('express');
var router = express.Router();
const mkdirp = require('mkdirp');
var checkMod = require('../../my_modules/checkmod');
var User = require('../../model/User.js');
var File = require('../../model/File.js');
var fs = require('fs');

router.get('/', checkMod, function (req, res, next) {
  res.redirect('/admin/user/danh-sach');
});

/* GET users listing. */
router.get('/danh-sach', checkMod, function (req, res, next) {
  User.find().then(function (data) {
    res.render('admin/user/danhsach', { data: data });
  });
});

/* GET users listing. */
router.get('/them-user', checkMod, function (req, res, next) {
  res.render('admin/user/them', { errors: null });
});

router.post('/them-user', checkMod, function (req, res, next) {
  req.checkBody('username', 'Tài khoản không được để trống').notEmpty();
  req.checkBody('password', 'Mật khẩu không được để trống').notEmpty();
  var errors = req.validationErrors();
  if (errors) {
    res.render('admin/user/them', { errors: errors });
  } else {
    User.find({username: req.body.username}, function(err, data){
      if(data.length > 0){
        req.flash('error_msg', `Tài khoản đã tồn tại`);
        res.redirect('/admin/user/them-user');
      } else {
        let user = new User({
          username: req.body.username,
          password: req.body.password,
          account_type: req.body.account_type,
          listFile: []
        });
        user.save().then(function () {
          let dir1 = './public/upload/'+ req.body.username;
          let dir2 = dir1 + '/input';
          let dir3 = dir1 + '/output';
          let dir4 = dir1 + '/segment';
          mkdirp(dir1);
          mkdirp(dir2);
          mkdirp(dir3);
          mkdirp(dir4);
          req.flash('success_msg', `Đã Thêm Thành Công ${user.username}`);
          res.redirect('/admin/user/them-user');
        });
      }
    });
  }
});

router.get('/:id/sua-user', checkMod, function (req, res, next) {
  User.findById(req.params.id, function (err, data) {
    if (err) throw err;
    res.render('admin/user/sua', { user: data, errors: null });
  });
});

router.post('/:id/sua-user', checkMod, function (req, res, next) {
  req.checkBody('username', 'Email không được để trống').notEmpty();
  req.checkBody('password', 'Mật khẩu không được để trống').notEmpty();
  var errors = req.validationErrors();
  if (errors) {
    User.findById(req.params.id, function (err, data) {
      if (err) console.log(err);
      res.render('admin/user/sua', { user: data, errors: errors });
    });
  } else {
    User.findById(req.params.id, function (err, user) {
      if (err) throw err;
      user.account_type = req.body.account_type;
      user.username = req.body.username;
      user.password = req.body.password;
      user.save().then(function () {
        req.flash('success_msg', `Đã Sửa Thông Tin Người Dùng Thành Công`);
        res.redirect(`/admin/user/${req.params.id}/sua-user`);
      });
    });
  }
});

router.get('/:id/xoa-user', checkMod, function (req, res, next) {
  User.findById(req.params.id, function (err, user) {
    //Xoá directory mà user này upload
    fs.rmdirSync('./public/upload/'+ user.username, { recursive: true });
    
    // Xoá listFile mà User này đã upload khỏi Database
    File.deleteMany({username : user.username}, function(err, data){
      console.log(`Clear data ${user.username} success`);
    })

    // Xoá user khỏi database
    user.remove(function () { 
      req.flash('success_msg', 'Đã Xoá Thành Công');
      res.redirect('/admin/user/danh-sach');
    });
  });
});

module.exports = router;