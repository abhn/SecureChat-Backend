const User = require('../models/user.js')

function userAuth(token) {
	if (!token) {
		return null
	}

	console.log('userauth: ' + token)
	User.findOne({token}, (err, doc) => {
		if (err) {
			throw new Error('Internal server error')
		}

		if(doc) {
			console.log('found' + doc)
			return doc.username
		} else {
			console.log('not found')
			return null
		}

	})
}

module.exports = userAuth