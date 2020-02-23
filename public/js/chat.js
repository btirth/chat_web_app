const socket = io()

//Elements
const $form = document.querySelector('#form')
const $formInput = $form.querySelector('input')
const $formButton = $form.querySelector('#msgBtn')
const $formLocationBtn = $form.querySelector('#sendLocation')
const $messages = document.querySelector('#messages')

//Templates
const msgTemplate = document.querySelector('#msgTemplate').innerHTML
const locationTemplate = document.querySelector('#locationTemplate').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    //New message element
    const $newMessage = $messages.lastElementChild

    //Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //height of messages container
    const containerHeight = $messages.scrollHeight
    
    //how far have I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight + newMessageHeight
    }
}

// socket.on('countUpdated', (count) => {
//     console.log(`The count is incremented ${count}`)
// })

// document.querySelector('#increment').addEventListener('click', () => {
//     socket.emit('increment')
// })

socket.on('message', (msg) => {
    console.log(msg)
    const newMessage = Mustache.render(msgTemplate, {
        username: msg.username,
        newMessage: msg.text,
        createdAt: moment(msg.createdAt).format('mm:hha')
    })
    $messages.insertAdjacentHTML('beforeend', newMessage)
    autoscroll()
})


socket.on('locationMsg', (location) => {
    console.log(location)
    const latestLocation = Mustache.render(locationTemplate, {
        username: location.username,
        location: location.text,
        createdAt: moment(location.createdAt).format('mm:hha')
    })
    $messages.insertAdjacentHTML('beforeend', latestLocation)
    autoscroll()
})


socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })

    document.querySelector('#sidebar').innerHTML = html

    console.log(room)
    console.log(users)
})


document.querySelector('#msgBtn').addEventListener('click', (e) => {
    e.preventDefault()
    //disable send button
    $formButton.setAttribute('disabled', 'disabled')

    const msg = document.getElementById('msg').value
    //const msg = e.target.elements.msg.value
    socket.emit('sendMsg', msg, (error) => {
        //enable send button
        $formButton.removeAttribute('disabled')
        $formInput.value = ''
        $formInput.focus()
        
        if(error){
            return console.log(error)
        }

        console.log('The message was delivered!')

        
    })
})

document.querySelector('#sendLocation').addEventListener('click', () => {
    //disable send location button 
    //$formLocationBtn.setAttribute('disabled', 'disabled')
    
    if(!navigator.geolocation){
        //$formLocationBtn.removeAttribute('disabled')
        return alert('Geolocation is not supported by your browser')
    }

    navigator.geolocation.getCurrentPosition((position) => {
        //enable send location button
        //$formLocationBtn.removeAttribute('disabled')

        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            console.log('Location shared!')
        })
    
    })
})


socket.emit('join', { username, room }, (error) => {
    if(error){
        alert(error)
        location.href = '/'
    }    
})