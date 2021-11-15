const net = require('net')
const crypto = require('crypto')
const kuznechik = require('./kuznechikCryptor')

const serverHost = process.argv[2] // IP адрес сервера
const serverPort = process.argv[3] // Порт сервера
const clientPort = process.argv[4] // Порт подключения для клиента

function encryptData(data, key) {
	kuznechik.setupKey(key)
	
	var encryptedData = Buffer.alloc(0)
	let blocksCount = Math.floor(data.length / 16)
	for(var i = 0; i < blocksCount; i++) {
		let currentBlock = data.subarray(i * 16, (i + 1) * 16)
		let encryptedBlock = kuznechik.encrypt(currentBlock)
		encryptedData = Buffer.concat([encryptedData, encryptedBlock])
	}
	
	let bytesLeft = data.length % 16
	if(bytesLeft != 0) {
		let lastBlock = data.subarray(data.length - bytesLeft, data.length)
		let lastBlockAppended = Buffer.concat([lastBlock, Buffer.alloc(16 - bytesLeft)])
		let encryptedBlock = kuznechik.encrypt(lastBlockAppended)
		encryptedData = Buffer.concat([encryptedData, encryptedBlock])
	}
	
	let lastBlockSizeByteBuffer = Buffer.from([bytesLeft])
	return Buffer.concat([lastBlockSizeByteBuffer, encryptedData])
}

function decryptData(encryptedData, key) {
	kuznechik.setupKey(key)
	
	var decryptedData = Buffer.alloc(0)
	let extraBlockSize = encryptedData[0]
	let enctyptedBlocks = encryptedData.subarray(1)
	
	let blocksCount = Math.floor(enctyptedBlocks.length / 16)
	for(var i = 0; i < blocksCount; i++) {
		let currentBlock = enctyptedBlocks.subarray(i * 16, (i + 1) * 16)
		let decryptedBlock = kuznechik.decrypt(currentBlock)
		decryptedData = Buffer.concat([decryptedData, decryptedBlock])
	}
	
	if(extraBlockSize != 0) {
		decryptedData = decryptedData.subarray(0, decryptedData.length - (16 - extraBlockSize))
	}
	
	return decryptedData
}

function makePacket(data) {
	let sizeBuffer = Buffer.from([data.length / 256, data.length % 256]);
	return Buffer.concat([sizeBuffer, data])
}

// Ключи PKCS1-PEM, закодированные в Base64
const publicKey = "LS0tLS1CRUdJTiBSU0EgUFVCTElDIEtFWS0tLS0tCk1JSUNDZ0tDQWdFQTVlQjEzRVQxNkdPb3hlZGIvdlZseGV0ZGpuMjhOT1Vzb1pyS3Q0dFYxT052L2VxdEp0V28KZWh6VXJTL3Ewd2NkT3ZIcWxrWXZySG9EZVNsUG12d1crN2dyZlNjSDZDMmpySnFpYU9OYXZPRDQyUTBDNXpPbQp1cXV6aldic3VmT0lWbFpZVHRtRGc3QmtOcUxTT2FKMXJKRkFtNkg2a2ZadW5Rb3ljLytDV0Q1MnBjaUpTMWgrCkNWa3VWRkQ2ZGVQUE11TXVuWjdiSkwzbGl4a0UxOVlGODZYODNuMU1EelZYaUtHczU0S1dzOWxhejhQZmx4aGUKZ2k3VXNVSFR6SmtJOXlicUQraFZMWmFtWDU5SkJBa1BkTWVETVdqamx0ZXM2V2RYMzdCeGpOdTI3VFg2eG5tVAo2cTY1dGxBUE9CTXlHWCszS3EvZ1oreXVDYVhPZjNwVzZOeUh3aGZ2SDBvRGRXZ2IvUFBaTHIwSkc4d1RaL3lwCmpRZ2xrMnNjTytJUWY5aHpQUUhWVnNMRFZlQ2crN2g4cHEwK2FIaklORkZ1clBFWEZzSis1ajB1Y3FUWUw3VFIKYi9JNTREK282ZHdGSnhWdDRlUmdSQ3UvMTluUk94bWFnb1VPSGdoeElpaG9GR05GenorZHV0VUNDN0h0dkIwYgplcm1NaFFiMUo2VmdLQTI4VnFnT1ZSME1PN2tLOTVzNVI1YVBkYmJnVzVuQUVrRFREMDlvY0FENlVsbDQxMmszCkJGU25qeVZtU3lIMWJWUi9Ub3dzempsTEEwZ2RaRTlML3lkak0xZVRkcGs3SnpHMWZkS2lubXBmSVljNGxWM2UKRFNvR21mMUhjZVJqcW05NnNnNGorbGxHYlBxTWluemNsYU0zQ2RRYyt0ZGc3bjNjbzN4dlhGTUNBd0VBQVE9PQotLS0tLUVORCBSU0EgUFVCTElDIEtFWS0tLS0tCg=="

function makeConnection(socket) {
	let connectionId = Math.floor(Math.random() * 1000)
	console.log('Client connected! ' + connectionId)
	
	let sharedKey = crypto.randomBytes(32)
	
	console.log('Shared key = ' + sharedKey.toString('hex'))

	let encryptedKey = crypto.publicEncrypt(Buffer.from(publicKey, 'base64'), sharedKey)
	
	let connection = {
		socket: socket,
		targetServerSocket: null,
		onData: (data) => {
			console.log('Connection onData')
			connection.inputBuffer = Buffer.concat([connection.inputBuffer, data])
			if(connection.targetServerSocket !== null) { connection.handleInput() }
		},
		onEnd: () => {
			
		},
		handleInput: () => {
			let encryptedData = encryptData(connection.inputBuffer, sharedKey)
			let packet = makePacket(encryptedData)
			targetServerSocket.write(packet)
			connection.inputBuffer = Buffer.alloc(0)
		},
		inputBuffer: Buffer.alloc(0),
	}
	
	socket.on('data', (data) => { connection.onData(data) })
	socket.on('end', () => { connection.onEnd() })
	socket.on('error', () => {})
	
	let targetServerSocket = net.connect(serverPort, serverHost, () => {
		console.log('Sending sharedKey to ' + connectionId + ' (' + encryptedKey.length + ' bytes)')
		
		console.log(encryptedKey.toString('hex'))
		
		targetServerSocket.write(encryptedKey)
		connection.targetServerSocket = targetServerSocket
		connection.handleInput()
	})
	
	var targetInputBuffer = Buffer.alloc(0)
	targetServerSocket.on('data', (data) => {
		console.log('Data from target server')
		targetInputBuffer = Buffer.concat([targetInputBuffer, data])
		while(processTargetInputBuffer());
	})
	
	targetServerSocket.on('end', () => { connection.socket.destroy() })
	
	targetServerSocket.on('error', () => { connection.socket.destroy() })
	
	let processTargetInputBuffer = () => {
		var pos = 0
		if(targetInputBuffer.length < 2) { return false }
		
		let dataLength = targetInputBuffer[pos] * 256 + targetInputBuffer[pos + 1];
		pos += 2
		
		if(targetInputBuffer.length - pos < dataLength) { return false }
		
		let encryptedData = targetInputBuffer.subarray(pos, pos + dataLength)
		pos += dataLength
		
		connection.socket.write(decryptData(encryptedData, sharedKey))
		
		targetInputBuffer = targetInputBuffer.subarray(pos, targetInputBuffer.length)
		
		return true
	}
	
	return connection
}

let serverSocket = net.createServer(socket => {
	makeConnection(socket)
})

serverSocket.listen(clientPort)
