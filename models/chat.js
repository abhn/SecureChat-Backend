var mongoose = require('mongoose')

var chatSchema = mongoose.Schema({
  username1: String,
  username2: String,
  pending: Number,
  initiated: Number
})


var Chat = mongoose.model('Chat', chatSchema)
module.exports = Chat
