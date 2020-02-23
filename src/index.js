//socket.emit = emit msg for specific user/socket
//io.emit = emit msg for all user
//socket.broadcast.emit = emit msg for all other user except specific user/socket
//io.to.emit = emit msg for all user limited by specific room
//socket.broadcast.to.emit = same as socket.broadcast.emit but limited by room



const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const filer = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUserInRoom } = require('./utils/users')


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
    
    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room })
        if(error){
            return callback(error)
        }



        socket.join(user.room)
        socket.emit('message', generateMessage('Admin','Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUserInRoom(user.room)
        })
        callback()
    })

    socket.on('sendMsg', (msg, callback) => {
        const user = getUser(socket.id)
        const filter = new filer()
        
        if(filter.isProfane(msg)){
            return callback('Profanity is not allowed!')
        }

        
            io.to(user.room).emit('message', generateMessage(user.username, msg))
        
        
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(id = socket.id)
        
        if(user){
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUserInRoom(user.room)
            })
        }

        
    })

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)

        io.to(user.room).emit('locationMsg', generateMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })
})

server.listen(port, () => {
    console.log('Server is up on port ' + port)
})