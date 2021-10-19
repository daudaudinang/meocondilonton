var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

var File = new Schema({
  username: String,
  file_upload: String,
  file_converted: String,
},{collection : 'file', usePushEach: true });

File.methods.validPassword = function (pwd) {
  return (this.password === pwd);
}

module.exports = mongoose.model('File', File);