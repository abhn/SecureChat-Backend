const User = require('../models/user.js')
const userAuth = require('./userAuth.js')
const chatUtils = require('./chatUtils.js')

let userSocketList = {}

function chat(io) {

  io.on('connection', (client) => {

    client.on('message', (message) => {
      // our little mini router
      chatUtils(client, message, onToken, onNewMessage, onError)
    })

    client.on('close', () => {
      if(getKeyByValue(userSocketList, client)) {
        console.log(getKeyByValue(userSocketList, client) + ' disconnected')
        delete userSocketList[getKeyByValue(userSocketList, client)]
      }
    })
  })
}

function onToken(client, token) {
  try {
    userAuth(token, (authorizedUser) => {
      if (authorizedUser) {
        userSocketList[authorizedUser] = client
      } else {
        client.send(JSON.stringify({"error": "not authorized"}))  
      }
    })
  } catch (e) {
    console.log(e)
    return
  }
}

function onNewMessage(client, data) {
  const username = data.username
  const friend = data.friend
  const token = data.token
  const message = data.message

  userAuth(token, (authorizedUser) => {
    if(userSocketList[username] && username === authorizedUser) {
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
      client.terminate()
    }
  })
}

function onError(client) {
  if(getKeyByValue(userSocketList, client)) {
    console.log(getKeyByValue(userSocketList, client) + ' disconnected')
    delete userSocketList[getKeyByValue(userSocketList, client)]
  }
}

function getKeyByValue(obj, value) {
  for( var prop in obj ) {
    if( obj.hasOwnProperty( prop ) ) {
      if( obj[ prop ] === value )
        return prop;
    }
  }
}

module.exports = chat