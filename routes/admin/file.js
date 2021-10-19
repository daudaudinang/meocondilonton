var express = require('express');
var router = express.Router();
var File = require('../../model/File.js');
var path = require('path');
var checkLogin = require("../../my_modules/checklogin.js");
var fs = require('fs');

router.get("/", checkLogin, function (req, res, next) {
    res.redirect("/admin/file/danh-sach");
});

router.get("/danh-sach", checkLogin, function (req, res, next) {
    if(req.user){
        if(req.user.account_type === "modifier"){
            File.find().then(function(listFile){
                res.render("admin/viewFile/danhsach", {listFile: listFile});
            });
        } else {
            File.find({username: req.user.username}, function(err, listFile){
                res.render("admin/viewFile/danhsach", {listFile: listFile});
            });
        }
    }
});

router.get('/:id/xoa-file', checkLogin, function (req, res) {
	File.findById(req.params.id, function (err, file) {
		var linkUpload = "./public/upload/"+ file.username + "/input/" + file.file_upload;
		var linkConverted = "./public/upload/"+ file.username + "/output/" + file.file_converted;
        if(fs.existsSync("./public/upload/"+ file.username)){
            // Xoá file upload
            fs.unlink(linkUpload, function (e) {
                if (e) console.log(e);
            });

            // Xoá file converted
            fs.unlink(linkConverted, function (e) {
                if (e) console.log(e);
            });

            // Xoá list segment
            let linkDirectory = "./public/upload/" + file.username + "/segment/";
            fs.readdir(linkDirectory, (err, files) => {
                if (err) throw err;
            
                for (const file of files) {
                fs.unlink(path.join(linkDirectory, file), err => {
                    if (err) throw err;
                });
                }
            });
        }

		file.remove(function () { // Xoá data khỏi
			req.flash('success_msg', 'Đã Xoá Thành Công');
			res.redirect('/admin/file/danh-sach');
		})
	});
});

router.get('/:id/tai-file-upload', checkLogin, function (req, res) {
	File.findById(req.params.id, function (err, file) {
        res.download("./public/upload/"+ file.username + "/input/" + file.file_upload, function(err){
            if(err) throw err;
        });
    });
});

router.get('/:id/tai-file-convert', checkLogin, function (req, res) {
    File.findById(req.params.id, function (err, file) {
        res.download("./public/upload/"+ file.username + "/output/" + file.file_converted, function(err){
            if(err) throw err;
        });
    });
});

module.exports = router;