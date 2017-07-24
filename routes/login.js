const User = require('../models/user.js')
const uuidv4 = require('uuid/v4')
const bcrypt = require('bcrypt')

function login (app) {
  app.post('/api/login', function (req, res) {
  	const username = req.body.username
    const password = req.body.password

    if (!username || !password) {
      return res.status(400).json({message: 'Bad request. Please see the API documentation for /register'})
    }

	  User.findOne({username}, (err, doc) => {
    	// error on db
    	if (err) {
        return res.status(500).json({message: 'Internal server error. Please try after some time.'})
      }
      // user login ok
      if (doc) {

      	const hash = doc.password

      	bcrypt.compare(password, hash, function(err, doesMatch) {
      		if(doesMatch) {
      			const sessionId = uuidv4()

			      doc.currToken = sessionId

			      doc.save((err, a) => {
			      	if (err) {
				        return res.status(500).json({message: 'Internal server error. Please try after some time.'})
				      }
		   	      res.status(200).json({token: sessionId})
			      })
      		} else {
      			res.status(400).json({message: 'Bad username or password'})
      		}
      	})
      } else {
      	res.status(400).json({message: 'Bad username or password'})
      }
    })
    
  })
}

module.exports = login
