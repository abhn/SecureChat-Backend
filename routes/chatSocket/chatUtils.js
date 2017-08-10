function chatUtils(client, message, token, newMessage, error, userSocketList, connectInt) {
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
		case "connect":
			connectInt(client, data.username, data.token, data.friend)
		default:
			error(client)
			break
	}
}

module.exports = chatUtils