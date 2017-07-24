const mongoose = require('mongoose')
const mongoUser = process.env.MONGO_USER
const mongoPass = process.env.MONGO_PASS

const mongo = {
  development: {
    connectionString: 'mongodb://' + mongoUser + ':' + mongoPass + '@ds027739.mlab.com:27739/securechat-test'
  },
  production: {
    // not now
    connectionString: 'mongodb://' + mongoUser + ':' + mongoPass + '@ds117913.mlab.com:17913/securechat'
  }
}

const opts = {
  server: {
    socketOptions: {
      keepAlive: 1
    }
  }
}

module.exports = function (app) {
  switch (app.get('env')) {
    case 'development':
      mongoose.connect(mongo.development.connectionString, opts)
      break
    case 'production':
      mongoose.connect(mongo.development.connectionString, opts)
      break
    default:
      throw new Error('Unknown execution environment: ' + app.get('env'))
  }
}
