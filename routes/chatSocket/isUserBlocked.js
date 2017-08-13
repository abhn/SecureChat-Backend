const BlockedUser = require('../../models/blockedUser.js')

function isUserBlocked(username1, username2, cb) {
	BlockedUser.findOne({$or: [
    {username1: username1, username2: username2}, 
    {username1: username2, username2: username1}
  ]})
  .exec((err, doc) => {
  	if(err) {
  		console.log('error in isUserBlocked')
  		return
  	}
  	if(doc) cb(true)
  	else cb(false)
  })
}

module.exports = isUserBlocked