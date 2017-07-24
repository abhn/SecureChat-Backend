const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const bodyParser = require('body-parser')


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

const creds = require('./models/creds.js')(app)
const login = require('./routes/login.js')(app)
const register = require('./routes/register.js')(app)

app.get('/', function (req, res) {
  res.json({error: "GET to / isn't supported"})
})

http.listen(3000, function () {
  console.log('listening on *:3000')
})
