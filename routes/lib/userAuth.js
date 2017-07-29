const User = require('../../models/user.js')

function userAuth(token, cb) {
	if (!token) {
		return null
	}

	User.findOne({token}, (err, doc) => {
		if (err) {
			throw new Error('Internal server error')
		}
		if (doc) {
			cb(doc.username)
		} else {
			console.log('not found')
			cb(null)
		}
	})
}

module.exports = userAuth