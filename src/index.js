const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')

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
    socket.emit('message', 'Welcome!')

    socket.on('sendMsg', (msg) => {
        io.emit('message', msg)
    })
})

server.listen(port, () => {
    console.log('Server is up on port ' + port)
})