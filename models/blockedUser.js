var mongoose = require('mongoose')

var blockedUserSchema = mongoose.Schema({
  username: String,
  friend: String
})

var BlockedUser = mongoose.model('BlockedUser', blockedUserSchema)
module.exports = BlockedUser
