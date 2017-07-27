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
      if(getKeyByValue(userSocketList, client)) {
        console.log(getKeyByValue(userSocketList, client) + ' disconnected')
        delete userSocketList[getKeyByValue(userSocketList, client)]
      }
    })
  })
}

function onToken(client, token) {
  console.log("token " + token)
  try {
    const authorizedUser = userAuth(token)
  } catch (e) {
    console.log(e)
    return
  }

  if (authorizedUser) {
    userSocketList[authorizedUser] = client
    console.log(Object.keys(userSocketList))
  }
}

function onNewMessage(client, data) {
  console.log("in message " + data)
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
    client.terminate()
  }
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