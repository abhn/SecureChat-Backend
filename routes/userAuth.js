const User = require('../models/user.js')

function userAuth(token) {
	if (!token) {
		return null
	}

	User.findOne({token}, (err, doc) => {
		if (err) {
			throw new Error('Internal server error')
		}

		if(doc) {
			return doc.username
		} else {
			return null
		}

	})
}

module.exports = userAuth