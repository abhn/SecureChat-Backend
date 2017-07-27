const User = require('../models/user.js')
const userAuth = require('./userAuth.js')
const chatUtils = require('./chatUtils.js')

let userSocketList = {}

function chat(io) {

  io.on('connection', (client) => {

    client.on('message', (message) => {
      chatUtils(client, message, onToken, onNewMessage, onError)
    })

    client.on('close', () => {
      if(getKeyByValue(client)) {
        console.log(getKeyByValue(client) + ' disconnected')
        delete userSocketList[getKeyByValue(client)]
      }
    })
  })
}

function onToken(client, token) {
  try {
    const authorizedUser = userAuth(token)
  } catch (e) {
    console.log(e)
  }

  if (authorizedUser) {
    userSocketList[authorizedUser] = client
  }
}

function onNewMessage(client, data) {
  const username = data.username
  const friend = data.friend
  const token = data.token
  const message = data.message

  if(userSocketList[username] && username === userAuth(token)) {
    if(userSocketList[friend]) {
      userSocketList[friend].send(JSON.stringify({"received message": message}))
    } else {
      client.send(JSON.stringify({"no such user": friend}))
    }
  } else {
    // kick client
    client.send(JSON.stringify({"error": "not authorized"}))
    if(userSocketList[username]) {
      delete userSocketList[username]
    }
    client.disconnect()
  }
}

function onError(client) {
  if(getKeyByValue(client)) {
    console.log(getKeyByValue(client) + ' disconnected')
    delete userSocketList[getKeyByValue(client)]
  }
}

Object.prototype.getKeyByValue = function( value ) {
  for( var prop in this ) {
    if( this.hasOwnProperty( prop ) ) {
      if( this[ prop ] === value )
        return prop;
    }
  }
}

module.exports = chat