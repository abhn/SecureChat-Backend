function chatUtils(client, message, token, newMessage, error, userSocketList) {
	let formattedMessage
	try {
		formattedMessage = JSON.parse(message)
	} catch(e) {
		return null
	}

	const op = formattedMessage.op
	const data = formattedMessage.data

	switch(op) {
		case "new message":
			newMessage(client, data, userSocketList)
			break
		case "token":
			token(client, data.token, userSocketList)
			break
		default:
			error(client)
			break
	}
}

module.exports = chatUtils