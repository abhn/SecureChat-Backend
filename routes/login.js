const User = require('../models/user.js')
const uuidv4 = require('uuid/v4')
const bcrypt = require('bcrypt')

function login (app) {
  app.post('/api/login', (req, res) => {
    const username = req.body.username
    const password = req.body.password

    if (!username || !password) {
      return res.status(400).json({message: 'Bad request. Please see the API documentation for /register'})
    }

    User.findOne({username}, (err, doc) => {
      // error on db
      if (err) {
        console.log(err)
        return res.status(500).json({message: 'Internal server error. Please try after some time.'})
      }
      // user login ok
      if (doc) {

        const hash = doc.password

        bcrypt.compare(password, hash, (err, doesMatch) => {
          if(doesMatch) {
            const newToken = uuidv4()

            doc.token = newToken

            doc.save((err, a) => {
              if (err) {
                return res.status(500).json({message: 'Internal server error. Please try after some time.'})
              }

              return res.status(200).json({token: newToken})
            })

          } else {
            return res.status(401).json({message: 'Bad username or password'})
          }

        })

      } else {
        return res.status(401).json({message: 'Bad username or password'})
      }
      
    })
    
  })
}

module.exports = login
