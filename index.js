const express = require('express')
const app = express()
const http = require('http')
const https = require('https')
const bodyParser = require('body-parser')
const fs = require('fs')

const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 7331 });

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

const creds = require('./models/creds.js')(app)
const login = require('./routes/login.js')(app)
const register = require('./routes/register.js')(app)
const changePassword = require('./routes/changePassword.js')(app)
const blockUser = require('./routes/blockUser.js')(app)
const chat = require('./routes/chatSocket/chat.js')(wss)

app.get('*', function (req, res) {
  res.json({error: "Not supported"})
})

if (app.get('env') == 'production') {
  var options = {
    key: fs.readFileSync('/etc/letsencrypt/live/l-a.me/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/l-a.me/fullchain.pem')
  }
  https.createServer(options, app).listen(1337, function() {
    console.log( 'Express started in ' + app.get('env') +
        ' mode; press Ctrl-C to terminate.' )
  })
} else {
  http.createServer(app).listen(1337, function() {
    console.log( 'Express started in ' + app.get('env') +
        ' mode; press Ctrl-C to terminate.' )
  })
}

