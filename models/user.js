var mongoose = require('mongoose')

var userSchema = mongoose.Schema({
  username: String,
  password: String,
  token: String,
  friends: [String]
})

userSchema.methods.getCurrentToken = function () {
  return (this.token || null)
}

var User = mongoose.model('User', userSchema)
module.exports = User
