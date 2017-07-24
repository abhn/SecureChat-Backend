const assert = require('chai').assert
const http = require('http')
const rest = require('restler')

var base = 'http://localhost:1337/api/change-password'

suite('change-password API', () => {

	test('should fail for new password.length < 8', (done) => {
		// password not supplied. Bad request
		const user = {
			username: 'test' + Math.random(),
			password: 'oldpassword',
			newpassword: 'smlpswd'
		}
		rest.post(base, {data: user})
			.on(400, (data, response) => {
				done()
			})
	})

	test('should change password', (done) => {
		const user = {
			username: 'test',
			password: 'test4567',
			newpassword: 'test4567'
		}
		rest.post(base, {data: user})
			.on(200, (data, response) => {
				done()
			})
	})

})