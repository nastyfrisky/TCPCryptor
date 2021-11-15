const net = require('net')
const crypto = require('crypto')
const kuznechik = require('./kuznechikCryptor')

const targetPort = process.argv[2] // Порт сервера
const clientPort = process.argv[3] // Порт для клиентов

// Ключи PKCS1-PEM, закодированные в Base64
const privateKey = "LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpNSUlKS1FJQkFBS0NBZ0VBNWVCMTNFVDE2R09veGVkYi92Vmx4ZXRkam4yOE5PVXNvWnJLdDR0VjFPTnYvZXF0Ckp0V29laHpVclMvcTB3Y2RPdkhxbGtZdnJIb0RlU2xQbXZ3Vys3Z3JmU2NINkMyanJKcWlhT05hdk9ENDJRMEMKNXpPbXVxdXpqV2JzdWZPSVZsWllUdG1EZzdCa05xTFNPYUoxckpGQW02SDZrZlp1blFveWMvK0NXRDUycGNpSgpTMWgrQ1ZrdVZGRDZkZVBQTXVNdW5aN2JKTDNsaXhrRTE5WUY4Nlg4M24xTUR6VlhpS0dzNTRLV3M5bGF6OFBmCmx4aGVnaTdVc1VIVHpKa0k5eWJxRCtoVkxaYW1YNTlKQkFrUGRNZURNV2pqbHRlczZXZFgzN0J4ak51MjdUWDYKeG5tVDZxNjV0bEFQT0JNeUdYKzNLcS9nWit5dUNhWE9mM3BXNk55SHdoZnZIMG9EZFdnYi9QUFpMcjBKRzh3VApaL3lwalFnbGsyc2NPK0lRZjloelBRSFZWc0xEVmVDZys3aDhwcTArYUhqSU5GRnVyUEVYRnNKKzVqMHVjcVRZCkw3VFJiL0k1NEQrbzZkd0ZKeFZ0NGVSZ1JDdS8xOW5ST3htYWdvVU9IZ2h4SWlob0ZHTkZ6eitkdXRVQ0M3SHQKdkIwYmVybU1oUWIxSjZWZ0tBMjhWcWdPVlIwTU83a0s5NXM1UjVhUGRiYmdXNW5BRWtEVEQwOW9jQUQ2VWxsNAoxMmszQkZTbmp5Vm1TeUgxYlZSL1Rvd3N6amxMQTBnZFpFOUwveWRqTTFlVGRwazdKekcxZmRLaW5tcGZJWWM0CmxWM2VEU29HbWYxSGNlUmpxbTk2c2c0aitsbEdiUHFNaW56Y2xhTTNDZFFjK3RkZzduM2NvM3h2WEZNQ0F3RUEKQVFLQ0FnRUE0c2xmZmNCTEdzbTNhQWVvcXhCUEo4UGN1UWN5OXJ4aUc4MHEwWW1WVkVKTjZxUHJ6N1JhVXA2Kwo4MTJpdmk3Mmw0Q3pmeTRmT25ubGsxTStSaGtPVTZpT3Z4b1NvdXpqM1JWeHhTa0lDKytua2Z0VU1lU3pTTmE4CmZYUmRkOWJiV3RJMHJSWEt1ZEQ4RFNyMVhBYjdNUlRjT0s3RkZkdVpwVFM2TWRhU01aenVVUUJXOHc2S3lZNUMKTnN6dFRBRkVHV0FvVFRpNzJyTytFa3pNaW1PTDI2U1dwS25ZcitoZ1ExdTl5V2o4Wk5LNjFON1paNmVURmJ3OQorZUtIb2dJWTVqeHVEdU9YcFRKTFVXdEVEY2NpaUlPTTJ1SXdKbEVCTmdQT25kRGxOYUpPQmhpTEgrUXlHZ1huCkVnWkovWGh5cE5WclQ2SFVNck05d0Nia1lyKy9uSDFqRmM5WTBNS2dSWjRvSi9MZzZqcWt4eGlINFpFQmUrVUUKdTZTREZnUzU2OTZuamJxM0NyZWYwY3hwN3dlZEMwQnlXM281M2tSR2l1M1NndTc3WGl3Q2FiZnlzSnY5MEVkdgp0SHMvN28zZ3phM09IMzdoYVFGOFNVaEtwNXFGcnFQMEFwLzZGQVBCYUxRZ0hXSjRsS21EMUVDYWhOaG15TVg5ClVneWVacVQxSUZpMG1DREgvN2YweXc3b1lZM3lDQStIZjdhT1FwaTlHckhqYXVobldnZWxmOXhrSzlOTU1ONU0KcWVUWHFPVFAvRlJBVDBiZ3JQUjFRZ0xkZVBzMGNYcEpWWnVzWmZXU0MzLzdUODVETjh0d1FRV3hhTi8xekxQSgovSFFRNG9USkgwajRqbHNrTXF2Vks0aW1nSUxBOUdCOVRsU2hPM1dRcm54V1F0SUVtZ0VDZ2dFQkFQemJVTmxrCmxCcFJzeFFkZzl3MUh0QmovNTdXdktZbW03T2lrYVdPaUwvYW1nWnRLTnR3cXFGZzdBYWkvRFdGRVFmVTZjYWkKQkNJd0pDK0s5a1Z1Vndjck5ERXZVZkFXcVpsaklZS1Jad3A2ejFPT1lCT1ZQOXd3ZzY3VHpEUkxHVmw1dWo1NgozVHFkdStIY3RYNkFCZjRUOGk4Z09POFlJVHk3bEwrcjExckwxeDFPeENKb29yQVZBRjBId01lSkVqRnlTdGJxClpZZTdNU3A5WTM5R0QxdGUyTExIS2w4ZHJLZVlrMStMdSs4cGxBWUtQbnBvdjFhZWd5ZzhGVzZNZzl5TWVPWncKRDFPT2FjczFNWTVtRXp1VHY5eXdQSlZWVGFyajZPUC9VMHlkNjBGbG9yWUxBcWxYQVZNQWUxaVA1WHlSS29vbQpLN0dYTTRmeEVZbUgwR01DZ2dFQkFPaThBNU1lcURnTmRVekg1MmZPeGFHMGYxVEZsK3JkM1BnRWJnQlpFN1pqClVWc1oyOEpIdzFKd2dOemNINS9PcGhCYmdyTlU2RW4xanJHWDJBSnNycnI3dnZNQ09GMTVhV1FOVGwvaXMzc0IKaGVIUmhHekNQa1BoNVRrSnlYZDRqVzZZR2ZnNGxPTFBMS1VhKzdkRjUrUlRxTnNlVTRkS25Va1pFQ3IzZzlodwpMMjl0TUY3Z1MxcXo4UWpSekgvY2Q0YmhyeWloeTVrRlB1bmV0aGVsOG52c3FUaFNQTUNrMHZwcllURDVPdVNGCjU3dlFWa3Y4UENrc29oeVdnZWQ1TE82L1dqRkYzQlUrUUljNStzSjdmWUVlVWsvT0NjZVcwemxjSmw1WUx6dE0KT1dBSTdsTGtoWmUwU1FLakpWZGF1VVNLOCs3K2lhQUJ0MXlIaXZLTzcxRUNnZ0VBRHlMRnRTMnJHK1EyRndjcApSSDQ5aVBYamNFdWtZVUhBWWtGaC9Jb0tyNGxUWFAwZHkvenppZE4yYlhOR0s2SDZnZ0NCdWUwcTJDMFBqWFVCCkJ1ank5cS9rWU9sWE8wcnYvZ21NRVBmSk5qeGh1cnUwRHBnSmlaR3g0RDQzWkEzMngzOWM0YTZUSFpZaGtBU1oKTEtoWE0zMVlLdS8vMkhnV1RUOWhTUlB0UVRjZ2VsV2pzZmVYZlhqVVc3MUNFZStua2lRb1RMTWRQc0c2MExOTwp5R2lXTkw3NXM4SHVUR0ZIVzRUcmxYV1UyMTBleWpuRXdha1Jnd3JjQ1FXSHR1VmNZMUJaVUZuMjRPYU9lS2FICmYrR21WeE9pRVlEUEw1VTZuL2Npa3J0TzdqQXB5L0ZjaXc4ZnFxbFZuL1ZRYk4yNE8vdW9renB6dFI2NjYvRkgKUG5kTnh3S0NBUUVBalFTUExlK2ZnZ2Mxa2daMmdvSFpZamZhQjJXS3ZYY2RVdkpzTEszTXNmRFA5T0ZnTlFJQwpxY3NkYWJXL083ZWRDOEJIRzU1USthOWVmT0ZDczRWakFrMVQwQzhDTkRGQzJLcnZXRTRtN2x0bjRnSnZ1TzZoCmg4UXlmak1kN2RRUDdua2ZFelpGa0lCenpyN2cwcFg3QW5CbW1nNXdFa1AxdGJzSC91RG05SmhWUmJEbFpEZUgKc1RmaXpyTkF0Q0RFRStoZmw4RWhlbUNoVkZmc0FidzloelZJKzZWb3hsbVl0TCtucm1MMWVrNWdzWDUxSzZsMApVb2FHMjhlZWdzRDdwdFl2TWpmZ09NYjFsbnBkSk1acXIzZk43Q2t0NTgvTndLM0RXZHNaRTFjR1ZOaFVmOG1UCjRPNE9aeGl2b1pTSk9hendUVm5SemkvOENJYmdmRVI3WVFLQ0FRQm9XRUJMRW44cW8yWW0wdnVJVUZ6K0VGV1EKUWFYQ3dUd3dIS1o3c0s2ek9PQy9uQ0RkR09iYmEzOU15MHFTZnN6Qk9lTUhkTVQrS3RHNmJZZjE4RWowM2VKZApRKzhxZUV5WmlXYkVsUUd2c29FRUdvVGVPK2hYamROaGVybHdrTlBRRzZrbkt2bVZscHVWQXJtM3h6QzloVVZaClNKclI2SStONloycFlpMUlqTWs3ZU1nYTlJdHBRbGx1VWlMVlJFTkV6M0NhdFZ3UHQ4SUpUN3RyZlo3UUk3cmsKVGdneGNOdTZ5emRhRTd3YUk2WE1zYVlFbnMvT0lSV0Iva1k4R1NnSE1zaEg4OTNMMm13bWp4VXVScWFGMXkrbApCM2pkOHNPSmx2b2ljblUvZ0hiQ2lsblJha3Vmc3I5SWpVdmNHd3h0YjBVSk1EeHVvbjB3U2dDd0k2Z1cKLS0tLS1FTkQgUlNBIFBSSVZBVEUgS0VZLS0tLS0K"

