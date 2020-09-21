const socket = io()

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocation = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

const messageTemplate = document.querySelector('#message-template').innerHTML
const urlTemplate = document.querySelector('#url-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const {username,room} = Qs.parse(location.search, {ignoreQueryPrefix:true})
console.log("username", username)
console.log("room", room)



const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate , {
        username:message.username,
        message:message.text,
        createdAt: moment(message.createdAt).format('h:mm a') } )
    $messages.insertAdjacentHTML('beforeend',html)

    // addMsg(message)
})
socket.on('locationMessage', (url) => {
    const html = Mustache.render(urlTemplate , 
        {
            username:url.username,
            url:url.text,
            createdAt: moment(url.createdAt).format('h:mm a') } 
        )
    $messages.insertAdjacentHTML('beforeend',html)

    // addMsg(message)
})
// const sendMsg =  () => {
//     socket.emit('sendMessage',document.getElementById('m').value)
// }

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    $messageFormButton.setAttribute('disabled','disabled')
    socket.emit('sendMessage',document.getElementById('m').value, (error) => {
        if(error) return console.log(error)
        console.log("The message was delivered!")
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value =''
        $messageFormInput.focus()
    })

})

document.querySelector('#send-location').addEventListener('click', (e) => {
    if(!navigator.geolocation){
        return alert('Geo location is not supported by your browser.')
    } 
    $sendLocation.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position) => {
    console.log("position", position)
    socket.emit('sendLocation',{
        latitude:position.coords.latitude,
        longitude: position.coords.longitude
    }, () => {
        addMsg('Location shared')
        $sendLocation.removeAttribute('disabled')
    } )
        
    })
} )

socket.on('roomData', ({room,users}) => {
const html = Mustache.render(sidebarTemplate,{room,users})
document.querySelector('#sidebar').innerHTML = html
})

const addMsg = (msg) => {
    el = document.createElement('li');
    el.innerHTML = msg;
    document.getElementById('messages').appendChild(el);
}
socket.emit('join',{username,room}, (error) => {
    if(error){
        alert(error);
        location.href = '/'
    } 
})