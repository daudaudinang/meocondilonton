var createError = require('http-errors');
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
const mongoose = require('mongoose');
var expressValidator = require('express-validator');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');
var logger = require('morgan');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var adminRouter = require('./routes/admin/admin.js');
var fileRouter = require('./routes/admin/file.js');
var userRouter = require('./routes/admin/user.js');
var indexRouter = require('./routes/site/index.js');
const { resolveSoa } = require('dns');
require('dotenv').config();
var app = express();

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb+srv://admin:Huyhuyhuy1998@cluster0.edeoy.mongodb.net/test');
  console.log("Connected Database");
}
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/upload', express.static(path.join(__dirname, 'public')))

app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Config session
app.use(session({
  secret: 'mypassword', // Mã bảo mật của session
  resave: true,
  saveUninitialized: true
  // cookie: { secure: true } // Tắt secure: true đi vì nếu bật session sẽ k hoạt động với http mà chỉ hoạt động với https
}))

// Config flash
app.use(flash());

// Đẩy flash-message nhận được từ passport vào locals để sử dụng
app.use(function(req, res, next){
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/admin', adminRouter); 
app.use('/admin/file', fileRouter); 
app.use('/admin/user', userRouter); 

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.locals.baseURL = process.env.BASEURL + ":" + process.env.PORT;

module.exports = app;
