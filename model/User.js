var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

var User = new Schema({
  account_type:  String,
  username: String,
  password: String
},{collection : 'user', usePushEach: true });

User.methods.validPassword = function (pwd) {
  return (this.password === pwd);
}

module.exports = mongoose.model('User', User);