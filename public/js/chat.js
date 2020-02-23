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

//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })



// socket.on('countUpdated', (count) => {
//     console.log(`The count is incremented ${count}`)
// })

// document.querySelector('#increment').addEventListener('click', () => {
//     socket.emit('increment')
// })

socket.on('message', (msg) => {
    console.log(msg)
    const newMessage = Mustache.render(msgTemplate, {
        newMessage: msg.text,
        createdAt: moment(msg.createdAt).format('mm:hha')
    })
    $messages.insertAdjacentHTML('beforeend', newMessage)
})


socket.on('locationMsg', (location) => {
    console.log(location)
    const latestLocation = Mustache.render(locationTemplate, {
        location: location,
        createdAt: moment(location.createdAt).format('mm:hha')
    })
    $messages.insertAdjacentHTML('beforeend', latestLocation)
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