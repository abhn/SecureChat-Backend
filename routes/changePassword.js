const User = require('../models/user.js')
const uuidv4 = require('uuid/v4')
const bcrypt = require('bcrypt')

function login (app) {
  app.post('/api/change-password', (req, res) => {
  	const username = req.body.username
    const password = req.body.password
    const newpassword = req.body.newpassword

    // min password length
    if (newpassword && newpassword.length < 8) {
      return res.status(400).json({message: 'Password should be at least 8 characters'})
    }

    if (!username || !password || !newpassword) {
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

      	bcrypt.compare(password, hash, (err, doesMatch) => {
          // login successful
      		if(doesMatch) {

			      doc.currToken = ''

            bcrypt.hash(newpassword, 5, (err, password) => {
              if (err) {
                return res.status(500).json({message: 'Internal server error. Please try after some time.'})
              }
              // set the new password and save it
              doc.password = password
              doc.save((err, a) => {
                if (err) {
                  return res.status(500).json({message: 'Internal server error. Please try after some time.'})
                }
                res.status(200).json({message: 'Password change successful'})
              })
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
