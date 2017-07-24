const assert = require('chai').assert
const http = require('http')
const rest = require('restler')

var base = 'http://localhost:1337/api/register'

suite('register API', () => {

	test('should fail on duplicate username registration', (done) => {
		const user = {
			username: 'test',
			password: 'test1234'
		}
		rest.post(base, {data: user})
			.on(409, (data, response) => {
				done()
			})
	})

	test('should pass on new user registraton', (done) => {

		const user = {
			username: 'test' + Math.random(),
			password: 'test1234'
		}
		rest.post(base, {data: user})
			.on(201, (data, response) => {
				done()
			})
	})

	test('should fail on bad request', (done) => {
		// password not supplied. Bad request
		const user = {
			username: 'test' + Math.random(),
		}
		rest.post(base, {data: user})
			.on(400, (data, response) => {
				done()
			})
	})

	test('should fail for password.length < 8', (done) => {
		// password not supplied. Bad request
		const user = {
			username: 'test' + Math.random(),
			password: 'smlpswd'
		}
		rest.post(base, {data: user})
			.on(400, (data, response) => {
				done()
			})
	})

})