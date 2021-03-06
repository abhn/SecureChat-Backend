const User = require('../../models/user.js')
const Chat = require('../../models/chat.js')
const userAuth = require('./../lib/userAuth.js')
const chatUtils = require('./chatUtils.js')
const getKeyByValue = require('../lib/getKeyByValue.js')
const isUserBlocked = require('./isUserBlocked.js')

let userSocketList = {}

function chat(io) {
  io.on('connection', (client) => {

    console.log('new client connected')
    
    client.on('message', (message) => {
      // our little mini router
      console.log(message)
      chatUtils(client, message, onToken, onNewMessage, onError, userSocketList, connectInt, connectAck, leaveChat)
    })

    client.on('close', () => {

      console.log('client disconnected')

      if(getKeyByValue(userSocketList, client)) {
        console.log(getKeyByValue(userSocketList, client) + ' disconnected')

        let clientUser = getKeyByValue(userSocketList, client)

        Chat.findOne({$or: [
          {username1: clientUser}, 
          {username2: clientUser}
        ]})
        .exec((err, doc) => {
          if(err) {
            client.send(JSON.stringify({
              'res': 'internal server error'
            }))
            return
          }

          if(doc) {
            console.log('removing...')
            console.log(doc)
            doc.remove()
          }
        })      

        delete userSocketList[getKeyByValue(userSocketList, client)]
      }
    })
  })
}

function onError(client) {

  console.log('onerror')
  
  if(getKeyByValue(userSocketList, client)) {
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
        client.send(JSON.stringify({
          'res': 'username-token mismatch'
        }))  
      }
    })
  } catch (e) {
    console.log(e)
    client.send(JSON.stringify({
      'res': 'internal server error'
    }))  
  }
}

function onNewMessage(client, data, userSocketList) {
  const username = data.username
  const friend = data.friend
  const token = data.token
  const message = data.message



  console.log('new message -->')
  console.log(data)

  userAuth(token, (authorizedUser) => {
    if(userSocketList[username] && username === authorizedUser) {
      if(userSocketList[friend]) {
        userSocketList[friend].send(JSON.stringify({
          'res': 'received message',
          'data': message
        }))
      } else {
        client.send(JSON.stringify({
          'res': 'no such user',
          'data': friend
        }))
      }
    } else {
      // kick client
      client.send(JSON.stringify({
        'res': 'username-token mismatch'
      }))
      if(userSocketList[username]) {
        delete userSocketList[username]
      }
      client.terminate()
    }
  })
}

function connectInt(client, username, token, friend) {
  console.log('connect: ' + username + ':' + friend)
  userAuth(token, (authorizedUser) => {
    if(userSocketList[username] && authorizedUser === username) {
      if(userSocketList[friend]) {
        // first check if the user is blocked

        Chat.findOne({$or: [
          {username1: friend}, 
          {username2: friend}
        ]})
        .exec((err, doc) => {
          if(err) {
            client.send(JSON.stringify({
              'res': 'internal server error'
            }))
            return
          }

          if(doc) {
            // check if the request is never answered
            if(doc.pending === 1 && doc.initiated + 3600000 < (new Date()).getTime()) {
              // friend is free
              console.log('friend free')
              doc.remove()
              initNewChatReq(username, friend, 1, (new Date()).getTime())
              userSocketList[friend].send(JSON.stringify({
                'res': 'connect',
                'data': username
              }))            
            }

            else if(doc.pending === 1 && doc.initiated + 3600000 > (new Date()).getTime()) {
              // friend is waiting 
              console.log('friend waiting')
              client.send(JSON.stringify({
                'res': 'client busy',
                'data': friend
              }))
            }
            else if(doc.pending === 0) {
              // friend is chatting
              console.log('friend chatting')
              client.send(JSON.stringify({
                'res': 'client busy',
                'data': friend
              }))
            }
          }
          else {
            // no doc, first time chat, friend free
            console.log('first time connect request')
            initNewChatReq(username, friend, 1, (new Date()).getTime())
            userSocketList[friend].send(JSON.stringify({
              'res': 'connect',
              'data': username
            }))
          }
        })

      } 
      else {
        client.send(JSON.stringify({
          'res': 'no such user',
          'data':friend
        }))
      }
    }
    else {
      // auth failed
      client.send(JSON.stringify({
        'res': 'username-token mismatch',
      }))
    }
  })
}

function connectAck(client, username, token, friend, reply) {

  console.log('connect ack: ' + username + ':' + friend + ':' + reply)

  userAuth(token, (authorizedUser) => {
    if(userSocketList[username] && authorizedUser === username) {
      if(userSocketList[friend]) {
        // user exists
        switch(reply) {
          case "a":
            Chat.findOne({$or: [
              {username1: friend}, 
              {username2: friend}
            ]})
            .exec((err, doc) => {
              if(err) {
                client.send(JSON.stringify({
                  'res': 'internal server error'
                }))
                return
              }
              doc.pending = 0
              doc.save((err, a) => {
                if (err) {
                  client.send(JSON.stringify({
                    'res': 'internal server error'
                  }))
                }
                else {
                  userSocketList[friend].send(JSON.stringify({
                    'res': 'connect confirm',
                    'data': username
                  }))
                }
              })
            })
          break

          case "r":
            Chat.findOne({$or: [
              {username1: friend}, 
              {username2: friend}
            ]})
            .exec((err, doc) => {
              if(err) {
                client.send(JSON.stringify({
                  'res': 'internal server error'
                }))
                return
              }
              doc.remove()
              userSocketList[friend].send(JSON.stringify({
                'res': 'connect confirm rejected',
                'data': username
              }))
            })
          break

          default:
            client.send(JSON.stringify({
              'res': 'invalid option'
            }))
          break
        }
      } 
      else {
        client.send(JSON.stringify({
          'res': 'no such user',
          'data': friend
        }))
      }
    }
    else {
      // auth failed
      client.send(JSON.stringify({
        'res': 'username-token mismatch'
      }))
    }
  })
}

function leaveChat(client, username, token, friend) {
  userAuth(token, (authorizedUser) => {
    if(userSocketList[username] && authorizedUser === username) {
      console.log(username + ' left chat')
      // implement leave
      Chat.findOne({$or: [
        {username1: friend}, 
        {username2: friend}
      ]})
      .exec((err, doc) => {
        if(err) {
          client.send(JSON.stringify({
            'res': 'internal server error'
          }))
          return
        }
        console.log('leaving...')
        console.log(doc)
        doc.remove()
        userSocketList[friend].send(JSON.stringify({
          'res': 'friend left chat',
          'data': username
        }))
      })
    }
  })
}

function initNewChatReq(username, friend, pending, initiated) {
  const newChat = new Chat({
    username1: username,
    username2: friend,
    pending: pending,
    initiated: initiated
  })
  newChat.save((err, a) => {
    if (err) {
      client.send(JSON.stringify({
        'res': 'internal server error'
      }))
    }
  })
}

module.exports = chat