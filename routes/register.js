const User = require('../models/user.js')
const bcrypt = require('bcrypt')

function register (app) {
  app.post('/api/register', (req, res) => {
    const username = req.body.username
    const password = req.body.password

    if(password && password.length < 8) {
      return res.status(400).json({message: 'Password should be at least 8 characters'})
    }

    if (!username || !password) {
      return res.status(400).json({message: 'Bad request. Please see the API documentation for /register'})
    }

    User.findOne({username}, (err, doc) => {
      if (err) {
        return res.status(500).json({message: 'Internal server error. Please try after some time.'})
      } else if (doc) {
        return res.status(409).json({message: 'Username exists'}) 
      } else {
        bcrypt.hash(password, 5, (err, password) => {
          if(err) {
            return res.status(500).json({message: 'Internal server error. Please try after some time.'}) 
          }

          const newUser = new User({
            username,
            password,
            currToken: '',
            friends: []
          })

          newUser.save((err, a) => {
            if (err) {
              return res.status(500).json({message: 'Internal server error. Please try after some time.'})
            }
            return res.status(201).json({message: 'User created successfully'}).end()
          })

        });
      }
    })
    
  })
}

module.exports = register
