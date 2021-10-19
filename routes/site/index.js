var express = require("express");
var router = express.Router();
var multer = require("multer");
var checkLogin = require("../../my_modules/checklogin.js");
var File = require('../../model/File.js');
const mv = require('mv');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/upload");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname);
  },
});
var upload = multer({ storage: storage });
const ffmpeg = require("fluent-ffmpeg");

ffmpeg.setFfmpegPath("./ffmpeg/bin/ffmpeg.exe");

ffmpeg.setFfprobePath("./ffmpeg/bin/ffprobe.exe");

router.get("/", checkLogin, function (req, res, next) {
    res.render("site/index");
});

router.post("/", checkLogin, upload.single('video'), function (req, res, next) {
    // Lấy ra username
    let username = req.user.username;
    let filename = req.file.filename;

    mv("./public/upload/"+ filename,"./public/upload/"+ username + "/input/" + filename, (err) => {
        if(err) return res.send(err);
        console.log("Move File Successfully");
    });

    ffmpeg("./public/upload/"+ username + "/input/" + filename)
    .outputOptions([
        '-map 0',
        '-map 0',
        '-c:a aac',
        '-c:v libx264', 
        '-b:v:0 800k',
        '-b:v:1 300k',
        '-s:v:1 320x170',
        '-profile:v:1 baseline',
        '-profile:v:0 main',
        '-bf 1',
        '-keyint_min 120',
        '-g 120',
        '-sc_threshold 0',
        '-b_strategy 0',
        '-ar:a:1 22050',
        '-use_timeline 0',
        '-use_template 0',
        // '-window_size 5',
        '-adaptation_sets', '"id=0,streams=v id=1,streams=a',
        '-f dash'
    ]).output("./public/upload/"+ username + "/output/" + filename + ".mpd")
        .on('start', function (commandLine) {
            console.log('Spawned Ffmpeg with command: ' + commandLine);
        })
        .on('error', function (err, stdout, stderr) {
            console.log('An error occurred: ' + err.message, err, stderr);
        })
        .on('progress', function (progress) {
            console.log('Processing: ' + progress.percent + '% done')
        })
        .on('end', function (err, stdout, stderr) {
            console.log('Finished processing!' /*, err, stdout, stderr*/)
        })
        .run()
});

module.exports = router;
