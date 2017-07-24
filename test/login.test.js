const assert = require('chai').assert
const http = require('http')
const rest = require('restler')

var base = 'http://localhost:1337/api/login'

suite('login API', () => {

	test('should fail with incorrect credentials', (done) => {
		const user = {
			username: 'test',
			password: 'test1234'
		}
		rest.post(base, {data: user})
			.on(400, (data, response) => {
				done()
			})
	})

	test('should pass with correct credentials', (done) => {
		const user = {
			username: 'test',
			password: 'test4567'
		}
		rest.post(base, {data: user})
			.on(200, (data, response) => {
				assert.match(data.token, /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
				done()
			})
	})

	test('should fail with bad request', (done) => {
		const user = {
			username: 'test',
		}
		rest.post(base, {data: user})
			.on(400, (data, response) => {
				done()
			})
	})

})