const User = require('../../models/user.js')
const userAuth = require('./../lib/userAuth.js')
const chatUtils = require('./chatUtils.js')
const getKeyByValue = require('../lib/getKeyByValue.js')

let userSocketList = {}

function chat(io) {
  io.on('connection', (client) => {
    client.on('message', (message) => {
      // our little mini router
      console.log(message)
      chatUtils(client, message, onToken, onNewMessage, onError, userSocketList)
    })

    client.on('close', () => {
      if(getKeyByValue(userSocketList, client)) {
        console.log(getKeyByValue(userSocketList, client) + ' disconnected')
        delete userSocketList[getKeyByValue(userSocketList, client)]
      }
    })
  })
}

function onError(client) {
  if(getKeyByValue(userSocketList, client)) {
    console.log(getKeyByValue(userSocketList, client) + ' disconnected')
    delete userSocketList[getKeyByValue(userSocketList, client)]
  }
}

function onToken(client, token, userSocketList) {
  try {
    userAuth(token, (authorizedUser) => {
      if (authorizedUser) {
        userSocketList[authorizedUser] = client
        console.log(authorizedUser + " connected")
      } else {
        client.send(JSON.stringify({"error": "not authorized"}))  
      }
    })
  } catch (e) {
    console.log(e)
    client.send(JSON.stringify({"error": "Internal server error"}))  
  }
}

function onNewMessage(client, data, userSocketList) {
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

module.exports = chat