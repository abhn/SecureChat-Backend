function chatUtils(client, message, newMessage, token, error) {
	let formattedMessage
	try {
		formattedMessage = JSON.parse(message)
	} catch(e) {
		console.log("fishy" + e)
		return null
	}


	const op = formattedMessage.op
	const data = formattedMessage.data

	console.log("break point 1" + op + " " + data)

	switch(op) {
		case "new message":
			newMessage(client, data)
			break
		case "token":
			token(client, data.token)
			break
		default:
			error(client)
			break
	}

}

module.exports = chatUtils