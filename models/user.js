var mongoose = require('mongoose')

var userSchema = mongoose.Schema({
  username: String,
  password: String,
  currToken: String,
  friends: [String]
})

userSchema.methods.getCurrentToken = function () {
  return (this.currToken || null)
}

var User = mongoose.model('User', userSchema)
module.exports = User
