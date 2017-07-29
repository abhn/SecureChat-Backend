const userAuth = require('./lib/userAuth.js')
const BlockedUser = require('./../models/blockedUser.js')

function blockUser(app) {
	app.post('/api/block', (req, res) => {
		const username = req.body.username
		const token = req.body.token
		const friend = req.body.friend

		if(!username || !token || !friend) {
			return res.status(400).json({message: 'Bad request. Please see the API documentation for /register'})
		}

		try {
			userAuth(token, (tokenUsername) => {
				// if user exists and it is who it is saying it is
				if(tokenUsername && tokenUsername === username) {

					// if already blocked, do nothing
					BlockedUser.findOne({username, friend}, (err, doc) => {
						if (err) {
              return res.status(500).json({message: 'Internal server error. Please try after some time.'})
            }
						if(doc) {
              return res.status(200).json({message: "Successfully blocked user"})
						}

						// if not already blocked, add a new entry
						const newBlockedUser = new BlockedUser({
							username,
							friend
						})
						newBlockedUser.save((err, a) => {
		          if (err) {
	              return res.status(500).json({message: 'Internal server error. Please try after some time.'})
	            }
              return res.status(200).json({message: "Successfully blocked user"})
		        })
					})
				} else {
					return res.status(401).json({message: 'Bad username or password'})
				}
			})
		} catch (e) {
			console.log('block user failed ' + e)
	    return res.status(500).json({message: 'Internal server error. Please try after some time.'})
		}

	})
}

module.exports = blockUser