// Длина зашифрованного общего ключа
const encryptedKeyLength = 512

let ConnectionState = {
	WAITING_KEY: 0,
	CONNECTING_TO_TARGET: 1,
	TRANSMITTING: 2,
	WAITING_TARGET: 3,
}

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

function makeConnection(socket) {
	let connectionId = Math.floor(Math.random() * 1000)
	
	let connection = {
		socket: socket,
		state: ConnectionState.WAITING_KEY,
		inputBuffer: Buffer.alloc(0),
		onData: data => {
			console.log('Connection onData ' + connectionId)
			connection.inputBuffer = Buffer.concat([connection.inputBuffer, data])
			connection.handleInput()
		},
		onEnd: () => {
			if(connection.targetServerSocket != null) { connection.targetServerSocket.destroy() }
		},
		handleInput: () => {
			if(connection.state == ConnectionState.WAITING_KEY && connection.tryExtractKey()) {
				console.log('Connection key extraction success')
				connection.state = ConnectionState.CONNECTING_TO_TARGET
			}
			
			if(connection.state == ConnectionState.CONNECTING_TO_TARGET) {
				console.log('CONNECTING TO TARGET')
				connection.connectToTarget()
				connection.state = ConnectionState.WAITING_TARGET
			}
			
			if(connection.state == ConnectionState.TRANSMITTING) {
				console.log('TRANSMITTING C -> S')
				while(connection.processInputBuffer());
			}
		},
		tryExtractKey: () => {
			if(connection.inputBuffer.length < encryptedKeyLength) { return false }
			console.log('Key received! Extracting...')
			let encryptedKeyData = connection.inputBuffer.subarray(0, encryptedKeyLength)
			console.log(encryptedKeyData.toString('hex'))
			
			console.log('dataLength = ' + encryptedKeyData.length)
			
			let decryptedKeyData = crypto.privateDecrypt(Buffer.from(privateKey, 'base64'), encryptedKeyData)
			connection.sharedKey = decryptedKeyData.subarray(0, 32)
			
			connection.inputBuffer = connection.inputBuffer.subarray(encryptedKeyLength, connection.inputBuffer.length)
			return true
		},
		processInputBuffer: () => {
			var pos = 0
			if(connection.inputBuffer.length < 2) { return false }
			
			let dataLength = connection.inputBuffer[pos] * 256 + connection.inputBuffer[pos + 1];
			pos += 2
			
			if(connection.inputBuffer.length - pos < dataLength) { return false }
			
			let encryptedData = connection.inputBuffer.subarray(pos, pos + dataLength)
			pos += dataLength
			
			connection.targetServerSocket.write(decryptData(encryptedData, connection.sharedKey))
			
			connection.inputBuffer = connection.inputBuffer.subarray(pos, connection.inputBuffer.length)
			
			console.log("Sended packet C -> S")
			
			return true
		},
		connectToTarget: () => {
			connection.targetServerSocket = net.connect(targetPort, '127.0.0.1', () => {
				console.log("Connected to target!")
				connection.state = ConnectionState.TRANSMITTING
				connection.handleInput()
			})
			
			connection.targetServerSocket.on('data', (data) => {
				console.log('TRANSMITTING S -> C')
				let encryptedData = encryptData(data, connection.sharedKey)
				let packet = makePacket(encryptedData)
				connection.socket.write(packet)
			})
			
			connection.targetServerSocket.on('end', () => {
				connection.socket.end()
			})
			
			connection.targetServerSocket.on('error', () => {
				console.log('Error connecting to target!')
				connection.socket.end()
			})
		},
		sharedKey: null,
		targetServerSocket: null,
	}
	
	socket.on('data', (data) => { connection.onData(data) })
	socket.on('end', () => { connection.onEnd() })
	socket.on('error', () => {})
	
	console.log('Connection created ' + connectionId)
	return connection
}

let serverSocket = net.createServer(socket => {
	makeConnection(socket)
})

serverSocket.listen(clientPort)