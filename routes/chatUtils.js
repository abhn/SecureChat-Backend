function chatUtils(client, message, token, newMessage, error) {
	let formattedMessage
	try {
		formattedMessage = JSON.parse(message)
	} catch(e) {
		console.log("fishy" + e)
		return null
	}


	const op = formattedMessage.op
	const data = formattedMessage.data

	console.log(op)

	switch(op) {
		case "new message":
			console.log('new message case')
			newMessage(client, data)
			break
		case "token":
			console.log('token case')
			token(client, data.token)
			break
		default:
			error(client)
			break
	}

}

module.exports = chatUtils