const users = []

const addUser = ({ id, username, room }) => {
    //clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate the data
    if(!username || !room){
        return {
            error: 'Username and room are required'
        }
    }

    //check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    //validate username
    if(existingUser) {
        return {
            error: 'Username is already taken!'
        }
    }

    // Store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}


const removeUser = (id) => {

    //we can also use filter but filter runs even after the match was found but findIndex will stop running once match found
    const index = users.findIndex((user) => {
        return user.id === id
    })

    if(index !== -1){
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    const index = users.find((user) => {
        return user.id === id
    })

    
    return index
}

const getUserInRoom = (room) => {
    const usersInRoom = users.filter((user) => {
        return user.room === room
    })

    if(!usersInRoom){
        return []
    }

    return usersInRoom
}




module.exports = {
    addUser,
    removeUser,
    getUser,
    getUserInRoom
}