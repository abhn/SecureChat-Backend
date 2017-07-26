
const User = require('../models/user.js')
const userAuth = require('./userAuth.js')

Object.prototype.getKeyByValue = function( value ) {
  for( var prop in this ) {
    if( this.hasOwnProperty( prop ) ) {
      if( this[ prop ] === value )
        return prop;
    }
  }
}

function chat(app, io) {

  let userSocketList = {}

  io.on('connection', (client) => {

    console.log('in connection')

    client.on('token', (token) => {
      try {
        const authorizedUser = userAuth(token)
      } catch (e) {
        console.log(e)
      }
      if (authorizedUser) {
        userSocketList[authorizedUser] = client
      }
    })

    client.on('new message', (data) => {
      const username = data.username
      const friend = data.friend
      const token = data.token
      const message = data.message

      if(userSocketList[username] && username === userAuth(token)) {
        if(userSocketList[friend]) {
          userSocketList[friend].emit("received message", message)
        } else {
          client.emit("no such user", friend)
        }
      } else {
        // kick client
        client.emit("not authorized")
        if(userSocketList[username]) {
          delete userSocketList[username]
        }
        client.disconnect()
      }

    })

    client.on('disconnect', () => {
      if(getKeyByValue(client)) {
        
        console.log(getKeyByValue(client) + ' disconnected')

        delete userSocketList[getKeyByValue(client)]
      }
    })

  })

}

module.exports = chat