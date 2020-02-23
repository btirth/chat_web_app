const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const filer = require('bad-words')
const { generateMessage } = require('./utils/messages')

const app = express();
const server = http.createServer(app)
const io = socketio(server)



const publicDirectoryPath = path.join(__dirname, '../public')
const port = process.PORT || 3000

app.use(express.static(publicDirectoryPath))


// server (emit) -> client (receive) - countUpdated
// client (emit) -> server (receive) - increment
// var count = 0
// io.on('connection', (socket) => {
//     console.log('New Connection')

//     socket.emit('countUpdated', count)

//     socket.on('increment', () => {
//         count++
//         socket.emit('countUpdated', count)
//     })
// })


io.on('connection', (socket) => {
    socket.emit('message', generateMessage('Welcome!'))
    socket.broadcast.emit('message', generateMessage('A new user has joined!'))

    socket.on('sendMsg', (msg, callback) => {
        const filter = new filer()
        
        if(filter.isProfane(msg)){
            return callback('Profanity is not allowed!')
        }

        io.emit('message', generateMessage(msg))
        callback()
    })

    socket.on('disconnect', () => {
        io.emit('message', generateMessage('A user has left!'))
    })

    socket.on('sendLocation', (coords, callback) => {
        io.emit('locationMsg', generateMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })
})

server.listen(port, () => {
    console.log('Server is up on port ' + port)
})